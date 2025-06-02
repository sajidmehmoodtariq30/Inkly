import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";
import {
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
} from "../controllers/WriterController.js";

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

// Writer dashboard routes
router.route("/dashboard").get(verifyJWT, requireWriter, getWriterDashboard);
router.route("/articles").get(verifyJWT, requireWriter, getWriterArticles);
router.route("/articles").post(verifyJWT, requireWriter, createArticle);
router.route("/articles/:id").get(verifyJWT, requireWriter, getArticleById);
router.route("/articles/:id").put(verifyJWT, requireWriter, updateArticle);
router.route("/articles/:id").delete(verifyJWT, requireWriter, deleteArticle);
router.route("/analytics").get(verifyJWT, requireWriter, getWriterAnalytics);
router.route("/categories").get(verifyJWT, requireWriter, getCategories);

// Comment management routes
router.route("/articles/:id/comments").get(verifyJWT, requireWriter, getArticleComments);
router.route("/comments/:commentId/approve").put(verifyJWT, requireWriter, approveComment);
router.route("/comments/:commentId").delete(verifyJWT, requireWriter, deleteComment);

// Media management routes
router.route("/media").get(verifyJWT, requireWriter, getMediaLibrary);
router.route("/media").post(verifyJWT, requireWriter, upload.single('image'), uploadMedia);
router.route("/media/:id").put(verifyJWT, requireWriter, updateMedia);
router.route("/media/:id").delete(verifyJWT, requireWriter, deleteMedia);
router.route("/media/folders").get(verifyJWT, requireWriter, getMediaFolders);

export default router;
