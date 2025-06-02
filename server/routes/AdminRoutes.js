import { Router } from "express";
import {
    getOverviewStats,
    getAllUsers,
    createUser,
    updateUserRole,
    banUser,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryVisibility,
    bulkDeleteCategories,
    getCategoryHierarchy,
    getAllComments,
    deleteComment,
    getAnalytics
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
router.route("/overview").get(verifyJWT, requireAdmin, getOverviewStats);
router.route("/analytics").get(verifyJWT, requireAdmin, getAnalytics);

// User management routes
router.route("/users").get(verifyJWT, requireAdmin, getAllUsers);
router.route("/users").post(verifyJWT, requireAdmin, createUser);
router.route("/users/:userId/role").put(verifyJWT, requireAdmin, updateUserRole);
router.route("/users/:userId/ban").put(verifyJWT, requireAdmin, banUser);

// Category management routes
router.route("/categories").get(verifyJWT, requireAdmin, getAllCategories);
router.route("/categories").post(verifyJWT, requireAdmin, createCategory);
router.route("/categories/bulk").delete(verifyJWT, requireAdmin, bulkDeleteCategories);
router.route("/categories/hierarchy").get(verifyJWT, requireAdmin, getCategoryHierarchy);
router.route("/categories/:id").put(verifyJWT, requireAdmin, updateCategory);
router.route("/categories/:id").delete(verifyJWT, requireAdmin, deleteCategory);
router.route("/categories/:id/visibility").put(verifyJWT, requireAdmin, toggleCategoryVisibility);

// Comment management routes
router.route("/comments").get(verifyJWT, requireAdmin, getAllComments);
router.route("/comments/:commentId").delete(verifyJWT, requireAdmin, deleteComment);

export default router;
