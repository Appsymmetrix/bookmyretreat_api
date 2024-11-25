import { Request, Response } from "express";
import Wishlist from "../models/Wishlist";
import Retreat from "../models/RetreatModal";
import mongoose from "mongoose";

// Helper to validate ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId, retreatId } = req.body;

  // Validate inputs
  if (!userId || !retreatId) {
    return res.status(400).json({
      success: false,
      message: "userId and retreatId are required.",
    });
  }

  if (!isValidObjectId(userId) || !isValidObjectId(retreatId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid userId or retreatId format.",
    });
  }

  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: [{ retreatId, addedAt: new Date() }],
      });
      await wishlist.save();
    } else {
      const existingItem = wishlist.items.some(
        (item) => item.retreatId.toString() === retreatId.toString()
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Retreat is already in the wishlist.",
        });
      }

      wishlist.items.push({ retreatId, addedAt: new Date() });
      wishlist.updatedAt = new Date();
      await wishlist.save();
    }

    await Retreat.findByIdAndUpdate(retreatId, { isWishlisted: true });

    return res.status(201).json({
      success: true,
      message: "Retreat added to wishlist successfully.",
      data: wishlist,
    });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while adding to wishlist.",
    });
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId, retreatId } = req.body;

  // Validate inputs
  if (!userId || !retreatId) {
    return res.status(400).json({
      success: false,
      message: "userId and retreatId are required.",
    });
  }

  if (!isValidObjectId(userId) || !isValidObjectId(retreatId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid userId or retreatId format.",
    });
  }

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found.",
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.retreatId.toString() !== retreatId.toString()
    );

    wishlist.updatedAt = new Date();
    await wishlist.save();

    await Retreat.findByIdAndUpdate(retreatId, { isWishlisted: false });

    return res.status(200).json({
      success: true,
      message: "Retreat removed from wishlist successfully.",
    });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while removing from wishlist.",
    });
  }
};

export const getUserWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId parameter is required.",
    });
  }

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid userId format.",
    });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const wishlist = await Wishlist.findOne({ userId: userObjectId })
      .populate("items.retreatId")
      .lean();

    if (!wishlist || wishlist.items.length === 0) {
      console.log("No wishlist items found for this user.");
      return res.status(200).json({
        success: true,
        message: "User's wishlist is empty.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "User's wishlist fetched successfully.",
      data: wishlist.items,
    });
  } catch (err) {
    console.error("Error retrieving user's wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching wishlist.",
    });
  }
};
