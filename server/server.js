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
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

import userRouter from './routes/UserRoutes.js';
import adminRouter from './routes/AdminRoutes.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);


app.listen(Port, () => {
    console.log("Server is running on port " + Port);
});
