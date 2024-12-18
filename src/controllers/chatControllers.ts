import { Request, Response } from "express";
import Chat from "../models/Chat";
import mongoose from "mongoose";
import Retreat from "../models/RetreatModal";

export const addMessageToChat = async (req: Request, res: Response) => {
  try {
    const { retreatId, userId, organiserId, sentBy, msg } = req.body;

    if (!retreatId || !sentBy || !msg || (!userId && !organiserId)) {
      return res.status(400).json({
        success: false,
        message:
          "retreatId, sentBy, msg, and either userId or organiserId are required.",
      });
    }

    if (!["user", "organiser"].includes(sentBy)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid value for 'sentBy'. Allowed values: 'user', 'organiser'.",
      });
    }

    const query =
      sentBy === "organiser"
        ? { retreatId, organiserId }
        : { retreatId, userId };

    const chat = await Chat.findOne(query);

    if (chat) {
      chat.messages.push({ sentBy, msg, createTime: new Date() });
      await chat.save();
      return res.status(200).json({
        success: true,
        message: "Message added successfully",
        data: chat,
      });
    } else {
      const newChat = new Chat({
        retreatId,
        userId: sentBy === "user" ? userId : null,
        organiserId: sentBy === "organiser" ? organiserId : null,
        messages: [{ sentBy, msg, createTime: new Date() }],
      });
      await newChat.save();
      return res.status(201).json({
        success: true,
        message: "Chat created and message added successfully",
        data: newChat,
      });
    }
  } catch (err: any) {
    console.error("Error in addMessageToChat:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const getChatWithRetreatTitle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is a required query parameter.",
      });
    }

    const result = await Chat.aggregate([
      {
        $match: {
          $or: [
            { userId: new mongoose.Types.ObjectId(userId) },
            { organiserId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $lookup: {
          from: "retreats",
          localField: "retreatId",
          foreignField: "_id",
          as: "retreatDetails",
        },
      },
      {
        $unwind: {
          path: "$retreatDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          retreatId: 1,
          title: "$retreatDetails.title",
          userId: 1,
          organiserId: 1,
          messages: 1,
          imageUrl: { $arrayElemAt: ["$retreatDetails.imageUrls", 0] },
        },
      },
      { $sort: { "messages.createTime": 1 } },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chats found for the given userId.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chats retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("Error in getChatWithRetreatTitle:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const getChatWithUserName = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.params;

    if (!organizerId) {
      return res.status(400).json({
        success: false,
        message: "organizerId is required.",
      });
    }

    const retreats = await Retreat.find({ organizerId }).select("_id");

    if (retreats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No retreats found for the given organizerId.",
      });
    }

    const retreatIds = retreats.map(
      (retreat) => new mongoose.Types.ObjectId(String(retreat._id))
    );

    const chats = await Chat.aggregate([
      {
        $match: {
          retreatId: { $in: retreatIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          userName: "$userDetails.name",
        },
      },
      {
        $project: {
          userDetails: 0,
          retreatDetails: 0,
        },
      },
      {
        $limit: 100,
      },
    ]);

    if (chats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chats found for the given retreats of the organizerId.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat data retrieved successfully.",
      data: chats,
    });
  } catch (err: any) {
    console.error("Error in getChatWithUserName:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
