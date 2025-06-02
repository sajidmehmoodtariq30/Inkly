import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Article } from "../models/ArticleModel.js";
import { User } from "../models/UserModel.js";
import { Category } from "../models/CategoryModel.js";
import { Media } from "../models/MediaModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import fs from "fs";

// Helper function to generate unique slug
const generateUniqueSlug = async (title, excludeId = null) => {
    let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, '') // Remove special characters but keep spaces
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
    
    // Ensure we have a valid slug
    if (!baseSlug) {
        baseSlug = 'article';
    }
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await Article.findOne({ slug: slug, _id: { $ne: excludeId } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

// Get writer dashboard overview
const getWriterDashboard = asyncHandler(async (req, res) => {
    const writerId = req.user._id;
    
    try {
        // Get basic article statistics
        const totalArticles = await Article.countDocuments({ 
            author: writerId, 
            isArchived: false 
        });
        
        const publishedArticles = await Article.countDocuments({ 
            author: writerId, 
            status: 'published',
            isArchived: false 
        });
        
        const draftArticles = await Article.countDocuments({ 
            author: writerId, 
            status: 'draft',
            isArchived: false 
        });
        
        const reviewArticles = await Article.countDocuments({ 
            author: writerId, 
            status: 'review',
            isArchived: false 
        });
        
        // Get total views and engagement for published articles
        const publishedArticleStats = await Article.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(writerId),
                    status: 'published',
                    isArchived: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: { $size: '$likes' } },
                    totalComments: { $sum: { $size: '$comments' } },
                    avgReadingTime: { $avg: '$readingTime' }
                }
            }
        ]);
        
        const stats = publishedArticleStats[0] || {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            avgReadingTime: 0
        };
        
        // Get recent articles (last 5)
        const recentArticles = await Article.find({
            author: writerId,
            isArchived: false
        })
        .populate('category', 'name slug')
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title slug content status views likes comments publishedAt readingTime createdAt updatedAt');
        
        // Format recent articles for frontend
        const formattedRecentArticles = recentArticles.map(article => ({
            id: article._id,
            title: article.title,
            slug: article.slug,
            status: article.status,
            views: article.views,
            likes: article.likes.length,
            comments: article.comments.filter(comment => comment.isApproved).length,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime,
            category: article.category,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt
        }));
        
        // Get monthly writing goals (articles published this month)
        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const monthlyPublished = await Article.countDocuments({
            author: writerId,
            status: 'published',
            publishedAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });
        
        // Calculate total words written this month
        const monthlyWordCount = await Article.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(writerId),
                    status: 'published',
                    publishedAt: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalWords: {
                        $sum: {
                            $size: {
                                $split: [
                                    { $trim: { input: '$content' } },
                                    ' '
                                ]
                            }
                        }
                    }
                }
            }
        ]);
        
        const wordsWritten = monthlyWordCount[0]?.totalWords || 0;
        
        const dashboardData = {
            stats: {
                totalArticles,
                publishedArticles,
                draftArticles,
                reviewArticles,
                totalViews: stats.totalViews,
                totalLikes: stats.totalLikes,
                totalComments: stats.totalComments,
                avgReadingTime: Math.round(stats.avgReadingTime || 0)
            },
            recentArticles: formattedRecentArticles,
            monthlyGoals: {
                articlesPublished: monthlyPublished,
                wordsWritten: wordsWritten,
                articlesTarget: 5, // Default target, could be user configurable
                wordsTarget: 20000 // Default target, could be user configurable
            },
            user: {
                fullName: req.user.fullName,
                avatar: req.user.avatar,
                email: req.user.email
            }
        };
        
        return res.status(200).json(
            new ApiResponse(200, dashboardData, "Writer dashboard data retrieved successfully")
        );
        
    } catch (error) {
        console.error('Dashboard error:', error);
        throw new ApiError(500, "Failed to retrieve dashboard data");
    }
});

