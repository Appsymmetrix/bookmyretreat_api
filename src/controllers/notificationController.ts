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

export const getUserNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ notifications: user.notifications });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: err });
  }
};
