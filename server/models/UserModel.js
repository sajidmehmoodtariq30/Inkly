import mongoose, { Schema } from "mongoose";
import pkg from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new Schema(
    {
        role: {
            type: String,
            enum: ["user","writer", "admin"],
            default: "user",
            index: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // Cloudinary URL
            required: true,
        },        bio: {
            type: String,
            trim: true,
            default: "",
        },
        
        // Social Media Links
        socialLinks: {
            twitter: { type: String, trim: true },
            linkedin: { type: String, trim: true },
            github: { type: String, trim: true },
            website: { type: String, trim: true },
            instagram: { type: String, trim: true }
        },
        
        // Profile Enhancement
        location: {
            type: String,
            trim: true
        },
        
        profession: {
            type: String,
            trim: true
        },
        
        // Account Status & Verification
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        
        emailVerificationToken: {
            type: String
        },
        
        emailVerificationExpires: {
            type: Date
        },
        
        isActive: {
            type: Boolean,
            default: true
        },
        
        // Password Reset
        passwordResetToken: {
            type: String
        },
        
        passwordResetExpires: {
            type: Date
        },
        
        // User Engagement & Analytics
        totalPosts: {
            type: Number,
            default: 0
        },
        
        totalViews: {
            type: Number,
            default: 0
        },
        
        totalLikes: {
            type: Number,
            default: 0
        },
        
        followersCount: {
            type: Number,
            default: 0
        },
          followingCount: {
            type: Number,
            default: 0
        },
        
        // Admin & Moderation Fields
        banned: {
            type: Boolean,
            default: false
        },
        
        banReason: {
            type: String,
            trim: true
        },
        
        bannedAt: {
            type: Date
        },
        
        lastLogin: {
            type: Date,
            default: Date.now
        },
        
        // User Preferences
        preferences: {
            emailNotifications: {
                type: Boolean,
                default: true
            },
            pushNotifications: {
                type: Boolean,
                default: true
            },
            newsletter: {
                type: Boolean,
                default: false
            },
            profileVisibility: {
                type: String,
                enum: ['public', 'private'],
                default: 'public'
            }
        },
        
        // Subscription/Premium Features
        subscriptionType: {
            type: String,
            enum: ['free', 'premium', 'pro'],
            default: 'free'
        },
        
        subscriptionExpires: {
            type: Date
        },
        
        // Activity Tracking
        lastLoginAt: {
            type: Date
        },
        
        lastActiveAt: {
            type: Date,
            default: Date.now
        },
        
        // Account Creation Source
        signupSource: {
            type: String,
            enum: ['email', 'google', 'github', 'facebook'],
            default: 'email'
        },
        
        // Two-Factor Authentication
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        
        twoFactorSecret: {
            type: String
        },
        
        // Account Suspension/Moderation
        isSuspended: {
            type: Boolean,
            default: false
        },
        
        suspensionReason: {
            type: String
        },
        
        suspensionExpires: {
            type: Date
        },
        
        // Featured Author
        isFeatured: {
            type: Boolean,
            default: false
        },
        
        // Cover Image for Profile
        coverImage: {
            type: String // Cloudinary URL
        },
        
        // User Interests (will connect to categories later)
        interests: [{
            type: String,
            trim: true
        }],
        
        // Writing Statistics
        writingStats: {
            totalWordCount: {
                type: Number,
                default: 0
            },
            averageReadingTime: {
                type: Number,
                default: 0
            },
            publishedArticles: {
                type: Number,
                default: 0
            },
            draftArticles: {
                type: Number,
                default: 0
            }
        },        password: {
            type: String,
            required: [true, "Password is required"],
        },
        
        // Identify Google users
        isGoogleUser: {
            type: Boolean,
            default: false
        },
        
        refreshToken: {
            type: String,
        },
    },    { timestamps: true }
);

// Add indexes for performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ username: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ lastActiveAt: -1 });
userSchema.index({ isFeatured: 1, isActive: 1 });
userSchema.index({ subscriptionType: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return pkg.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return pkg.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);