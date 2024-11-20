import { Request, Response } from "express";
import { reviewSchema } from "../../utils/validation";
import Review from "../models/Review";
import mongoose from "mongoose";
import User from "../models/User";

const handleUserReview = async (
  userId: string,
  retreatId: string,
  reviews: any[]
) => {
  const reviewData = reviews.map((review) => ({
    rating: review.rating,
    comment: review.comment,
    helpfulCount: 0,
    datePosted: new Date(),
  }));

  let userReview = await Review.findOne({ userId, retreatId });

  if (userReview) {
    userReview.reviews.push(...reviewData);
    await userReview.save();
    return userReview;
  } else {
    const newReviewData = {
      userId,
      retreatId,
      reviews: reviewData,
    };
    const newReview = new Review(newReviewData);
    await newReview.save();
    return newReview;
  }
};

export const addReview = async (req: Request, res: Response) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { userId, retreatId, reviews } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(retreatId)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid userId or retreatId format" });
  }

  if (!Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({ message: "Invalid review format" });
  }

  try {
    const userReview = await handleUserReview(userId, retreatId, reviews);
    return res.status(201).json({
      message: "Review added successfully",
      reviews: userReview.reviews,
    });
  } catch (error) {
    console.error("Failed to add review:", error);
    return res.status(500).json({ message: "Failed to add review", error });
  }
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userReview = await Review.findOne({ userId }).lean();
    if (!userReview) {
      return res
        .status(404)
        .json({ message: "No reviews found for this user" });
    }

    return res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews: userReview.reviews,
    });
  } catch (error) {
    console.error("Failed to retrieve reviews:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve reviews", error });
  }
};

export const editReview = async (req: Request, res: Response) => {
  const { userId, reviewId } = req.params;
  const { rating, comment } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(reviewId)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid userId or reviewId format" });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const userReview = await Review.findOne({ userId });

    if (!userReview) {
      return res
        .status(404)
        .json({ message: "Review not found for this user" });
    }

    const reviewIndex = userReview.reviews.findIndex(
      (review) => review._id?.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    userReview.reviews[reviewIndex].rating = rating;
    userReview.reviews[reviewIndex].comment = comment;
    userReview.reviews[reviewIndex].datePosted = new Date();

    await userReview.save();

    return res.status(200).json({
      message: "Review updated successfully",
      reviews: userReview.reviews,
    });
  } catch (error) {
    console.error("Failed to update review:", error);
    return res.status(500).json({ message: "Failed to update review", error });
  }
};
