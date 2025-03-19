"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    retreatId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Retreat",
        required: true,
    },
    dates: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    numberOfPeople: { type: Number, required: true },
    personName: { type: String, required: true },
    accommodation: {
        type: {
            type: String,
            required: true,
        },
        numberOfRooms: { type: Number, required: true, min: 1 },
        peopleAllowed: { type: Number, required: true, min: 1 },
        roomPrice: { type: Number, required: true, min: 0 },
        imageUrls: [{ type: String, required: true }],
    },
    totalAmount: { type: Number, required: true },
    orderId: { type: String, required: true, unique: true },
    cancellationReason: { type: String },
    status: {
        type: String,
        enum: ["pending", "upcoming", "cancelled", "completed", "confirmed"],
        default: "pending",
    },
    bookingDate: { type: Date, default: Date.now },
    dateOfBooking: { type: Date, required: true, default: Date.now },
});
exports.default = mongoose_1.default.model("Booking", BookingSchema);
