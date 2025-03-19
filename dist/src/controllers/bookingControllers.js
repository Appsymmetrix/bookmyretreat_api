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
exports.getMonthlyRevenue = exports.getBookingsForRetreat = exports.getAllBookingsForOrganizerSummary = exports.getAllBookingsForOrganizer = exports.cancelBooking = exports.getBookingsByUserId = exports.createBooking = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const validation_1 = require("../../utils/validation");
const types_1 = require("../../utils/types");
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const User_1 = __importDefault(require("../models/User"));
const RetreatModal_1 = __importDefault(require("../models/RetreatModal"));
const isValidObjectId = (id) => mongoose_1.default.Types.ObjectId.isValid(id);
const handleDatabaseError = (err, res) => {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
};
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.bookingValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    const { userId, retreatId, dates, numberOfPeople, personName, accommodation, totalAmount, } = req.body;
    if (!isValidObjectId(retreatId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Retreat ID",
        });
    }
    try {
        const orderId = (0, types_1.generateOrderId)();
        const newBooking = new Booking_1.default({
            userId,
            retreatId,
            dates,
            numberOfPeople,
            personName,
            accommodation,
            totalAmount,
            orderId,
            status: "confirmed",
        });
        yield newBooking.save();
        const retreat = yield RetreatModal_1.default.findById(retreatId).select("title");
        const notification = {
            message: `Your booking for ${retreat === null || retreat === void 0 ? void 0 : retreat.title} has been confirmed successfully!`,
            createdAt: new Date(),
            read: false,
        };
        yield User_1.default.updateOne({ _id: userId }, { $push: { notifications: notification } });
        return res.status(201).json({
            success: true,
            message: "Booking confirmed successfully",
            booking: newBooking.toObject(),
        });
    }
    catch (err) {
        return handleDatabaseError(err, res);
    }
});
exports.createBooking = createBooking;
const getBookingsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid User ID",
        });
    }
    try {
        const categorizedBookings = yield Booking_1.default.aggregate([
            { $match: { userId: new mongoose_2.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "retreats",
                    localField: "retreatId",
                    foreignField: "_id",
                    as: "retreatDetails",
                },
            },
            {
                $unwind: { path: "$retreatDetails", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true },
            },
            {
                $addFields: {
                    personName: "$userDetails.name",
                    mobileNumber: "$userDetails.mobileNumber",
                    category: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$status", "cancelled"] },
                                    then: "canceled",
                                },
                                {
                                    case: { $eq: ["$status", "completed"] },
                                    then: "completed",
                                },
                                {
                                    case: { $eq: ["$status", "confirmed"] },
                                    then: "upcoming",
                                },
                                {
                                    case: {
                                        $or: [{ $eq: ["$status", null] }, { $eq: ["$status", ""] }],
                                    },
                                    then: "unconfirmed",
                                },
                            ],
                            default: "unknown",
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$category",
                    bookings: {
                        $push: {
                            _id: "$_id",
                            retreatId: "$retreatId",
                            retreatTitle: "$retreatDetails.title",
                            retreatAddress: "$retreatDetails.fullAddress",
                            dates: "$dates",
                            numberOfPeople: "$numberOfPeople",
                            accommodation: "$accommodation",
                            totalAmount: "$totalAmount",
                            status: "$status",
                            orderId: "$orderId",
                            personName: "$personName",
                            mobileNumber: "$mobileNumber",
                        },
                    },
                },
            },
            {
                $project: {
                    category: "$_id",
                    bookings: 1,
                    _id: 0,
                },
            },
        ]);
        const response = {
            upcoming: ((_a = categorizedBookings.find((c) => c.category === "upcoming")) === null || _a === void 0 ? void 0 : _a.bookings) ||
                [],
            completed: ((_b = categorizedBookings.find((c) => c.category === "completed")) === null || _b === void 0 ? void 0 : _b.bookings) ||
                [],
            canceled: ((_c = categorizedBookings.find((c) => c.category === "canceled")) === null || _c === void 0 ? void 0 : _c.bookings) ||
                [],
        };
        return res.status(200).json({
            success: true,
            message: "Bookings categorized successfully",
            data: response,
        });
    }
    catch (err) {
        return handleDatabaseError(err, res);
    }
});
exports.getBookingsByUserId = getBookingsByUserId;
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;
    if (!cancellationReason || cancellationReason.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Cancellation reason is required.",
        });
    }
    if (!isValidObjectId(bookingId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Booking ID",
        });
    }
    try {
        const result = yield Booking_1.default.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(bookingId) } },
            {
                $lookup: {
                    from: "retreats",
                    localField: "retreatId",
                    foreignField: "_id",
                    as: "retreatDetails",
                },
            },
            {
                $unwind: "$retreatDetails",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: "$userDetails",
            },
        ]).exec();
        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        const booking = result[0];
        const updatedBooking = yield Booking_1.default.findByIdAndUpdate(bookingId, { status: "cancelled", cancellationReason }, { new: true }).lean();
        const notification = {
            message: `Your booking for ${booking.retreatDetails.title} has been cancelled. Reason: ${cancellationReason}`,
            createdAt: new Date(),
            read: false,
        };
        yield User_1.default.updateOne({ _id: booking.userId }, { $push: { notifications: notification } });
        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully and notification sent.",
            booking: updatedBooking,
        });
    }
    catch (err) {
        return handleDatabaseError(err, res);
    }
});
exports.cancelBooking = cancelBooking;
const getAllBookingsForOrganizer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizerId } = req.params;
    if (!isValidObjectId(organizerId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Organizer ID",
        });
    }
    try {
        const organizer = yield User_1.default.findById(organizerId).select("organization");
        if (!organizer || !organizer.organization) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found or organization information is missing",
            });
        }
        const categorizedBookings = yield Booking_1.default.aggregate([
            {
                $lookup: {
                    from: "retreats",
                    localField: "retreatId",
                    foreignField: "_id",
                    as: "retreatDetails",
                },
            },
            { $unwind: "$retreatDetails" },
            {
                $match: {
                    "retreatDetails.organizerId": new mongoose_1.default.Types.ObjectId(organizerId),
                },
            },
            {
                $lookup: {
                    from: "users", // Lookup to the User collection
                    localField: "userId", // Assuming `userId` is the field in the Booking collection
                    foreignField: "_id", // Matching the `_id` field in the User collection
                    as: "userDetails", // The resulting array will be stored in "userDetails"
                },
            },
            { $unwind: "$userDetails" }, // Unwind to access the user details
            {
                $facet: {
                    confirmed: [
                        { $match: { status: "confirmed" } },
                        {
                            $project: {
                                _id: 1,
                                retreatId: 1,
                                retreatTitle: "$retreatDetails.title",
                                retreatAddress: "$retreatDetails.fullAddress",
                                dates: 1,
                                numberOfPeople: 1,
                                accommodation: 1,
                                totalAmount: 1,
                                status: 1,
                                orderId: 1,
                                personName: 1,
                                mobileNumber: "$userDetails.mobileNumber", // Extracting mobileNumber from userDetails
                                dateOfBooking: 1,
                            },
                        },
                    ],
                    completed: [
                        { $match: { status: "completed" } },
                        {
                            $project: {
                                _id: 1,
                                retreatId: 1,
                                retreatTitle: "$retreatDetails.title",
                                retreatAddress: "$retreatDetails.fullAddress",
                                dates: 1,
                                numberOfPeople: 1,
                                accommodation: 1,
                                totalAmount: 1,
                                status: 1,
                                orderId: 1,
                                personName: 1,
                                mobileNumber: "$userDetails.mobileNumber", // Extracting mobileNumber from userDetails
                                dateOfBooking: 1,
                            },
                        },
                    ],
                    cancelled: [
                        { $match: { status: "cancelled" } },
                        {
                            $project: {
                                _id: 1,
                                retreatId: 1,
                                retreatTitle: "$retreatDetails.title",
                                retreatAddress: "$retreatDetails.fullAddress",
                                dates: 1,
                                numberOfPeople: 1,
                                accommodation: 1,
                                totalAmount: 1,
                                status: 1,
                                orderId: 1,
                                personName: 1,
                                mobileNumber: "$userDetails.mobileNumber", // Extracting mobileNumber from userDetails
                                dateOfBooking: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    confirmed: 1,
                    completed: 1,
                    cancelled: 1,
                    totalBookings: {
                        $concatArrays: [
                            { $ifNull: ["$confirmed", []] },
                            { $ifNull: ["$completed", []] },
                            { $ifNull: ["$cancelled", []] },
                        ],
                    },
                },
            },
        ]);
        if (!categorizedBookings || categorizedBookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found for retreats created by this organizer",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Bookings categorized successfully",
            data: categorizedBookings[0],
            organization: organizer.organization.name,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching bookings",
            error: err.message,
        });
    }
});
exports.getAllBookingsForOrganizer = getAllBookingsForOrganizer;
const getAllBookingsForOrganizerSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizerId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(organizerId)) {
            return res.status(400).json({ error: "Invalid organizerId" });
        }
        const organizer = yield User_1.default.findOne({
            _id: organizerId,
            role: "organiser",
        });
        if (!organizer) {
            return res
                .status(404)
                .json({ error: "Organizer not found or not an organiser" });
        }
        const retreats = yield RetreatModal_1.default.find({
            organizerId: new mongoose_1.default.Types.ObjectId(organizerId),
        });
        const retreatIds = retreats.map((retreat) => retreat._id);
        const bookingSummary = yield Booking_1.default.aggregate([
            { $match: { retreatId: { $in: retreatIds } } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    newBookings: {
                        $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                    },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                    },
                    revenue: { $sum: "$totalAmount" },
                },
            },
        ]);
        const summary = bookingSummary[0] || {
            totalBookings: 0,
            newBookings: 0,
            cancelled: 0,
            completed: 0,
            revenue: 0,
        };
        return res.status(200).json({
            organizerId: organizer._id,
            organizerName: organizer.name,
            organization: organizer.organization
                ? {
                    name: organizer.organization.name,
                    imageUrl: organizer.organization.imageUrl,
                }
                : null,
            totalRetreats: retreats.length,
            retreats: [
                retreats.map((retreat) => (Object.assign({ retreatId: retreat._id, title: retreat.title }, summary))),
            ],
        });
    }
    catch (error) {
        console.error("Error in getAllBookingsForOrganizer:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllBookingsForOrganizerSummary = getAllBookingsForOrganizerSummary;
const getBookingsForRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizerId, retreatId } = req.params;
    if (!isValidObjectId(organizerId) || !isValidObjectId(retreatId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Organizer ID or Retreat ID",
        });
    }
    try {
        const organizer = yield User_1.default.findById(organizerId).select("organization");
        if (!organizer || !organizer.organization) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found or organization information is missing",
            });
        }
        const categorizedBookings = yield Booking_1.default.aggregate([
            {
                $lookup: {
                    from: "retreats",
                    localField: "retreatId",
                    foreignField: "_id",
                    as: "retreatDetails",
                },
            },
            { $unwind: "$retreatDetails" },
            {
                $match: {
                    "retreatDetails.organizerId": new mongoose_1.default.Types.ObjectId(organizerId),
                    "retreatDetails._id": new mongoose_1.default.Types.ObjectId(retreatId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $facet: {
                    confirmed: [
                        { $match: { status: "confirmed" } },
                        {
                            $project: {
                                _id: 1,
                                retreatId: 1,
                                retreatTitle: "$retreatDetails.title",
                                retreatAddress: "$retreatDetails.fullAddress",
                                dates: 1,
                                numberOfPeople: 1,
                                accommodation: 1,
                                totalAmount: 1,
                                status: 1,
                                orderId: 1,
                                personName: 1,
                                mobileNumber: "$userDetails.mobileNumber",
                                dateOfBooking: 1,
                            },
                        },
                    ],
                    completed: [
                        { $match: { status: "completed" } },
                        {
                            $project: {
                                _id: 1,
                                retreatId: 1,
                                retreatTitle: "$retreatDetails.title",
                                retreatAddress: "$retreatDetails.fullAddress",
                                dates: 1,
                                numberOfPeople: 1,
                                accommodation: 1,
                                totalAmount: 1,
                                status: 1,
                                orderId: 1,
                                personName: 1,
                                mobileNumber: "$userDetails.mobileNumber",
                                dateOfBooking: 1,
                            },
                        },
                    ],
                    cancelled: [
                        { $match: { status: "cancelled" } },
                        {
                            $project: {
                                _id: 1,
                                retreatId: 1,
                                retreatTitle: "$retreatDetails.title",
                                retreatAddress: "$retreatDetails.fullAddress",
                                dates: 1,
                                numberOfPeople: 1,
                                accommodation: 1,
                                totalAmount: 1,
                                status: 1,
                                orderId: 1,
                                personName: 1,
                                mobileNumber: "$userDetails.mobileNumber",
                                dateOfBooking: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    confirmed: 1,
                    completed: 1,
                    cancelled: 1,
                    totalBookings: {
                        $concatArrays: [
                            { $ifNull: ["$confirmed", []] },
                            { $ifNull: ["$completed", []] },
                            { $ifNull: ["$cancelled", []] },
                        ],
                    },
                },
            },
        ]);
        if (!categorizedBookings || categorizedBookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found for this retreat",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Bookings categorized successfully",
            data: categorizedBookings[0],
            organization: organizer.organization.name,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching bookings",
            error: err.message,
        });
    }
});
exports.getBookingsForRetreat = getBookingsForRetreat;
const getMonthlyRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organiserId } = req.params;
        if (!organiserId) {
            return res.status(400).json({ error: "organiserId is required." });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(organiserId)) {
            return res.status(400).json({ error: "Invalid organiserId format." });
        }
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const revenueData = monthNames.map((month) => ({
            monthName: month,
            totalRevenue: 0,
        }));
        const monthlyRevenue = yield Booking_1.default.aggregate([
            {
                $lookup: {
                    from: "retreats",
                    localField: "retreatId",
                    foreignField: "_id",
                    as: "retreat",
                },
            },
            {
                $unwind: "$retreat",
            },
            {
                $match: {
                    "retreat.organizerId": new mongoose_1.default.Types.ObjectId(organiserId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $addFields: {
                    month: { $month: "$dateOfBooking" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    totalRevenue: 1,
                },
            },
        ]);
        const paymentDetails = yield Booking_1.default.aggregate([
            {
                $lookup: {
                    from: "retreats",
                    localField: "retreatId",
                    foreignField: "_id",
                    as: "retreat",
                },
            },
            {
                $unwind: "$retreat",
            },
            {
                $match: {
                    "retreat.organizerId": new mongoose_1.default.Types.ObjectId(organiserId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    orderId: 1,
                    paymentVia: "credit card",
                    amount: "$totalAmount",
                    bookingDate: "$dateOfBooking",
                    name: "$user.name",
                    imgUrls: "$user.imageUrls",
                },
            },
        ]);
        monthlyRevenue.forEach(({ month, totalRevenue }) => {
            revenueData[month - 1].totalRevenue = totalRevenue;
        });
        const totalRevenueAllMonths = monthlyRevenue.reduce((total, { totalRevenue }) => total + totalRevenue, 0);
        return res.status(200).json({
            organiserId,
            totalRevenue: totalRevenueAllMonths,
            revenue: revenueData,
            paymentDetails: paymentDetails,
        });
    }
    catch (error) {
        console.error("Error calculating monthly revenue:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getMonthlyRevenue = getMonthlyRevenue;
