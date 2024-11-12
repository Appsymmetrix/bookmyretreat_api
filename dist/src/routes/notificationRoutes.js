"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.post("/send-notifications", (0, asyncHandler_1.default)(notificationController_1.sendAdminMessage));
router.get("/get-notifications/:userId", (0, asyncHandler_1.default)(notificationController_1.getNotifications));
exports.default = router;
