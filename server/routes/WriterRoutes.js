import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = Router();

// Middleware to check writer role
const requireWriter = (req, res, next) => {
    if (req.user.role !== 'writer') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Writer role required."
        });
    }
    next();
};

// Writer dashboard routes will be added here
// Example routes structure:

// GET /api/writer/dashboard - Get writer dashboard overview
// GET /api/writer/articles - Get writer's articles
// POST /api/writer/articles - Create new article
// PUT /api/writer/articles/:id - Update article
// DELETE /api/writer/articles/:id - Delete article
// GET /api/writer/analytics - Get writer analytics
// GET /api/writer/comments - Get writer's article comments

// Placeholder routes for now
router.route("/dashboard").get(verifyJWT, requireWriter, (req, res) => {
    res.json({
        success: true,
        message: "Writer dashboard access granted",
        data: {
            message: "Welcome to the writer dashboard!"
        }
    });
});

export default router;
