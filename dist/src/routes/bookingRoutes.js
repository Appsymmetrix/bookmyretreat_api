"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingControllers_1 = require("../controllers/bookingControllers");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const adminControllers_1 = require("../controllers/adminControllers");
const router = (0, express_1.Router)();
router.post("/add-retreat-bookings", (0, asyncHandler_1.default)(bookingControllers_1.createBooking));
router.get("/get-retreat-bookings/:userId", (0, asyncHandler_1.default)(bookingControllers_1.getBookingsByUserId));
router.get("/bookings/organizer/:organizerId", (0, asyncHandler_1.default)(bookingControllers_1.getAllBookingsForOrganizer));
//users
router.get("/bookings/get-organiser-user", (0, asyncHandler_1.default)(adminControllers_1.getUsersDashboard));
router.get("/bookings/get-user/:userId", (0, asyncHandler_1.default)(adminControllers_1.getAllBookingsByUser));
//organisers
router.get("/bookings/get-organiser", (0, asyncHandler_1.default)(adminControllers_1.getOrganizersDashboard));
router.get("/bookings/get-organiser-summary/:organizerId", (0, asyncHandler_1.default)(bookingControllers_1.getAllBookingsForOrganizerSummary));
router.get("/bookings/organizer/:organizerId/retreat/:retreatId", (0, asyncHandler_1.default)(bookingControllers_1.getBookingsForRetreat));
router.patch("/bookings/cancel-bookings/:bookingId", (0, asyncHandler_1.default)(bookingControllers_1.cancelBooking));
router.get("/bookings/revenue/:organiserId", (0, asyncHandler_1.default)(bookingControllers_1.getMonthlyRevenue));
exports.default = router;
