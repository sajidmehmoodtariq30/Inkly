import { Router } from "express";
import {
    getOverviewStats,
    getAllUsers,
    updateUserRole,
    banUser,
    getAllCategories,
    getAllComments,
    deleteComment
} from "../controllers/AdminController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin role required."
        });
    }
    next();
};

// Overview routes
router.route("/overview").get(getOverviewStats); // Temporarily removed auth for testing

// User management routes
router.route("/users").get(verifyJWT, requireAdmin, getAllUsers);
router.route("/users/:userId/role").put(verifyJWT, requireAdmin, updateUserRole);
router.route("/users/:userId/ban").put(verifyJWT, requireAdmin, banUser);

// Category management routes
router.route("/categories").get(verifyJWT, requireAdmin, getAllCategories);

// Comment management routes
router.route("/comments").get(verifyJWT, requireAdmin, getAllComments);
router.route("/comments/:commentId").delete(verifyJWT, requireAdmin, deleteComment);

export default router;
