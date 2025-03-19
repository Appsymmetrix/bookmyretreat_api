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
exports.getNotificationsByUserId = exports.markNotificationsAsRead = exports.getUnreadNotificationCount = exports.sendNotificationToAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const sendNotificationToAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, message } = req.body;
    try {
        const users = yield User_1.default.find({ role: "user" });
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
        yield Promise.all(updateNotificationsPromises);
        res.status(201).json({ message: "Notifications sent to all users" });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Error sending notifications", error: err });
    }
});
exports.sendNotificationToAllUsers = sendNotificationToAllUsers;
const getUnreadNotificationCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const unreadCount = user.notifications.filter((n) => !n.read).length;
        res.status(200).json({ unreadCount });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Error fetching unread count", error: err });
    }
});
exports.getUnreadNotificationCount = getUnreadNotificationCount;
const markNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.notifications.forEach((notification) => (notification.read = true));
        yield user.save();
        res.status(200).json({ message: "Notifications marked as read" });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Error marking notifications as read", error: err });
    }
});
exports.markNotificationsAsRead = markNotificationsAsRead;
const getNotificationsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const sortedNotifications = user.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        res.status(200).json({ notifications: sortedNotifications });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Error fetching notifications", error: err });
    }
});
exports.getNotificationsByUserId = getNotificationsByUserId;
