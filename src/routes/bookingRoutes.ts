import { Router } from "express";
import {
  createBooking,
  getBookingsByUserId,
  getAllBookingsForOrganizer,
  cancelBooking,
  getAllBookingsForOrganizerSummary,
  getBookingsForRetreat,
  getMonthlyRevenue,
} from "../controllers/bookingControllers";
import asyncHandler from "../../utils/asyncHandler";
import {
  getAllBookingsByUser,
  getOrganizersDashboard,
  getUsersDashboard,
} from "../controllers/adminControllers";

const router = Router();

router.post("/add-retreat-bookings", asyncHandler(createBooking));

router.get("/get-retreat-bookings/:userId", asyncHandler(getBookingsByUserId));

router.get(
  "/bookings/organizer/:organizerId",
  asyncHandler(getAllBookingsForOrganizer)
);

//users
router.get("/bookings/get-organiser-user", asyncHandler(getUsersDashboard));

router.get("/bookings/get-user/:userId", asyncHandler(getAllBookingsByUser));

//organisers
router.get("/bookings/get-organiser", asyncHandler(getOrganizersDashboard));
router.get(
  "/bookings/get-organiser-summary/:organizerId",
  asyncHandler(getAllBookingsForOrganizerSummary)
);

router.get(
  "/bookings/organizer/:organizerId/retreat/:retreatId",
  asyncHandler(getBookingsForRetreat)
);

router.patch(
  "/bookings/cancel-bookings/:bookingId",
  asyncHandler(cancelBooking)
);

router.get("/bookings/revenue/:organiserId", asyncHandler(getMonthlyRevenue));

export default router;
