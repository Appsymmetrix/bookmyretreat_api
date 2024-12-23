import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  retreatId: mongoose.Types.ObjectId;
  dates: {
    start: Date;
    end: Date;
  };
  numberOfPeople: number;
  personName: string;
  accommodation: {
    type: string;
    numberOfRooms: number;
    peopleAllowed: number;
    roomPrice: number;
    imageUrls: string[];
  };
  totalAmount: number;
  orderId: string;
  status: "pending" | "upcoming" | "cancelled" | "completed" | "confirmed";
  bookingDate?: Date;
  cancellationReason?: string;
  dateOfBooking: Date; // New Field Including Date and Time
}

const BookingSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  retreatId: {
    type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model<IBooking>("Booking", BookingSchema);
