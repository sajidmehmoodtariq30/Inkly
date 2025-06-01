import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
            index: true,
            maxlength: [50, "Category name cannot exceed 50 characters"]
        },        
        slug: {
            type: String,
            unique: true,
            index: true,
            lowercase: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"]
        },
        color: {
            type: String,
            default: "#3B82F6", // Default blue color
            match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please provide a valid hex color"]
        },
        icon: {
            type: String,
            default: "Hash" // Default Lucide icon name
        },
        isVisible: {
            type: Boolean,
            default: true,
            index: true
        },
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },
        sortOrder: {
            type: Number,
            default: 0
        },
        postCount: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Create slug from name before saving
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // Remove special characters
            .replace(/\s+/g, '-')        // Replace spaces with hyphens
            .replace(/-+/g, '-')         // Replace multiple hyphens with single
            .trim('-');                  // Remove leading/trailing hyphens
    }
    
    // Ensure slug is always present
    if (!this.slug) {
        return next(new Error('Slug generation failed'));
    }
    
    next();
});

// Ensure unique slug
categorySchema.pre('save', async function(next) {
    if (this.isModified('name')) {
        const baseSlug = this.slug;
        let counter = 1;
        let newSlug = baseSlug;
        
        while (true) {
            const existingCategory = await this.constructor.findOne({ 
                slug: newSlug, 
                _id: { $ne: this._id } 
            });
            
            if (!existingCategory) {
                this.slug = newSlug;
                break;
            }
            
            newSlug = `${baseSlug}-${counter}`;
            counter++;
        }
    }
    next();
});

// Index for better query performance
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ isVisible: 1, sortOrder: 1 });
categorySchema.index({ parentCategory: 1, sortOrder: 1 });

// Virtual for child categories
categorySchema.virtual('childCategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory'
});

// Virtual for full path (for nested categories)
categorySchema.virtual('fullPath').get(function() {
    return this.parentCategory ? `${this.parentCategory.name} > ${this.name}` : this.name;
});

// Static method to get category hierarchy
categorySchema.statics.getHierarchy = async function() {
    const categories = await this.find({ isVisible: true })
        .populate('parentCategory', 'name slug')
        .sort({ sortOrder: 1, name: 1 });
    
    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories = [];
    
    categories.forEach(category => {
        categoryMap.set(category._id.toString(), { ...category.toObject(), children: [] });
    });
    
    categories.forEach(category => {
        if (category.parentCategory) {
            const parent = categoryMap.get(category.parentCategory._id.toString());
            if (parent) {
                parent.children.push(categoryMap.get(category._id.toString()));
            }
        } else {
            rootCategories.push(categoryMap.get(category._id.toString()));
        }
    });
    
    return rootCategories;
};

// Static method to update post count
categorySchema.statics.updatePostCount = async function(categoryId) {
    // This will be implemented when Post model is ready
    // For now, just return
    return;
};

export const Category = mongoose.model("Category", categorySchema);
