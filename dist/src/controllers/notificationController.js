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
exports.sendAdminMessage = exports.getNotifications = exports.sendNotification = void 0;
const User_1 = __importDefault(require("../models/User"));
const sendNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, message } = req.body;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.notifications.push({ title, message });
        yield user.save();
        return res.status(200).json(user);
    }
    catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.sendNotification = sendNotification;
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user.notifications);
    }
    catch (error) {
        console.error("Error retrieving notifications:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getNotifications = getNotifications;
const sendAdminMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, message } = req.body;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.notifications.push({
            title: title,
            message: message,
        });
        yield user.save();
        return res.status(200).json(user);
    }
    catch (error) {
        console.error("Error sending admin message:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.sendAdminMessage = sendAdminMessage;
