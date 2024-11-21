import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  addReview,
  getReviewsByUserId,
} from "../controllers/reviewControllers";

const router = express.Router();

router.post("/add-review", asyncHandler(addReview));

router.get("/get-review/:userId/:retreatId", asyncHandler(getReviewsByUserId));

export default router;
