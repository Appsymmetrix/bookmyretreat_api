import { Request, Response } from "express";
import User from "../models/User";

const addNotificationToUser = async (
  userId: string,
  title: string,
  message: string
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.notifications.push({ title, message });
  await user.save();
  return user;
};

export const sendNotification = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { userId, title, message } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await addNotificationToUser(userId, title, message);
    return res.status(200).json({
      message: "Notification sent successfully",
      notifications: user.notifications,
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendAdminMessage = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { userId, title, message } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await addNotificationToUser(userId, title, message);
    return res.status(200).json({
      message: "Admin message sent successfully",
      notifications: user.notifications,
    });
  } catch (error: any) {
    console.error("Error sending admin message:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};
