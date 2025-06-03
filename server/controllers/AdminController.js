import asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/UserModel.js";
import { Category } from "../models/CategoryModel.js";
import { Article } from "../models/ArticleModel.js";

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
        
        // Get total categories count
        const totalCategories = await Category.countDocuments({ isVisible: true });
        
        // Get real article data
        const totalPosts = await Article.countDocuments({ status: 'published' });
        const newPostsThisMonth = await Article.countDocuments({
            status: 'published',
            publishedAt: { $gte: thirtyDaysAgo }
        });

        // Get total comments from all articles
        const commentsAggregation = await Article.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: { $size: '$comments' } },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        const articleStats = commentsAggregation[0] || { totalComments: 0, totalViews: 0 };
        
        // Calculate average posts per day
        const avgPostsPerDay = totalPosts > 0 ? (totalPosts / 30).toFixed(1) : 0;

        const stats = {
            totalUsers,
            totalPosts,
            totalCategories,
            totalComments: articleStats.totalComments,
            activeUsers,
            totalViews: articleStats.totalViews,
            newUsersThisMonth,
            newPostsThisMonth,
            newCommentsThisMonth: 0, // Would need comment timestamps to calculate this
            growthRate,
            avgPostsPerDay,
            recentUsers,
            recentActivity: [
                {
                    description: `${newUsersThisMonth} new users joined this month`,
                    createdAt: currentDate
                },
                {
                    description: `${newPostsThisMonth} articles published this month`,
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
        const { page = 1, limit = 10, role, search, status } = req.query;
        
        // Build query
        let query = {};
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (status && status !== 'all') {
            if (status === 'banned') {
                query.banned = true;
            } else if (status === 'active') {
                query.banned = { $ne: true };
            }
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
        const { page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
        
        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const categories = await Category.find(query)
            .populate('parentCategory', 'name slug')
            .populate('createdBy', 'fullName username')
            .populate('updatedBy', 'fullName username')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalCategories = await Category.countDocuments(query);
        
        return res.status(200).json(
            new ApiResponse(200, {
                categories,
                totalCategories,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCategories / parseInt(limit)),
                hasNextPage: skip + categories.length < totalCategories,
                hasPrevPage: parseInt(page) > 1
            }, "Categories retrieved successfully")
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

// @desc    Create new user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, username, email, password, role = 'user' } = req.body;
        
        // Validate required fields
        if (!fullName || !username || !email || !password) {
            throw new ApiError(400, "All fields are required");
        }
        
        // Validate role
        if (!['user', 'writer', 'admin'].includes(role)) {
            throw new ApiError(400, "Invalid role specified");
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username: username.toLowerCase() }]
        });
        
        if (existingUser) {
            throw new ApiError(409, "User with this email or username already exists");
        }
        
        // Create user with default avatar
        const newUser = await User.create({
            fullName: fullName.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password,
            role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=ffffff&size=200`,
            signupSource: 'admin'
        });
        
        // Remove password from response
        const userResponse = await User.findById(newUser._id).select('-password -refreshToken');
        
        return res.status(201).json(
            new ApiResponse(201, userResponse, "User created successfully")
        );
        
    } catch (error) {
        console.error("Error in createUser:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Error creating user");
    }
});

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    try {
        const { name, description, color, icon, parentCategory, isVisible = true } = req.body;
        
        console.log('Received category data:', req.body);
        
        // Validation
        if (!name || name.trim().length === 0) {
            throw new ApiError(400, "Category name is required");
        }
        
        if (name.trim().length > 50) {
            throw new ApiError(400, "Category name cannot exceed 50 characters");
        }
        
        if (description && description.length > 500) {
            throw new ApiError(400, "Description cannot exceed 500 characters");
        }
        
        // Check if category name already exists
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
        });
        
        if (existingCategory) {
            throw new ApiError(409, "Category with this name already exists");
        }
        
        // Validate parent category if provided
        if (parentCategory && parentCategory !== '') {
            const parent = await Category.findById(parentCategory);
            if (!parent) {
                throw new ApiError(404, "Parent category not found");
            }
        }
        
        // Create category
        const newCategory = await Category.create({
            name: name.trim(),
            description: description?.trim() || '',
            color: color || '#3B82F6',
            icon: icon || 'Hash',
            parentCategory: parentCategory && parentCategory !== '' ? parentCategory : null,
            isVisible,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });
        
        await newCategory.populate('parentCategory', 'name slug');
        await newCategory.populate('createdBy', 'fullName username');
        
        return res.status(201).json(
            new ApiResponse(201, newCategory, "Category created successfully")
        );
        
    } catch (error) {
        console.error("Error in createCategory:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Error creating category");
    }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon, parentCategory, isVisible } = req.body;
        
        // Find category
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        
        // Validation
        if (name && name.trim().length === 0) {
            throw new ApiError(400, "Category name cannot be empty");
        }
        
        if (name && name.trim().length > 50) {
            throw new ApiError(400, "Category name cannot exceed 50 characters");
        }
        
        if (description && description.length > 500) {
            throw new ApiError(400, "Description cannot exceed 500 characters");
        }
        
        // Check if new name conflicts with existing categories
        if (name && name.trim() !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: id }
            });
            
            if (existingCategory) {
                throw new ApiError(409, "Category with this name already exists");
            }
        }
        
        // Validate parent category if provided
        if (parentCategory && parentCategory !== '' && parentCategory !== id) {
            const parent = await Category.findById(parentCategory);
            if (!parent) {
                throw new ApiError(404, "Parent category not found");
            }
            
            // Check for circular reference
            if (parentCategory === id) {
                throw new ApiError(400, "Category cannot be its own parent");
            }
        }
        
        // Update fields
        if (name) category.name = name.trim();
        if (description !== undefined) category.description = description.trim();
        if (color) category.color = color;
        if (icon) category.icon = icon;
        if (parentCategory !== undefined) {
            category.parentCategory = parentCategory && parentCategory !== '' ? parentCategory : null;
        }
        if (isVisible !== undefined) category.isVisible = isVisible;
        category.updatedBy = req.user._id;
        
        await category.save();
        await category.populate('parentCategory', 'name slug');
        await category.populate('updatedBy', 'fullName username');
        
        return res.status(200).json(
            new ApiResponse(200, category, "Category updated successfully")
        );
        
    } catch (error) {
        console.error("Error in updateCategory:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Error updating category");
    }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find category
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        
        // Check if category has child categories
        const childCategories = await Category.countDocuments({ parentCategory: id });
        if (childCategories > 0) {
            throw new ApiError(400, "Cannot delete category that has child categories. Please delete or reassign child categories first.");
        }
        
        // TODO: Check if category has posts when Post model is implemented
        // if (category.postCount > 0) {
        //     throw new ApiError(400, "Cannot delete category that has posts. Please move or delete posts first.");
        // }
        
        await Category.findByIdAndDelete(id);
        
        return res.status(200).json(
            new ApiResponse(200, null, "Category deleted successfully")
        );
        
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Error deleting category");
    }
});

// @desc    Toggle category visibility
// @route   PUT /api/admin/categories/:id/visibility
// @access  Private/Admin
const toggleCategoryVisibility = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }
        
        category.isVisible = !category.isVisible;
        category.updatedBy = req.user._id;
        await category.save();
        
        return res.status(200).json(
            new ApiResponse(200, category, `Category ${category.isVisible ? 'shown' : 'hidden'} successfully`)
        );
        
    } catch (error) {
        console.error("Error in toggleCategoryVisibility:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Error toggling category visibility");
    }
});

// @desc    Bulk delete categories
// @route   DELETE /api/admin/categories/bulk
// @access  Private/Admin
const bulkDeleteCategories = asyncHandler(async (req, res) => {
    try {
        const { categoryIds } = req.body;
        
        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
            throw new ApiError(400, "Category IDs are required");
        }
        
        // Check if any categories have child categories
        const childCategoriesCount = await Category.countDocuments({ 
            parentCategory: { $in: categoryIds } 
        });
        
        if (childCategoriesCount > 0) {
            throw new ApiError(400, "Cannot delete categories that have child categories");
        }
        
        // TODO: Check if categories have posts when Post model is implemented
        
        const result = await Category.deleteMany({ _id: { $in: categoryIds } });
        
        return res.status(200).json(
            new ApiResponse(200, { deletedCount: result.deletedCount }, `${result.deletedCount} categories deleted successfully`)
        );
        
    } catch (error) {
        console.error("Error in bulkDeleteCategories:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Error deleting categories");
    }
});

// @desc    Get category hierarchy
// @route   GET /api/admin/categories/hierarchy
// @access  Private/Admin
const getCategoryHierarchy = asyncHandler(async (req, res) => {
    try {
        const hierarchy = await Category.getHierarchy();
        
        return res.status(200).json(
            new ApiResponse(200, hierarchy, "Category hierarchy retrieved successfully")
        );
        
    } catch (error) {
        console.error("Error in getCategoryHierarchy:", error);
        throw new ApiError(500, "Error retrieving category hierarchy");
    }
});

// @desc    Get comprehensive analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        
        // Calculate date range
        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000));
        
        // Get total counts
        const totalUsers = await User.countDocuments({});
        const totalWriters = await User.countDocuments({ role: 'writer' });
        const totalCategories = await Category.countDocuments({ isVisible: true });
        
        // Get new users in period
        const newUsersInPeriod = await User.countDocuments({
            createdAt: { $gte: startDate }
        });
        
        // Get active users (users who logged in within the period)
        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: startDate }
        });

        // Get real article analytics
        const totalArticles = await Article.countDocuments({ status: 'published' });
        const articlesInPeriod = await Article.countDocuments({
            status: 'published',
            publishedAt: { $gte: startDate }
        });

        // Get total views and likes from all published articles
        const articleStats = await Article.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: { $size: '$likes' } },
                    totalComments: { $sum: { $size: '$comments' } }
                }
            }
        ]);

        const stats = articleStats[0] || { totalViews: 0, totalLikes: 0, totalComments: 0 };        // Get recent activity data for articles
        const recentActivityData = await Article.aggregate([
            {
                $match: {
                    status: 'published',
                    publishedAt: { $gte: new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
                    articles: { $sum: 1 },
                    views: { $sum: '$views' },
                    comments: { $sum: { $size: '$comments' } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get daily user registrations for the last 7 days
        const userActivityData = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get top categories by article count
        const topCategories = await Article.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$category',
                    articles: { $sum: 1 },
                    views: { $sum: '$views' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $project: {
                    name: '$categoryInfo.name',
                    articles: 1,
                    views: 1
                }
            },
            { $sort: { articles: -1 } },
            { $limit: 5 }
        ]);

        // Get top writers by article count and engagement
        const topWriters = await Article.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$author',
                    articles: { $sum: 1 },
                    views: { $sum: '$views' },
                    likes: { $sum: { $size: '$likes' } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            { $unwind: '$authorInfo' },
            {
                $project: {
                    name: '$authorInfo.fullName',
                    articles: 1,
                    views: 1,
                    likes: 1
                }
            },
            { $sort: { articles: -1, views: -1 } },
            { $limit: 5 }
        ]);        // Format recent activity for the last 7 days
        const recentActivity = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayData = recentActivityData.find(item => item._id === dateString);
            const userData = userActivityData.find(item => item._id === dateString);
            
            return {
                date: dateString,
                users: userData ? userData.newUsers : 0,
                articles: dayData ? dayData.articles : 0,
                comments: dayData ? dayData.comments : 0
            };
        }).reverse();

        const analyticsData = {
            overview: {
                totalUsers,
                totalWriters,
                totalArticles,
                totalComments: stats.totalComments,
                totalViews: stats.totalViews,
                totalLikes: stats.totalLikes,
                activeUsers,
                newUsersThisMonth: newUsersInPeriod
            },
            recentActivity,
            topCategories,
            topWriters,
            period: days
        };

        return res.status(200).json(
            new ApiResponse(200, analyticsData, "Analytics data retrieved successfully")
        );

    } catch (error) {
        console.error("Error in getAnalytics:", error);
        throw new ApiError(500, "Error retrieving analytics data");
    }
});

export {
    getOverviewStats,
    getAllUsers,
    updateUserRole,
    banUser,
    getAllCategories,
    getAllComments,
    deleteComment,
    createUser,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility,
    bulkDeleteCategories,
    getCategoryHierarchy,
    getAnalytics
};
