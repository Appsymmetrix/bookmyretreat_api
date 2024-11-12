import { Request, Response } from "express";
import Retreat from "../models/RetreatModal";
import Wishlist from "../models/Wishlist";

export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId, retreatId } = req.body;

  if (!userId || !retreatId) {
    return res.status(400).json({
      success: false,
      message: "userId and retreatId are required.",
    });
  }

  try {
    const existingWishlist = await Wishlist.findOne({
      userId,
      retreatId,
    }).lean();
    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        message: "Retreat is already in the wishlist",
      });
    }

    const newWishlist = new Wishlist({ userId, retreatId });
    await newWishlist.save();

    await Retreat.findByIdAndUpdate(retreatId, { isWishlisted: true });

    return res.status(201).json({
      success: true,
      message: "Retreat added to wishlist successfully",
      data: newWishlist,
    });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while adding to wishlist",
    });
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId, retreatId } = req.body;

  if (!userId || !retreatId) {
    return res.status(400).json({
      success: false,
      message: "userId and retreatId are required.",
    });
  }

  try {
    const deletedWishlist = await Wishlist.findOneAndDelete({
      userId,
      retreatId,
    });

    if (!deletedWishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist entry not found",
      });
    }

    await Retreat.findByIdAndUpdate(retreatId, { isWishlisted: false });

    return res.status(200).json({
      success: true,
      message: "Retreat removed from wishlist successfully",
    });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while removing from wishlist",
    });
  }
};

export const getUserWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId } = req.params;

  // Validate userId
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId parameter is required",
    });
  }

  try {
    const userWishlist = await Wishlist.find({ userId })
      .populate("retreatId")
      .lean();

    if (!userWishlist || userWishlist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No wishlist items found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User's wishlist fetched successfully",
      data: userWishlist,
    });
  } catch (err) {
    console.error("Error retrieving user's wishlist:", err);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching wishlist",
    });
  }
};
