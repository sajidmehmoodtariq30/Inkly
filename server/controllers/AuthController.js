import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/UserModel.js";
import { Category } from "../models/CategoryModel.js";
import { Article } from "../models/ArticleModel.js";
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
    const { 
        fullName, 
        email, 
        username, 
        password,
        bio,
        location,
        profession,
        newsletter,
        profileVisibility,
        twitterUrl,
        linkedinUrl,
        githubUrl,
        websiteUrl
    } = req.body;// validation - not empty
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
    }    // create user object create entry in db
    const userObj = {
        fullName,
        avatar: avatar.url,
        email,
        username: username.toLowerCase(),
        password,
        signupSource: 'email'
    };

    // Add optional fields if provided
    if (bio) userObj.bio = bio;
    if (location) userObj.location = location;
    if (profession) userObj.profession = profession;
    if (profileVisibility) userObj['preferences.profileVisibility'] = profileVisibility;
    if (newsletter !== undefined) userObj['preferences.newsletter'] = newsletter === 'true';
    
    // Add social links if provided
    if (twitterUrl || linkedinUrl || githubUrl || websiteUrl) {
        userObj.socialLinks = {};
        if (twitterUrl) userObj['socialLinks.twitter'] = twitterUrl;
        if (linkedinUrl) userObj['socialLinks.linkedin'] = linkedinUrl;
        if (githubUrl) userObj['socialLinks.github'] = githubUrl;
        if (websiteUrl) userObj['socialLinks.website'] = websiteUrl;
    }

    const user = await User.create(userObj);

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
    }    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
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
            password: uid, // Use UID as password for Google users            isGoogleUser: true // Add this field to identify Google users
        });
    }
   
    // Update last login time
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
   
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

const getCurrentUser = asyncHandler(async (req, res) => {
    // Get current user data (req.user is set by verifyJWT middleware)
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "User profile fetched successfully"
            )
        );
});

const updateUser = asyncHandler(async (req, res) => {
    const { 
        fullName, 
        username, 
        bio,
        location,
        profession,
        profileVisibility,
        emailNotifications,
        pushNotifications,
        newsletter,
        twitterUrl,
        linkedinUrl,
        githubUrl,
        websiteUrl
    } = req.body;
    
    // Get the current user
    const userId = req.user._id;
    
    // Validate input data
    if (!fullName?.trim() && !username?.trim() && bio === undefined && 
        !location && !profession && !profileVisibility &&
        emailNotifications === undefined && pushNotifications === undefined && 
        newsletter === undefined && !twitterUrl && !linkedinUrl && 
        !githubUrl && !websiteUrl) {
        throw new ApiError(400, "At least one field is required to update");
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (fullName?.trim()) updateData.fullName = fullName.trim();
    if (username?.trim()) updateData.username = username.trim().toLowerCase();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (profession !== undefined) updateData.profession = profession.trim();
      // Handle preferences
    if (profileVisibility || emailNotifications !== undefined || pushNotifications !== undefined || newsletter !== undefined) {
        if (profileVisibility) updateData['preferences.profileVisibility'] = profileVisibility;
        if (emailNotifications !== undefined) updateData['preferences.emailNotifications'] = emailNotifications === 'true' || emailNotifications === true;
        if (pushNotifications !== undefined) updateData['preferences.pushNotifications'] = pushNotifications === 'true' || pushNotifications === true;
        if (newsletter !== undefined) updateData['preferences.newsletter'] = newsletter === 'true' || newsletter === true;
    }
    
    // Handle social links
    if (twitterUrl !== undefined || linkedinUrl !== undefined || githubUrl !== undefined || websiteUrl !== undefined) {
        if (twitterUrl !== undefined) updateData['socialLinks.twitter'] = twitterUrl.trim();
        if (linkedinUrl !== undefined) updateData['socialLinks.linkedin'] = linkedinUrl.trim();
        if (githubUrl !== undefined) updateData['socialLinks.github'] = githubUrl.trim();
        if (websiteUrl !== undefined) updateData['socialLinks.website'] = websiteUrl.trim();
    }
    
    // Check if username is already taken (if username is being updated)
    if (updateData.username) {
        const existingUser = await User.findOne({ 
            username: updateData.username,
            _id: { $ne: userId } // Exclude current user
        });
        
        if (existingUser) {
            throw new ApiError(409, "Username already taken");
        }
    }
    
    // Handle avatar upload if provided
    if (req.files?.avatar?.[0]) {
        const avatarLocalPath = req.files.avatar[0].path;
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        
        if (!avatar) {
            throw new ApiError(500, "Avatar upload failed");
        }
        
        // Delete old avatar from cloudinary if it exists
        const currentUser = await User.findById(userId);
        if (currentUser.avatar) {
            try {
                const publicId = extractPublicIdFromUrl(currentUser.avatar);
                await deleteFromCloudinary(publicId);
            } catch (error) {
                console.error("Failed to delete old avatar:", error);
                // Continue even if deletion fails
            }
        }
        
        updateData.avatar = avatar.url;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { 
            new: true, 
            runValidators: true 
        }
    ).select("-password -refreshToken");
    
    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }
    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedUser,
                "User profile updated successfully"
            )        );
});

