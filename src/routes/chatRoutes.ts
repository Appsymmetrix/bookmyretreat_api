import express from "express";
import {
  addMessageToChat,
  getChatWithRetreatTitle,
  getChatWithUserName,
} from "../controllers/chatControllers";
import asyncHandler from "../../utils/asyncHandler";

const router = express.Router();

router.post("/post-chat", asyncHandler(addMessageToChat));

router.get("/get-chat/:userId", asyncHandler(getChatWithRetreatTitle));

router.get("/get-chat-users/:organizerId", asyncHandler(getChatWithUserName));

export default router;
