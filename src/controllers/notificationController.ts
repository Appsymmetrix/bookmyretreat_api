import { Request, Response } from "express";
import User from "../models/User";

export const sendNotification = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { userId, title, message } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.notifications.push({ title, message });
    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user.notifications);
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

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.notifications.push({
      title: title,
      message: message,
    });
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error sending admin message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
