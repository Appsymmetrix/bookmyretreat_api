"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingControllers_1 = require("../controllers/bookingControllers");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const router = (0, express_1.Router)();
router.post("/add-retreat-bookings", (0, asyncHandler_1.default)(bookingControllers_1.createBooking));
router.get("/get-retreat-bookings/:userId", (0, asyncHandler_1.default)(bookingControllers_1.getBookingsByUserId));
router.get("/organizer/bookings", (0, asyncHandler_1.default)(bookingControllers_1.getAllBookingsForOrganizer));
router.patch("/accept-booking/:bookingId", (0, asyncHandler_1.default)(bookingControllers_1.acceptBooking));
router.patch("/deny-booking/:bookingId", (0, asyncHandler_1.default)(bookingControllers_1.denyBooking));
exports.default = router;