// Get writer's articles with pagination
const getWriterArticles = asyncHandler(async (req, res) => {
    const writerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // Filter by status if provided
    const search = req.query.search; // Search in title and content
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {
        author: writerId,
        isArchived: false
    };
    
    if (status && ['draft', 'published', 'review', 'archived'].includes(status)) {
        query.status = status;
    }
    
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }
    
    try {
        const articles = await Article.find(query)
            .populate('category', 'name slug')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title slug excerpt status views likes comments publishedAt readingTime createdAt updatedAt featuredImage category tags');
        
        const totalArticles = await Article.countDocuments(query);
        const totalPages = Math.ceil(totalArticles / limit);
        
        const formattedArticles = articles.map(article => ({
            id: article._id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            status: article.status,
            views: article.views,
            likes: article.likes.length,
            comments: article.comments.filter(comment => comment.isApproved).length,
            publishedAt: article.publishedAt,
            readingTime: article.readingTime,
            featuredImage: article.featuredImage,
            category: article.category,
            tags: article.tags,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt
        }));
        
        return res.status(200).json(
            new ApiResponse(200, {
                articles: formattedArticles,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalArticles,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }, "Articles retrieved successfully")
        );
        
    } catch (error) {
        console.error('Get articles error:', error);
        throw new ApiError(500, "Failed to retrieve articles");
    }
});

// Get writer analytics
const getWriterAnalytics = asyncHandler(async (req, res) => {
    const writerId = req.user._id;
    const period = req.query.period || '30'; // days
    
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));
        
        // Views over time
        const viewsOverTime = await Article.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(writerId),
                    status: 'published',
                    publishedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$publishedAt"
                        }
                    },
                    views: { $sum: '$views' },
                    articles: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Top performing articles
        const topArticles = await Article.find({
            author: writerId,
            status: 'published',
            isArchived: false
        })
        .sort({ views: -1 })
        .limit(5)
        .select('title views likes comments publishedAt')
        .populate('category', 'name');
        
        // Category performance
        const categoryStats = await Article.aggregate([
            {
                $match: {
                    author: new mongoose.Types.ObjectId(writerId),
                    status: 'published',
                    isArchived: false
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $group: {
                    _id: '$category',
                    categoryName: { $first: '$categoryInfo.name' },
                    articleCount: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: { $size: '$likes' } }
                }
            },
            { $sort: { articleCount: -1 } }
        ]);
        
        const analyticsData = {
            viewsOverTime,
            topArticles: topArticles.map(article => ({
                id: article._id,
                title: article.title,
                views: article.views,
                likes: article.likes.length,
                comments: article.comments.filter(c => c.isApproved).length,
                publishedAt: article.publishedAt,
                category: article.category
            })),
            categoryStats,
            period: parseInt(period)
        };
        
        return res.status(200).json(
            new ApiResponse(200, analyticsData, "Analytics data retrieved successfully")
        );
        
    } catch (error) {
        console.error('Analytics error:', error);
        throw new ApiError(500, "Failed to retrieve analytics data");
    }
});

// Create new article
const createArticle = asyncHandler(async (req, res) => {
    const { title, content, excerpt, categoryId, tags, status = 'draft' } = req.body;
    
    if (!title || !content || !categoryId) {
        throw new ApiError(400, "Title, content, and category are required");
    }
    
    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }
    
    try {
        // Generate unique slug
        const slug = await generateUniqueSlug(title);
        
        const article = await Article.create({
            title,
            slug,
            content,
            excerpt,
            author: req.user._id,
            category: categoryId,
            tags: tags || [],
            status
        });
        
        const populatedArticle = await Article.findById(article._id)
            .populate('category', 'name slug')
            .populate('author', 'fullName avatar');
        
        return res.status(201).json(
            new ApiResponse(201, populatedArticle, "Article created successfully")
        );
        
    } catch (error) {
        console.error('Create article error:', error);
        throw new ApiError(500, "Failed to create article");
    }
});

