import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/UserModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const extractPublicIdFromUrl = (url) => {
    const parts = url.split("/");
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];
    return publicId;
};


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if required environment variables exist
        if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            throw new Error("JWT secrets not configured");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token generation error:", error.message);
        throw new ApiError(500, "Token generation failed: " + error.message);
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user data from frontend
    const { fullName, email, username, password } = req.body;    // validation - not empty
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        res.status(400);
        throw new ApiError(400, "Please fill all fields");
    } else if (!email.includes("@")) {
        res.status(400);
        throw new ApiError(400, "Invalid email");
    }

    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    }); if (existedUser) {
        res.status(409);
        throw new ApiError(409, "User already exists");
    }

    // check for files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        res.status(400);
        throw new ApiError(400, "Please upload avatar");
    }
    // upload them to cloudinary, check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        res.status(500);
        throw new ApiError(500, "Avatar upload failed");
    }

    // create user object create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        username: username.toLowerCase(),
        password,
    });

    // remove password and refresh token feild from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // check for user creation response
    if (!createdUser) {
        res.status(500);
        throw new ApiError(500, "User creation failed");
    }    // return response
    res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // get userdata from frontend
    const { email, username, password } = req.body;
    // Validate data
    if (!(email || username)) {
        throw new ApiError(400, "Username or Email is required");
    }
    // Check if user exists
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }
    // Create token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // Send cookies and response
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, user: loggedInUser, refreshToken },
                "User logged in successfully"
            )
        );
});
const GoogleLogin = asyncHandler(async (req, res) => {
    // get userdata from frontend
    const { email, displayName, photoURL, uid } = req.body;
    
    // Validate data
    if (!email || !uid) {
        throw new ApiError(400, "Email and UID are required from Google login");
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
        // Upload Google profile photo to Cloudinary if available
        let avatarUrl = "";
        if (photoURL) {
            try {
                // Download and upload the Google photo to Cloudinary
                const avatar = await uploadOnCloudinary(photoURL);
                if (avatar) {
                    avatarUrl = avatar.url;
                }
            } catch (error) {
                console.error("Avatar upload failed:", error);
                // Continue without avatar if upload fails
            }
        }
        
        // Create new user for Google login
        const username = email.split('@')[0] + '_' + uid.slice(0, 6); // Generate unique username
        
        user = await User.create({
            fullName: displayName || "Google User",
            avatar: avatarUrl,
            email,
            username: username.toLowerCase(),
            password: uid, // Use UID as password for Google users
            isGoogleUser: true // Add this field to identify Google users
        });
    }
   
    // Create token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    
    // Send cookies and response
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, user: loggedInUser, refreshToken },
                "Google login successful"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // Clear cookies
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incommingRefreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }
    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(400, "Refresh token is Invalid");
        }
        if (incommingRefreshToken !== user.refreshToken) {
            throw new ApiError(400, "Refresh token is Invalid");
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, newRefreshToken },
                    "Token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(400, "Refresh token is Invalid");
    }
});

export {
    registerUser,
    loginUser,
    GoogleLogin,
    logoutUser,
    refreshAccessToken,
};