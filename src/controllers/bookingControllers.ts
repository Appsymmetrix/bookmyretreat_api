import { Request, Response } from "express";
import Booking from "../models/Booking";
import { bookingValidationSchema } from "../../utils/validation";
import { generateOrderId } from "../../utils/types";
import mongoose from "mongoose";

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
  } catch (err) {
    console.error("Error creating booking:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBookingsByUserId = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
    });
  }

  try {
    const bookings = await Booking.find({ userId }).exec();

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
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const acceptBooking = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
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
    );

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
    console.error("Error accepting booking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Deny a booking
export const denyBooking = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { bookingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
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
    );

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
    console.error("Error denying booking:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllBookingsForOrganizer = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingApproval = await Booking.countDocuments({ status: "pending" });
    const income = await Booking.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: null, totalIncome: { $sum: "$totalAmount" } } },
    ]);

    const bookings = await Booking.find().exec();

    return res.status(200).json({
      success: true,
      message: "Booking statistics retrieved successfully",
      data: {
        totalBookings,
        pendingApproval,
        income: income[0]?.totalIncome || 0,
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
  } catch (err) {
    console.error("Error retrieving booking data:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
