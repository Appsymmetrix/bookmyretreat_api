import express from "express";
import {
  getUserById,
  loginUser,
  registerUser,
  updateUser,
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from "../controllers/authControllers";
import asyncHandler from "../../utils/asyncHandler";

const router = express.Router();

// Authentication routes
router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));

// User profile routes
router.put("/update/:userId", asyncHandler(updateUser));
router.get("/my-profile/:userId", asyncHandler(getUserById));

// Password reset routes
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/verify-reset-code", asyncHandler(verifyResetCode));
router.post("/reset-password", asyncHandler(resetPassword));

export default router;
