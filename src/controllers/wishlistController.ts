import { Request, Response } from "express";
import Retreat from "../models/RetreatModal";
import Wishlist from "../models/WishList";

export const addToWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId, retreatId } = req.body;

  try {
    const existingWishlist = await Wishlist.findOne({ userId, retreatId });
    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        message: "Retreat is already in the wishlist",
      });
    }

    const newWishlist = new Wishlist({
      userId,
      retreatId,
    });

    await newWishlist.save();

    await Retreat.findByIdAndUpdate(retreatId, { isWishlisted: true });

    return res.status(201).json({
      success: true,
      message: "Retreat added to wishlist successfully",
      data: newWishlist,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId, retreatId } = req.body;

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
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserWishlist = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId } = req.params;

  try {
    const userWishlist = await Wishlist.find({ userId });

    if (!userWishlist || userWishlist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No wishlist items found for this user",
      });
    }

    const retreatIds = userWishlist.map((item) => item.retreatId);

    return res.status(200).json({
      success: true,
      message: "User's wishlist fetched successfully",
      data: retreatIds,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
