import { Router } from "express";
import {
  createBooking,
  getBookingsByUserId,
  getAllBookingsForOrganizer,
} from "../controllers/bookingControllers";
import asyncHandler from "../../utils/asyncHandler";
import { getAdminDashboard } from "../controllers/adminControllers";

const router = Router();

router.post("/add-retreat-bookings", asyncHandler(createBooking));

router.get("/get-retreat-bookings/:userId", asyncHandler(getBookingsByUserId));

router.get(
  "/bookings/organizer/:retreatId",
  asyncHandler(getAllBookingsForOrganizer)
);

router.get("/bookings/get-organiser-user", asyncHandler(getAdminDashboard));

export default router;
