// routes/subscriptionRoutes.ts
import express from "express";
import { subscribeRetreat } from "../controllers/subscriptionController";
import asyncHandler from "../../utils/asyncHandler";

const router = express.Router();

router.post("/retreat-subscription", asyncHandler(subscribeRetreat));

export default router;
