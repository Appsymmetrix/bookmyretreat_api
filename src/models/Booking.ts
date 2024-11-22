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
  accommodation: string;
  totalAmount: number;
  orderId: string;
  status: "pending" | "upcoming" | "cancelled" | "completed" | "confirm";
  cancellationReason?: string;
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
  accommodation: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  orderId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "upcoming", "cancelled", "completed", "confirmed"],
    default: "pending",
  },
});

export default mongoose.model<IBooking>("Booking", BookingSchema);
