import { Router } from "express";
import {
  createBooking,
  getBookingsByUserId,
} from "../controllers/bookingControllers";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.post("/add-retreat-bookings", asyncHandler(createBooking));

router.get("/get-retreat-bookings/:userId", asyncHandler(getBookingsByUserId));

export default router;
