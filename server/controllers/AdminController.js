import asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/UserModel.js";

// @desc    Get admin overview statistics
// @route   GET /api/admin/overview
// @access  Private/Admin
const getOverviewStats = asyncHandler(async (req, res) => {
    try {
        // Get current date and date 30 days ago
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // Get total users count
        const totalUsers = await User.countDocuments({});
        
        // Get new users this month
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        // Get active users (users who logged in within last 30 days)
        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: thirtyDaysAgo }
        });
        
        // Get recent users (last 5 registered users)
        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullName username email avatar role createdAt');
        
        // Calculate growth rate
        const totalUsersLastMonth = totalUsers - newUsersThisMonth;
        const growthRate = totalUsersLastMonth > 0 
            ? ((newUsersThisMonth / totalUsersLastMonth) * 100).toFixed(1)
            : 0;

        // For now, we'll set post-related stats to 0 since we don't have a Post model yet
        // These can be updated when the Post model is implemented
        const stats = {
            totalUsers,
            totalPosts: 0, // TODO: Implement when Post model is ready
            totalCategories: 0, // TODO: Implement when Category model is ready
            totalComments: 0, // TODO: Implement when Comment model is ready
            activeUsers,
            totalViews: 0, // TODO: Implement when analytics are added
            newUsersThisMonth,
            newPostsThisMonth: 0, // TODO: Implement when Post model is ready
            newCommentsThisMonth: 0, // TODO: Implement when Comment model is ready
            growthRate,
            avgPostsPerDay: 0, // TODO: Implement when Post model is ready
            recentUsers,
            recentActivity: [
                // TODO: Implement activity tracking
                {
                    description: `${newUsersThisMonth} new users joined this month`,
                    createdAt: currentDate
                }
            ]
        };

        return res.status(200).json(
            new ApiResponse(200, stats, "Overview statistics retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getOverviewStats:", error);
        throw new ApiError(500, "Error retrieving overview statistics");
    }
});

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        
        // Build query
        let query = {};
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limitNum);
        
        return res.status(200).json(
            new ApiResponse(200, {
                users,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalUsers,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            }, "Users retrieved successfully")
        );
        
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        throw new ApiError(500, "Error retrieving users");
    }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:userId/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!['user', 'writer', 'admin'].includes(role)) {
            throw new ApiError(400, "Invalid role specified");
        }
        
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        user.role = role;
        await user.save();
        
        return res.status(200).json(
            new ApiResponse(200, user, "User role updated successfully")
        );
        
    } catch (error) {
        console.error("Error in updateUserRole:", error);
        throw new ApiError(500, "Error updating user role");
    }
});

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:userId/ban
// @access  Private/Admin
const banUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { banned, reason } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        
        // Add banned field to user model if it doesn't exist
        user.banned = banned;
        if (banned && reason) {
            user.banReason = reason;
            user.bannedAt = new Date();
        } else if (!banned) {
            user.banReason = undefined;
            user.bannedAt = undefined;
        }
        
        await user.save();
        
        return res.status(200).json(
            new ApiResponse(200, user, `User ${banned ? 'banned' : 'unbanned'} successfully`)
        );
        
    } catch (error) {
        console.error("Error in banUser:", error);
        throw new ApiError(500, "Error updating user ban status");
    }
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getAllCategories = asyncHandler(async (req, res) => {
    try {
        // TODO: Implement when Category model is ready
        // For now, return empty array
        const categories = [];
        
        return res.status(200).json(
            new ApiResponse(200, categories, "Categories retrieved successfully")
        );
        
    } catch (error) {
        console.error("Error in getAllCategories:", error);
        throw new ApiError(500, "Error retrieving categories");
    }
});

// @desc    Get all comments
// @route   GET /api/admin/comments
// @access  Private/Admin
const getAllComments = asyncHandler(async (req, res) => {
    try {
        // TODO: Implement when Comment model is ready
        // For now, return empty array
        const comments = [];
        
        return res.status(200).json(
            new ApiResponse(200, comments, "Comments retrieved successfully")
        );
        
    } catch (error) {
        console.error("Error in getAllComments:", error);
        throw new ApiError(500, "Error retrieving comments");
    }
});

// @desc    Delete comment
// @route   DELETE /api/admin/comments/:commentId
// @access  Private/Admin
const deleteComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        
        // TODO: Implement when Comment model is ready
        
        return res.status(200).json(
            new ApiResponse(200, null, "Comment deleted successfully")
        );
        
    } catch (error) {
        console.error("Error in deleteComment:", error);
        throw new ApiError(500, "Error deleting comment");
    }
});

export {
    getOverviewStats,
    getAllUsers,
    updateUserRole,
    banUser,
    getAllCategories,
    getAllComments,
    deleteComment
};
