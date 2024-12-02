import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistByServiceType,
  getWishlistByUser,
} from "../controllers/wishlistController";
import asyncHandler from "../../utils/asyncHandler";

const router = express.Router();

router.post("/add-wishlist/:userId", asyncHandler(addToWishlist));

router.delete(
  "/remove-wishlist/:userId/:serviceType/:serviceId",
  asyncHandler(removeFromWishlist)
);

router.get(
  "/all-wishlist/:userId/:serviceType",
  asyncHandler(getWishlistByServiceType)
);

router.get("/all-wishlist/:userId", asyncHandler(getWishlistByUser));

export default router;
