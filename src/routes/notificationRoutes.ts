import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  getNotificationsByUserId,
  getUnreadNotificationCount,
  markNotificationsAsRead,
  sendNotificationToAllUsers,
} from "../controllers/notificationController";

const router = express.Router();

router.post("/send-notifications", asyncHandler(sendNotificationToAllUsers));

router.get(
  "/get-notifications/:userId",
  asyncHandler(getNotificationsByUserId)
);

router.get(
  "/get-notifications/unread-count/:userId",
  asyncHandler(getUnreadNotificationCount)
);

router.patch(
  "/get-notifications/mark-read/:userId",
  asyncHandler(markNotificationsAsRead)
);

export default router;
