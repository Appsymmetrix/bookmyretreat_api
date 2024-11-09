import express from "express";

import asyncHandler from "../../utils/asyncHandler";
import {
  getNotifications,
  sendAdminMessage,
} from "../controllers/notificationController";

const router = express.Router();

router.post("/send-notifications", asyncHandler(sendAdminMessage));

router.get("/get-notifications/:userId", asyncHandler(getNotifications));

export default router;
