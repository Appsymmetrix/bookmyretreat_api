"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatControllers_1 = require("../controllers/chatControllers");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const router = express_1.default.Router();
router.post("/post-chat", (0, asyncHandler_1.default)(chatControllers_1.addMessageToChat));
router.get("/get-chat/:userId", (0, asyncHandler_1.default)(chatControllers_1.getChatWithRetreatTitle));
router.get("/get-chat-users/:organizerId", (0, asyncHandler_1.default)(chatControllers_1.getChatWithUserName));
exports.default = router;