// @desc    Get all public categories (visible categories only)
// @route   GET /api/v1/users/categories
// @access  Public
const getPublicCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.aggregate([
            { $match: { isVisible: true } },
            {
                $lookup: {
                    from: 'articles',
                    let: { categoryId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$category', '$$categoryId'] },
                                status: 'published',
                                isArchived: false
                            }
                        }
                    ],
                    as: 'articles'
                }
            },
            {
                $addFields: {
                    articleCount: { $size: '$articles' }
                }
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    description: 1,
                    color: 1,
                    icon: 1,
                    articleCount: 1
                }
            },
            { $sort: { name: 1 } }
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                categories
            }, "Public categories retrieved successfully")
        );
        
    } catch (error) {
        console.error("Error in getPublicCategories:", error);
        throw new ApiError(500, "Error retrieving categories");
    }
});

// @desc    Get all published articles
// @route   GET /api/v1/users/articles
// @access  Public
const getPublicArticles = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, sortBy = 'publishedAt' } = req.query;
        const skip = (page - 1) * limit;

        // Build query for published articles only
        let query = {
            status: 'published',
            isArchived: false
        };

        // Add category filter if provided
        if (category) {
            query.category = category;
        }

        // Add search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Define sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'views':
                sortOptions = { views: -1 };
                break;
            case 'likes':
                sortOptions = { 'likes': -1 };
                break;
            case 'title':
                sortOptions = { title: 1 };
                break;
            default:
                sortOptions = { publishedAt: -1 };
        }

        const articles = await Article.find(query)
            .populate('author', 'fullName avatar')
            .populate('category', 'name slug color')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .select('title slug excerpt featuredImage views likes publishedAt readingTime tags');

        const totalArticles = await Article.countDocuments(query);
        const totalPages = Math.ceil(totalArticles / limit);

        const formattedArticles = articles.map(article => ({
            id: article._id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            featuredImage: article.featuredImage,
            views: article.views,
            likes: article.likes.length,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime,
            tags: article.tags,
            author: {
                id: article.author._id,
                fullName: article.author.fullName,
                avatar: article.author.avatar
            },
            category: {
                id: article.category._id,
                name: article.category.name,
                slug: article.category.slug,
                color: article.category.color
            }
        }));

        return res.status(200).json(
            new ApiResponse(200, {
                articles: formattedArticles,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalArticles,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, "Published articles retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getPublicArticles:", error);
        throw new ApiError(500, "Error retrieving articles");
    }
});

