"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBookingsForOrganizer = exports.denyBooking = exports.acceptBooking = exports.getBookingsByUserId = exports.createBooking = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const validation_1 = require("../../utils/validation");
const types_1 = require("../../utils/types");
const mongoose_1 = __importDefault(require("mongoose"));
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.bookingValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    const { userId, dates, numberOfPeople, personName, accommodation, totalAmount, } = req.body;
    try {
        const orderId = (0, types_1.generateOrderId)();
        const newBooking = new Booking_1.default({
            userId,
            dates,
            numberOfPeople,
            personName,
            accommodation,
            totalAmount,
            orderId,
            status: "pending",
        });
        yield newBooking.save();
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: {
                id: newBooking._id,
                orderId: newBooking.orderId,
                dates: newBooking.dates,
                numberOfPeople: newBooking.numberOfPeople,
                personName: newBooking.personName,
                accommodation: newBooking.accommodation,
                totalAmount: newBooking.totalAmount,
                status: newBooking.status,
                userId: newBooking.userId,
            },
        });
    }
    catch (err) {
        console.error("Error creating booking:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.createBooking = createBooking;
const getBookingsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid User ID",
        });
    }
    try {
        const bookings = yield Booking_1.default.find({ userId }).exec();
        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found for this user",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            bookings: bookings.map((booking) => ({
                id: booking._id,
                orderId: booking.orderId,
                dates: booking.dates,
                numberOfPeople: booking.numberOfPeople,
                personName: booking.personName,
                accommodation: booking.accommodation,
                totalAmount: booking.totalAmount,
                status: booking.status,
            })),
        });
    }
    catch (err) {
        console.error("Error fetching bookings:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getBookingsByUserId = getBookingsByUserId;
const acceptBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Booking ID",
        });
    }
    try {
        const booking = yield Booking_1.default.findByIdAndUpdate(bookingId, { status: "accepted" }, { new: true });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Booking accepted successfully",
            booking,
        });
    }
    catch (err) {
        console.error("Error accepting booking:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.acceptBooking = acceptBooking;
// Deny a booking
const denyBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Booking ID",
        });
    }
    try {
        const booking = yield Booking_1.default.findByIdAndUpdate(bookingId, { status: "denied" }, { new: true });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Booking denied successfully",
            booking,
        });
    }
    catch (err) {
        console.error("Error denying booking:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.denyBooking = denyBooking;
const getAllBookingsForOrganizer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const totalBookings = yield Booking_1.default.countDocuments();
        const pendingApproval = yield Booking_1.default.countDocuments({ status: "pending" });
        const income = yield Booking_1.default.aggregate([
            { $match: { status: "accepted" } },
            { $group: { _id: null, totalIncome: { $sum: "$totalAmount" } } },
        ]);
        const bookings = yield Booking_1.default.find().exec();
        return res.status(200).json({
            success: true,
            message: "Booking statistics retrieved successfully",
            data: {
                totalBookings,
                pendingApproval,
                income: ((_a = income[0]) === null || _a === void 0 ? void 0 : _a.totalIncome) || 0,
                bookings: bookings.map((booking) => ({
                    id: booking._id,
                    orderId: booking.orderId,
                    dates: booking.dates,
                    numberOfPeople: booking.numberOfPeople,
                    personName: booking.personName,
                    accommodation: booking.accommodation,
                    totalAmount: booking.totalAmount,
                    status: booking.status,
                })),
            },
        });
    }
    catch (err) {
        console.error("Error retrieving booking data:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getAllBookingsForOrganizer = getAllBookingsForOrganizer;
