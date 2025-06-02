import mongoose from 'mongoose';
import { Category } from './models/CategoryModel.js';
import connectDB from './database/index.js';

const defaultCategories = [
    {
        name: 'Technology',
        description: 'Articles about technology, programming, and innovation',
        color: '#3B82F6',
        icon: 'Laptop'
    },
    {
        name: 'Lifestyle',
        description: 'Articles about lifestyle, health, and personal development',
        color: '#10B981',
        icon: 'Heart'
    },
    {
        name: 'Business',
        description: 'Articles about business, entrepreneurship, and finance',
        color: '#F59E0B',
        icon: 'Briefcase'
    },
    {
        name: 'Travel',
        description: 'Articles about travel, adventure, and exploration',
        color: '#EF4444',
        icon: 'MapPin'
    },
    {
        name: 'Food & Cooking',
        description: 'Articles about recipes, cooking tips, and food culture',
        color: '#8B5CF6',
        icon: 'ChefHat'
    },
    {
        name: 'Arts & Culture',
        description: 'Articles about art, culture, books, and entertainment',
        color: '#EC4899',
        icon: 'Palette'
    }
];

const seedCategories = async () => {
    try {
        await connectDB();
        
        // Check if categories already exist
        const existingCategories = await Category.countDocuments();
        if (existingCategories > 0) {
            console.log('Categories already exist. Skipping seed.');
            return;
        }        // Create categories without createdBy field for now
        const categories = defaultCategories;

        await Category.insertMany(categories);
        console.log('Default categories created successfully!');
        
        const createdCategories = await Category.find().select('name slug');
        console.log('Created categories:', createdCategories);
        
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await mongoose.connection.close();
    }
};

seedCategories();
