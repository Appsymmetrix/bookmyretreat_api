import { Request, Response } from "express";
import User from "../models/User";

export const sendNotificationToAllUsers = async (
  req: Request,
  res: Response
) => {
  const { title, message } = req.body;

  try {
    const users = await User.find({ role: "user" });

    const updateNotificationsPromises = users.map((user) => {
      const notification = {
        title,
        message,
        createdAt: new Date(),
        read: false,
      };
      user.notifications.push(notification);
      return user.save();
    });

    await Promise.all(updateNotificationsPromises);

    res.status(201).json({ message: "Notifications sent to all users" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error sending notifications", error: err });
  }
};

export const getUnreadNotificationCount = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const unreadCount = user.notifications.filter((n) => !n.read).length;
    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching unread count", error: err });
  }
};

export const markNotificationsAsRead = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notifications.forEach((notification) => (notification.read = true));
    await user.save();

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error marking notifications as read", error: err });
  }
};

export const getNotificationsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sortedNotifications = user.notifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    res.status(200).json({ notifications: sortedNotifications });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: err });
  }
};
