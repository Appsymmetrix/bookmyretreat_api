import express from "express";
import {
  getUserById,
  loginUser,
  registerUser,
  updateUser,
  forgotPassword,
  resetPassword,
  verifyResetCode,
  verifyEmail,
  resendVerificationEmail,
  resendPasswordResetEmail,
  addUserImages,
} from "../controllers/authControllers";
import asyncHandler from "../../utils/asyncHandler";

const router = express.Router();

router.post("/register", asyncHandler(registerUser));
router.post("/verify-email", asyncHandler(verifyEmail));
router.post("/login", asyncHandler(loginUser));
router.post("/add-image/:userId", asyncHandler(addUserImages));

router.post(
  "/resend-verification-email",
  asyncHandler(resendVerificationEmail)
);
router.post(
  "/resend-password-reset-email",
  asyncHandler(resendPasswordResetEmail)
);

router.put("/update/:userId", asyncHandler(updateUser));
router.get("/my-profile/:userId", asyncHandler(getUserById));

router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/verify-reset-code", asyncHandler(verifyResetCode));
router.post("/reset-password", asyncHandler(resetPassword));

export default router;
