import mongoose, { Schema } from "mongoose";

const mediaSchema = new Schema(
    {
        filename: {
            type: String,
            required: true,
            trim: true
        },
        originalName: {
            type: String,
            required: true,
            trim: true
        },
        url: {
            type: String,
            required: true
        },
        cloudinaryId: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        alt: {
            type: String,
            default: ""
        },
        caption: {
            type: String,
            default: ""
        },
        folder: {
            type: String,
            default: "general"
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        usageCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Index for better performance
mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ cloudinaryId: 1 });
mediaSchema.index({ folder: 1 });

// Virtual for file extension
mediaSchema.virtual('extension').get(function() {
    return this.originalName.split('.').pop().toLowerCase();
});

// Instance method to increment usage count
mediaSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    return this.save({ validateBeforeSave: false });
};

export const Media = mongoose.model("Media", mediaSchema);
