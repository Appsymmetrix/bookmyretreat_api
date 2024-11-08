import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  addReview,
  getReviewsByUserId,
} from "../controllers/reviewControllers";

const router = express.Router();

router.post("/add-review", asyncHandler(addReview));

router.get("/get-review/:userId", asyncHandler(getReviewsByUserId));

export default router;