// Update article
const updateArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, excerpt, categoryId, tags, status } = req.body;
    
    if (!title || !content || !categoryId) {
        throw new ApiError(400, "Title, content, and category are required");
    }
    
    try {
        // Check if article exists and belongs to the writer
        const existingArticle = await Article.findOne({
            _id: id,
            author: req.user._id
        });
        
        if (!existingArticle) {
            throw new ApiError(404, "Article not found or unauthorized");
        }
        
        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");        }
        
        // Generate new slug if title has changed
        let updateData = {
            title,
            content,
            excerpt,
            category: categoryId,
            tags: tags || [],
            status,
            publishedAt: status === 'published' && existingArticle.status !== 'published' 
                ? new Date() 
                : existingArticle.publishedAt
        };
        
        if (title !== existingArticle.title) {
            updateData.slug = await generateUniqueSlug(title, id);
        }
        
        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('category', 'name slug')
         .populate('author', 'fullName avatar');
        
        return res.status(200).json(
            new ApiResponse(200, updatedArticle, "Article updated successfully")
        );
        
    } catch (error) {
        console.error('Update article error:', error);
        throw new ApiError(500, "Failed to update article");
    }
});

// Delete article
const deleteArticle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if article exists and belongs to the writer
        const article = await Article.findOne({
            _id: id,
            author: req.user._id
        });
        
        if (!article) {
            throw new ApiError(404, "Article not found or unauthorized");
        }
        
        await Article.findByIdAndDelete(id);
        
        return res.status(200).json(
            new ApiResponse(200, null, "Article deleted successfully")
        );
        
    } catch (error) {
        console.error('Delete article error:', error);
        throw new ApiError(500, "Failed to delete article");
    }
});

// Get categories
const getCategories = asyncHandler(async (req, res) => {
    try {
        // Get categories with article counts
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
                                status: { $in: ['published', 'draft'] }
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
            new ApiResponse(200, categories, "Categories retrieved successfully")
        );
        
    } catch (error) {
        console.error('Get categories error:', error);
        throw new ApiError(500, "Failed to retrieve categories");
    }
});

// Get single article by ID
const getArticleById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    try {
        const article = await Article.findOne({
            _id: id,
            author: req.user._id
        })
        .populate('category', 'name slug')
        .populate('author', 'fullName avatar');
        
        if (!article) {
            throw new ApiError(404, "Article not found or unauthorized");
        }
        
        return res.status(200).json(
            new ApiResponse(200, article, "Article retrieved successfully")
        );
        
    } catch (error) {
        console.error('Get article error:', error);
        throw new ApiError(500, "Failed to retrieve article");
    }
});

// Get comments for a specific article
const getArticleComments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const writerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // 'approved', 'pending', 'all'
    
    const skip = (page - 1) * limit;
    
    try {
        // Verify the article belongs to the writer
        const article = await Article.findOne({
            _id: id,
            author: writerId,
            isArchived: false
        }).populate({
            path: 'comments.user',
            select: 'fullName avatar email'
        });
        
        if (!article) {
            throw new ApiError(404, "Article not found or access denied");
        }
        
        let comments = article.comments;
        
        // Filter by status if provided
        if (status === 'approved') {
            comments = comments.filter(comment => comment.isApproved);
        } else if (status === 'pending') {
            comments = comments.filter(comment => !comment.isApproved);
        }
        
        // Sort by creation date (newest first)
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Apply pagination
        const totalComments = comments.length;
        const paginatedComments = comments.slice(skip, skip + limit);
        const totalPages = Math.ceil(totalComments / limit);
        
        const formattedComments = paginatedComments.map(comment => ({
            id: comment._id,
            content: comment.content,
            user: {
                id: comment.user._id,
                fullName: comment.user.fullName,
                avatar: comment.user.avatar,
                email: comment.user.email
            },
            isApproved: comment.isApproved,
            createdAt: comment.createdAt
        }));
        
        return res.status(200).json(
            new ApiResponse(200, {
                comments: formattedComments,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalComments,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                article: {
                    id: article._id,
                    title: article.title,
                    totalComments: article.comments.length,
                    approvedComments: article.comments.filter(c => c.isApproved).length,
                    pendingComments: article.comments.filter(c => !c.isApproved).length
                }
            }, "Comments retrieved successfully")
        );
        
    } catch (error) {
        console.error('Get comments error:', error);
        throw new ApiError(500, "Failed to retrieve comments");
    }
});

