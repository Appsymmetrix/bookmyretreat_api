import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  getUserNotifications,
  sendNotificationToAllUsers,
} from "../controllers/notificationController";

const router = express.Router();

router.post("/send-notifications", asyncHandler(sendNotificationToAllUsers));

router.get("/get-notifications/:userId", asyncHandler(getUserNotifications));

export default router;
