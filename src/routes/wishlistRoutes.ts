import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} from "../controllers/wishlistController";
import asyncHandler from "../../utils/asyncHandler";

const router = express.Router();

router.post("/add-wishlist", asyncHandler(addToWishlist));

router.delete("/remove-wishlist", asyncHandler(removeFromWishlist));

router.get("/all-wishlist/:userId", asyncHandler(getUserWishlist));

export default router;
