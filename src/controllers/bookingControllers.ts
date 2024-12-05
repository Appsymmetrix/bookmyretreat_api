import { Request, Response } from "express";
import Booking from "../models/Booking";
import { bookingValidationSchema } from "../../utils/validation";
import { generateOrderId } from "../../utils/types";
import mongoose from "mongoose";
import { Types } from "mongoose";
import User from "../models/User";

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

  if (!isValidObjectId(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Booking ID",
    });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "cancelled", cancellationReason },
      { new: true }
    ).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const user = await User.findById(booking.userId);
    if (user) {
      const notification = {
        title: "Booking Cancelled",
        message: `Your booking with ID ${bookingId} has been cancelled. Reason: ${cancellationReason}`,
        createdAt: new Date(),
      };

      user.notifications.push(notification);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully and notification sent.",
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
  const { retreatId } = req.params;

  if (!isValidObjectId(retreatId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Retreat ID",
    });
  }

  try {
    const bookings = await Booking.find({ retreatId }).lean();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this retreat",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User booking details retrieved successfully",
      bookings,
    });
  } catch (err) {
    return handleDatabaseError(err, res);
  }
};
