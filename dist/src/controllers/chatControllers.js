"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatWithUserName = exports.getChatWithRetreatTitle = exports.addMessageToChat = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const mongoose_1 = __importDefault(require("mongoose"));
const RetreatModal_1 = __importDefault(require("../models/RetreatModal"));
const addMessageToChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { retreatId, userId, organiserId, sentBy, msg } = req.body;
        if (!retreatId || !sentBy || !msg || (!userId && !organiserId)) {
            return res.status(400).json({
                success: false,
                message: "retreatId, sentBy, msg, and either userId or organiserId are required.",
            });
        }
        if (!["user", "organiser"].includes(sentBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid value for 'sentBy'. Allowed values: 'user', 'organiser'.",
            });
        }
        const query = sentBy === "organiser"
            ? { retreatId, organiserId }
            : { retreatId, userId };
        const chat = yield Chat_1.default.findOne(query);
        if (chat) {
            chat.messages.push({ sentBy, msg, createTime: new Date() });
            yield chat.save();
            return res.status(200).json({
                success: true,
                message: "Message added successfully",
                data: chat,
            });
        }
        else {
            const newChat = new Chat_1.default({
                retreatId,
                userId: sentBy === "user" ? userId : null,
                organiserId: sentBy === "organiser" ? organiserId : null,
                messages: [{ sentBy, msg, createTime: new Date() }],
            });
            yield newChat.save();
            return res.status(201).json({
                success: true,
                message: "Chat created and message added successfully",
                data: newChat,
            });
        }
    }
    catch (err) {
        console.error("Error in addMessageToChat:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
});
exports.addMessageToChat = addMessageToChat;
const getChatWithRetreatTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is a required query parameter.",
            });
        }
        const result = yield Chat_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { userId: new mongoose_1.default.Types.ObjectId(userId) },
                        { organiserId: new mongoose_1.default.Types.ObjectId(userId) },
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
    }
    catch (err) {
        console.error("Error in getChatWithRetreatTitle:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
});
exports.getChatWithRetreatTitle = getChatWithRetreatTitle;
const getChatWithUserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizerId } = req.params;
        if (!organizerId) {
            return res.status(400).json({
                success: false,
                message: "organizerId is required.",
            });
        }
        const retreats = yield RetreatModal_1.default.find({ organizerId }).select("_id");
        if (retreats.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No retreats found for the given organizerId.",
            });
        }
        const retreatIds = retreats.map((retreat) => new mongoose_1.default.Types.ObjectId(String(retreat._id)));
        const chats = yield Chat_1.default.aggregate([
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
    }
    catch (err) {
        console.error("Error in getChatWithUserName:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
});
exports.getChatWithUserName = getChatWithUserName;
