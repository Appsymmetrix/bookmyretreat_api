import { Request, Response } from "express";
import { reviewSchema } from "../../utils/validation";
import Review from "../models/Review";
import mongoose from "mongoose";
import User from "../models/User";
import Retreat from "../models/RetreatModal";

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
    userId: new mongoose.Types.ObjectId(userId),
    username: review.username,
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
    const user = await User.findById(userId).select("name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userReview = await handleUserReview(
      userId,
      retreatId,
      reviews.map((review) => ({
        ...review,
        username: user.name,
      }))
    );

    return res.status(201).json({
      message: "Review added successfully",
      reviews: userReview.reviews,
      userName: user.name,
    });
  } catch (error) {
    console.error("Failed to add review:", error);
    return res.status(500).json({ message: "Failed to add review", error });
  }
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
  const { userId, retreatId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(retreatId)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid userId or retreatId format" });
  }

  try {
    const user = await User.findById(userId).select("name").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userReview = await Review.findOne({ userId, retreatId }).lean();
    if (!userReview) {
      return res
        .status(404)
        .json({ message: "No reviews found for this user and retreat" });
    }

    return res.status(200).json({
      message: "Reviews retrieved successfully",
      userName: user.name,
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

export const getReviewsByRetreatId = async (req: Request, res: Response) => {
  const { retreatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(retreatId)) {
    return res.status(400).json({ message: "Invalid retreatId format" });
  }

  try {
    const retreat = await Retreat.findById(retreatId).select("title");

    if (!retreat) {
      return res.status(404).json({ message: "Retreat not found" });
    }

    const reviews = await Review.aggregate([
      {
        $match: { retreatId: new mongoose.Types.ObjectId(retreatId) },
      },
      {
        $unwind: "$reviews",
      },
      {
        $lookup: {
          from: "users",
          localField: "reviews.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: "$reviews._id",
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          helpfulCount: "$reviews.helpfulCount",
          datePosted: "$reviews.datePosted",
          username: { $ifNull: ["$userDetails.name", "Anonymous"] },
          retreatName: retreat.title,
        },
      },
    ]);

    if (!reviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this retreat" });
    }

    return res.status(200).json({
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return res.status(500).json({ message: "Failed to fetch reviews", error });
  }
};

export const adminEditReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ message: "Invalid reviewId format" });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const review = await Review.findOneAndUpdate(
      { "reviews._id": reviewId },
      {
        $set: {
          "reviews.$.rating": rating,
          "reviews.$.comment": comment,
          "reviews.$.datePosted": new Date(),
        },
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({
      message: "Review updated successfully",
      reviews: review.reviews,
    });
  } catch (error) {
    console.error("Failed to update review:", error);
    return res.status(500).json({ message: "Failed to update review", error });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId format" });
  }

  try {
    const userReviews = await Review.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $unwind: "$reviews",
      },
      {
        $lookup: {
          from: "retreats",
          localField: "retreatId",
          foreignField: "_id",
          as: "retreatDetails",
        },
      },
      {
        $unwind: {
          path: "$retreatDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          reviewId: "$reviews._id",
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          datePosted: "$reviews.datePosted",
          retreatId: "$retreatId",
          retreatTitle: "$retreatDetails.title",
        },
      },
    ]);

    if (!userReviews.length) {
      return res
        .status(404)
        .json({ message: "No reviews found for this user" });
    }

    return res.status(200).json({
      message: "User reviews fetched successfully",
      reviews: userReviews,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch user reviews", error });
  }
};
