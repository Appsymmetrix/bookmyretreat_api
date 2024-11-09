import { Router } from "express";
import {
  createBooking,
  getBookingsByUserId,
  acceptBooking,
  denyBooking,
  getAllBookingsForOrganizer,
} from "../controllers/bookingControllers";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.post("/add-retreat-bookings", asyncHandler(createBooking));

router.get("/get-retreat-bookings/:userId", asyncHandler(getBookingsByUserId));

router.get("/organizer/bookings", asyncHandler(getAllBookingsForOrganizer));

router.patch("/accept-booking/:bookingId", asyncHandler(acceptBooking));

router.patch("/deny-booking/:bookingId", asyncHandler(denyBooking));

export default router;
