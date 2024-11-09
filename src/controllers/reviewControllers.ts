// controllers/reviewController.ts
import { Request, Response } from "express";
import { reviewSchema } from "../../utils/validation";
import Review from "../models/Review";
import mongoose from "mongoose";
import User from "../models/User";

export const addReview = async (req: Request, res: Response) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { userId, reviews } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    let userReview = await Review.findOne({ userId });

    if (userReview) {
      if (Array.isArray(reviews) && reviews.length > 0) {
        reviews.forEach((review) => {
          const reviewData = {
            rating: review.rating,
            comment: review.comment,
            helpfulCount: 0,
            datePosted: new Date(),
          };
          userReview.reviews.push(reviewData);
        });

        await userReview.save();
        return res.status(200).json({
          message: "Review added successfully",
          reviews: userReview.reviews,
        });
      } else {
        return res.status(400).json({ message: "Invalid review format" });
      }
    } else {
      const newReviewData = {
        userId,
        reviews: reviews.map((review: any) => ({
          rating: review.rating,
          comment: review.comment,
          helpfulCount: 0,
          datePosted: new Date(),
        })),
      };

      const newReview = new Review(newReviewData);
      await newReview.save();

      return res.status(201).json({
        message: "Review added successfully",
        reviews: newReview.reviews,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error });
  }
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userReview = await Review.findOne({ userId });

    if (!userReview) {
      return res
        .status(404)
        .json({ message: "No reviews found for this user" });
    }

    const reviewsWithName = {
      name: user.name,
      reviews: userReview,
    };

    res.status(200).json(reviewsWithName);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve reviews", error });
  }
};
