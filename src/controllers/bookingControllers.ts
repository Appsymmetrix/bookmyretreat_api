import { Request, Response } from "express";
import Booking from "../models/Booking";
import { bookingValidationSchema } from "../../utils/validation";
import { generateOrderId } from "../../utils/types";
import mongoose from "mongoose";
import { Types } from "mongoose";
import User from "../models/User";
import Retreat from "../models/RetreatModal";

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
    retreatId,
    dates,
    numberOfPeople,
    personName,
    accommodation,
    totalAmount,
  } = req.body;

  if (!isValidObjectId(retreatId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Retreat ID",
    });
  }

  try {
    const orderId = generateOrderId();
    const newBooking = new Booking({
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

    await newBooking.save();
    return res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
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
    const currentDate = new Date();

    const categorizedBookings = await Booking.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
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
        $addFields: {
          category: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$status", "cancelled"] },
                  then: "canceled",
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$status", "confirmed"] },
                      { $gte: ["$dates.start", currentDate] },
                    ],
                  },
                  then: "upcoming",
                },
                {
                  case: { $eq: ["$status", "completed"] },
                  then: "completed",
                },
                {
                  case: { $eq: ["$status", "confirmed"] },
                  then: "confirmed",
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
      upcoming:
        categorizedBookings.find((c) => c.category === "upcoming")?.bookings ||
        [],
      confirmed:
        categorizedBookings.find((c) => c.category === "confirmed")?.bookings ||
        [],
      completed:
        categorizedBookings.find((c) => c.category === "completed")?.bookings ||
        [],
      canceled:
        categorizedBookings.find((c) => c.category === "canceled")?.bookings ||
        [],
    };

    return res.status(200).json({
      success: true,
      message: "Bookings categorized successfully",
      data: response,
    });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
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
    const result = await Booking.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(bookingId) } },
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

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "cancelled", cancellationReason },
      { new: true }
    ).lean();

    const notification = {
      title: "Booking Cancelled",
      message: `Your booking for ${booking.retreatDetails.title} has been cancelled. Reason: ${cancellationReason}`,
      createdAt: new Date(),
      read: false,
    };

    await User.updateOne(
      { _id: booking.userId },
      { $push: { notifications: notification } }
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully and notification sent.",
      booking: updatedBooking,
    });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};

export const getAllBookingsForOrganizer = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { organizerId } = req.params;

  if (!isValidObjectId(organizerId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Organizer ID",
    });
  }

  try {
    const organizer = await User.findById(organizerId).select("organization");

    if (!organizer || !organizer.organization) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found or organization information is missing",
      });
    }

    const bookings = await Booking.aggregate([
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
          "retreatDetails.organizerId": new mongoose.Types.ObjectId(
            organizerId
          ),
        },
      },
      {
        $match: {
          status: "confirmed",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          retreatId: 1,
          dates: 1,
          numberOfPeople: 1,
          personName: 1,
          accommodation: 1,
          totalAmount: 1,
          orderId: 1,
          status: 1,
          bookingDate: 1,
          cancellationReason: 1,
          "retreatDetails.title": 1,
        },
      },
    ]);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No confirmed bookings found for retreats created by this organizer",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Confirmed bookings retrieved successfully",
      bookings,
      organization: organizer.organization.name,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bookings",
      error: err.message,
    });
  }
};
