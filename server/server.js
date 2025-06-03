import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './database/index.js';

dotenv.config();

const Port = process.env.PORT || 3000;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://inklyserver.vercel.app',
        'http://localhost:3000',
        'https://inkly-mu.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Language', 'X-CSRF-Token']
}));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

import userRouter from './routes/UserRoutes.js';
import adminRouter from './routes/AdminRoutes.js';
import writerRouter from './routes/WriterRoutes.js';
import { getPublicCategories, getPublicStats } from './controllers/AuthController.js';

// Direct public routes (without /users prefix)
app.get("/api/v1/categories", getPublicCategories);
app.get("/api/v1/stats", getPublicStats);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/writer", writerRouter);


app.listen(Port, () => {
    console.log("Server is running on port " + Port);
});
