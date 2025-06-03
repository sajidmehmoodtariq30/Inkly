import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    GoogleLogin,
    refreshAccessToken,
    getCurrentUser,
    updateUser,
    getPublicCategories,
} from "../controllers/AuthController.js";
import { upload } from "../middleware/multerMiddleware.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/googleLogin").post(GoogleLogin);

// public routes
router.route("/categories").get(getPublicCategories);

// secured Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/profile").get(verifyJWT, getCurrentUser);
router.route("/profile").put(
    verifyJWT,
    upload.fields([
        { name: "avatar", maxCount: 1 }
    ]),
    updateUser
);

export default router;