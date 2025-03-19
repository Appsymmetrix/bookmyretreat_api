"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.post("/send-notifications", (0, asyncHandler_1.default)(notificationController_1.sendNotificationToAllUsers));
router.get("/get-notifications/:userId", (0, asyncHandler_1.default)(notificationController_1.getNotificationsByUserId));
router.get("/get-notifications/unread-count/:userId", (0, asyncHandler_1.default)(notificationController_1.getUnreadNotificationCount));
router.patch("/get-notifications/mark-read/:userId", (0, asyncHandler_1.default)(notificationController_1.markNotificationsAsRead));
exports.default = router;
