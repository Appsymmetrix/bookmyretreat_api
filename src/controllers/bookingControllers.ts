import { Request, Response } from "express";
import Booking from "../models/Booking";
import { bookingValidationSchema } from "../../utils/validation";
import { generateOrderId } from "../../utils/types";
import mongoose from "mongoose";

// Utility to check if ObjectId is valid
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

const handleDatabaseError = (err: any, res: Response) => {
  console.error(err);
  return res.status(500).json({ message: "Server error" });
};

export const createBooking = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { error } = bookingValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const {
    userId,
    dates,
    numberOfPeople,
    personName,
    accommodation,
    totalAmount,
  } = req.body;

  try {
    const orderId = generateOrderId();
    const newBooking = new Booking({
      userId,
      dates,
      numberOfPeople,
      personName,
      accommodation,
      totalAmount,
      orderId,
      status: "pending",
    });

    await newBooking.save();
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking.toObject(),
    });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

export const getBookingsByUserId = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
    });
  }

  try {
    const bookings = await Booking.find({ userId }).lean(); // Use lean to optimize performance

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      bookings,
    });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

export const acceptBooking = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Booking ID",
    });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "accepted" },
      { new: true }
    ).lean();

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
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

export const denyBooking = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { bookingId } = req.params;

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Booking ID",
    });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "denied" },
      { new: true }
    ).lean();

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
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

export const getAllBookingsForOrganizer = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const totalBookingsPromise = Booking.countDocuments();
    const pendingApprovalPromise = Booking.countDocuments({
      status: "pending",
    });
    const incomePromise = Booking.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: null, totalIncome: { $sum: "$totalAmount" } } },
    ]);
    const bookingsPromise = Booking.find().lean();

    const [totalBookings, pendingApproval, income, bookings] =
      await Promise.all([
        totalBookingsPromise,
        pendingApprovalPromise,
        incomePromise,
        bookingsPromise,
      ]);

    return res.status(200).json({
      success: true,
      message: "Booking statistics retrieved successfully",
      data: {
        totalBookings,
        pendingApproval,
        income: income[0]?.totalIncome || 0,
        bookings,
      },
    });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};