// @desc    Get single published article by ID or slug
// @route   GET /api/v1/users/articles/:identifier
// @access  Public
const getPublicArticle = asyncHandler(async (req, res) => {
    try {
        const { identifier } = req.params;

        // Try to find by ID first, then by slug
        let query = {
            status: 'published',
            isArchived: false
        };

        // Check if identifier is a valid ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            query._id = identifier;
        } else {
            query.slug = identifier;
        }

        const article = await Article.findOne(query)
            .populate('author', 'fullName avatar bio')
            .populate('category', 'name slug color description')
            .populate({
                path: 'comments',
                match: { isApproved: true },
                populate: {
                    path: 'user',
                    select: 'fullName avatar'
                },
                options: { sort: { createdAt: -1 } }
            });

        if (!article) {
            throw new ApiError(404, "Article not found");
        }

        // Increment view count
        await Article.findByIdAndUpdate(article._id, {
            $inc: { views: 1 }
        });

        // Get related articles from same category
        const relatedArticles = await Article.find({
            category: article.category._id,
            _id: { $ne: article._id },
            status: 'published',
            isArchived: false
        })
        .populate('author', 'fullName avatar')
        .sort({ publishedAt: -1 })
        .limit(3)
        .select('title slug excerpt featuredImage views likes publishedAt readingTime');

        const formattedArticle = {
            id: article._id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            featuredImage: article.featuredImage,
            views: article.views + 1, // Include the increment
            likes: article.likes.length,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime,
            tags: article.tags,
            author: {
                id: article.author._id,
                fullName: article.author.fullName,
                avatar: article.author.avatar,
                bio: article.author.bio
            },
            category: {
                id: article.category._id,
                name: article.category.name,
                slug: article.category.slug,
                color: article.category.color,
                description: article.category.description
            },
            comments: article.comments.map(comment => ({
                id: comment._id,
                content: comment.content,
                createdAt: comment.createdAt,
                user: {
                    id: comment.user._id,
                    fullName: comment.user.fullName,
                    avatar: comment.user.avatar
                }
            })),
            relatedArticles: relatedArticles.map(related => ({
                id: related._id,
                title: related.title,
                slug: related.slug,
                excerpt: related.excerpt,
                featuredImage: related.featuredImage,
                views: related.views,
                likes: related.likes.length,
                publishedAt: related.publishedAt,
                readingTime: related.readingTime,
                author: {
                    fullName: related.author.fullName,
                    avatar: related.author.avatar
                }
            }))
        };

        return res.status(200).json(
            new ApiResponse(200, formattedArticle, "Article retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getPublicArticle:", error);
        throw new ApiError(500, "Error retrieving article");
    }
});

// @desc    Get public platform statistics  
// @route   GET /api/v1/stats
// @access  Public
const getPublicStats = asyncHandler(async (req, res) => {
    try {
        // Get total published articles count
        const totalArticles = await Article.countDocuments({ 
            status: 'published',
            isArchived: false 
        });

        // Get total writers count (users with writer role who have published articles)
        const totalWriters = await User.countDocuments({ 
            role: 'writer' 
        });

        // Get total views from all published articles
        const viewsAggregation = await Article.aggregate([
            { 
                $match: { 
                    status: 'published',
                    isArchived: false 
                } 
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        const totalViews = viewsAggregation[0]?.totalViews || 0;

        // Calculate monthly views (articles published in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const monthlyViewsAggregation = await Article.aggregate([
            { 
                $match: { 
                    status: 'published',
                    isArchived: false,
                    publishedAt: { $gte: thirtyDaysAgo }
                } 
            },
            {
                $group: {
                    _id: null,
                    monthlyViews: { $sum: '$views' }
                }
            }
        ]);

        const monthlyViews = monthlyViewsAggregation[0]?.monthlyViews || 0;

        const stats = {
            totalArticles,
            totalWriters,
            totalViews,
            monthlyViews,
            rating: "5.0" // Static rating for now
        };

        return res.status(200).json(
            new ApiResponse(200, stats, "Public statistics retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getPublicStats:", error);
        throw new ApiError(500, "Error retrieving statistics");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    GoogleLogin,
    refreshAccessToken,
    getCurrentUser,
    updateUser,
    getPublicCategories,
    getPublicArticles,
    getPublicArticle,
    getPublicStats
};