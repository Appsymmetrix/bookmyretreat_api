import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  addReview,
  adminEditReview,
  getReviewsByRetreatId,
  getReviewsByUserId,
  getUserReviews,
} from "../controllers/reviewControllers";

const router = express.Router();

router.post("/add-review", asyncHandler(addReview));

router.get("/get-review/:userId/:retreatId", asyncHandler(getReviewsByUserId));

router.get("/get-review/:retreatId", asyncHandler(getReviewsByRetreatId));

router.put("/update-review/:reviewId", asyncHandler(adminEditReview));

router.get("/get-reviews/:userId", asyncHandler(getUserReviews));

export default router;