// Approve a comment
const approveComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const writerId = req.user._id;
    
    try {
        const article = await Article.findOne({
            author: writerId,
            "comments._id": commentId,
            isArchived: false
        });
        
        if (!article) {
            throw new ApiError(404, "Comment not found or access denied");
        }
        
        const comment = article.comments.id(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        
        comment.isApproved = true;
        await article.save();
        
        return res.status(200).json(
            new ApiResponse(200, {
                commentId: comment._id,
                isApproved: comment.isApproved
            }, "Comment approved successfully")
        );
        
    } catch (error) {
        console.error('Approve comment error:', error);
        throw new ApiError(500, "Failed to approve comment");
    }
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const writerId = req.user._id;
    
    try {
        const article = await Article.findOne({
            author: writerId,
            "comments._id": commentId,
            isArchived: false
        });
        
        if (!article) {
            throw new ApiError(404, "Comment not found or access denied");
        }
        
        const comment = article.comments.id(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        
        comment.deleteOne();
        await article.save();
        
        return res.status(200).json(
            new ApiResponse(200, { commentId }, "Comment deleted successfully")
        );
        
    } catch (error) {
        console.error('Delete comment error:', error);
        throw new ApiError(500, "Failed to delete comment");    }
});

// Upload media files
const uploadMedia = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            throw new ApiError(400, "No file uploaded");
        }

        const file = req.file;
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw new ApiError(400, "Invalid file type. Only images are allowed.");
        }

        // Upload to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(file.path);
        
        if (!cloudinaryResponse) {
            throw new ApiError(500, "Failed to upload image to cloud storage");
        }

        // Save media info to database
        const media = await Media.create({
            filename: cloudinaryResponse.public_id,
            originalName: file.originalname,
            url: cloudinaryResponse.secure_url,
            cloudinaryId: cloudinaryResponse.public_id,
            size: cloudinaryResponse.bytes,
            mimeType: file.mimetype,
            uploadedBy: req.user._id,
            folder: req.body.folder || 'general'
        });

        return res.status(201).json(
            new ApiResponse(201, media, "Media uploaded successfully")
        );

    } catch (error) {
        console.error('Upload media error:', error);
        throw new ApiError(500, "Failed to upload media");
    }
});

// Get user's media library
const getMediaLibrary = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 20, folder, search } = req.query;
        const skip = (page - 1) * limit;

        const query = { uploadedBy: req.user._id };
        
        if (folder && folder !== 'all') {
            query.folder = folder;
        }
        
        if (search) {
            query.$or = [
                { originalName: { $regex: search, $options: 'i' } },
                { alt: { $regex: search, $options: 'i' } }
            ];
        }

        const media = await Media.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Media.countDocuments(query);

        return res.status(200).json(
            new ApiResponse(200, { media, total }, "Media library retrieved successfully")
        );

    } catch (error) {
        console.error('Get media library error:', error);
        throw new ApiError(500, "Failed to retrieve media library");
    }
});

const updateMedia = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { alt, caption } = req.body;

        const media = await Media.findOneAndUpdate(
            { _id: id, uploadedBy: req.user._id },
            { alt, caption },
            { new: true }
        );

        if (!media) {
            throw new ApiError(404, "Media not found");
        }

        return res.status(200).json(
            new ApiResponse(200, media, "Media updated successfully")
        );

    } catch (error) {
        throw new ApiError(500, "Failed to update media");
    }
});

const deleteMedia = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findOne({ _id: id, uploadedBy: req.user._id });
        if (!media) {
            throw new ApiError(404, "Media not found");
        }

        await deleteFromCloudinary(media.cloudinaryId);
        await Media.findByIdAndDelete(id);

        return res.status(200).json(
            new ApiResponse(200, null, "Media deleted successfully")
        );

    } catch (error) {
        throw new ApiError(500, "Failed to delete media");
    }
});

const getMediaFolders = asyncHandler(async (req, res) => {
    try {
        const folders = await Media.distinct('folder', { uploadedBy: req.user._id });
        
        return res.status(200).json(
            new ApiResponse(200, folders, "Folders retrieved successfully")
        );

    } catch (error) {
        throw new ApiError(500, "Failed to retrieve folders");
    }
});

export {
    getWriterDashboard,
    getWriterArticles,
    getWriterAnalytics,
    createArticle,
    updateArticle,
    deleteArticle,
    getCategories,
    getArticleById,
    getArticleComments,
    approveComment,
    deleteComment,
    uploadMedia,
    getMediaLibrary,
    updateMedia,
    deleteMedia,
    getMediaFolders
};
