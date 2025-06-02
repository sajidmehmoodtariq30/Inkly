import mongoose, { Schema } from "mongoose";

const articleSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"]
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        content: {
            type: String,
            required: [true, "Content is required"]
        },
        excerpt: {
            type: String,
            maxlength: [500, "Excerpt cannot exceed 500 characters"],
            trim: true
        },
        featuredImage: {
            type: String, // URL to the featured image
            default: null
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        status: {
            type: String,
            enum: ["draft", "published", "archived", "review"],
            default: "draft"
        },
        publishedAt: {
            type: Date,
            default: null
        },
        readingTime: {
            type: Number, // in minutes
            default: 0
        },
        views: {
            type: Number,
            default: 0
        },
        likes: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            likedAt: {
                type: Date,
                default: Date.now
            }
        }],
        comments: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            content: {
                type: String,
                required: true,
                trim: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            isApproved: {
                type: Boolean,
                default: false
            }
        }],
        seo: {
            metaTitle: {
                type: String,
                maxlength: [60, "Meta title cannot exceed 60 characters"]
            },
            metaDescription: {
                type: String,
                maxlength: [160, "Meta description cannot exceed 160 characters"]
            },
            keywords: [{
                type: String,
                trim: true
            }]
        },
        isArchived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes for better performance
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ slug: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });

// Virtual for like count
articleSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for comment count
articleSchema.virtual('commentCount').get(function() {
    return this.comments.filter(comment => comment.isApproved).length;
});

// Calculate reading time based on content
articleSchema.pre('save', function(next) {
    if (this.isModified('content')) {
        const wordsPerMinute = 200;
        const wordCount = this.content.split(' ').length;
        this.readingTime = Math.ceil(wordCount / wordsPerMinute);
    }
    
    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    
    next();
});

// Generate slug from title
articleSchema.pre('save', async function(next) {
    if (this.isModified('title') && !this.slug) {
        let baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure unique slug
        while (await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    next();
});

// Instance method to increment views
articleSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save({ validateBeforeSave: false });
};

// Instance method to add like
articleSchema.methods.addLike = function(userId) {
    const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
    if (!existingLike) {
        this.likes.push({ user: userId });
        return this.save({ validateBeforeSave: false });
    }
    return Promise.resolve(this);
};

// Instance method to remove like
articleSchema.methods.removeLike = function(userId) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    return this.save({ validateBeforeSave: false });
};

// Instance method to add comment
articleSchema.methods.addComment = function(userId, content, isApproved = false) {
    this.comments.push({
        user: userId,
        content: content,
        isApproved: isApproved
    });
    return this.save({ validateBeforeSave: false });
};

// Static method to get published articles
articleSchema.statics.getPublished = function() {
    return this.find({ status: 'published', isArchived: false })
        .populate('author', 'fullName avatar')
        .populate('category', 'name slug')
        .sort({ publishedAt: -1 });
};

// Static method to get writer's articles
articleSchema.statics.getByWriter = function(writerId) {
    return this.find({ author: writerId, isArchived: false })
        .populate('category', 'name slug')
        .sort({ updatedAt: -1 });
};

export const Article = mongoose.model("Article", articleSchema);
