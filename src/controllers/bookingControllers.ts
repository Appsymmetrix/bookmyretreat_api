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

    const retreat = await Retreat.findById(retreatId).select("title");

    const notification = {
      message: `Your booking for ${retreat?.title} has been confirmed successfully!`,
      createdAt: new Date(),
      read: false,
    };

    await User.updateOne(
      { _id: userId },
      { $push: { notifications: notification } }
    );

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
      upcoming:
        categorizedBookings.find((c) => c.category === "upcoming")?.bookings ||
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

    const categorizedBookings = await Booking.aggregate([
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
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bookings",
      error: err.message,
    });
  }
};

export const getAllBookingsForOrganizerSummary = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { organizerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ error: "Invalid organizerId" });
    }

    const organizer = await User.findOne({
      _id: organizerId,
      role: "organiser",
    });
    if (!organizer) {
      return res
        .status(404)
        .json({ error: "Organizer not found or not an organiser" });
    }

    const retreats = await Retreat.find({
      organizerId: new mongoose.Types.ObjectId(organizerId),
    });

    const retreatIds = retreats.map((retreat) => retreat._id);

    const bookingSummary = await Booking.aggregate([
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
        retreats.map((retreat) => ({
          retreatId: retreat._id,
          title: retreat.title,
          ...summary,
        })),
      ],
    });
  } catch (error) {
    console.error("Error in getAllBookingsForOrganizer:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getBookingsForRetreat = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { organizerId, retreatId } = req.params;

  if (!isValidObjectId(organizerId) || !isValidObjectId(retreatId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Organizer ID or Retreat ID",
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

    const categorizedBookings = await Booking.aggregate([
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
          "retreatDetails._id": new mongoose.Types.ObjectId(retreatId),
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
          newBooking: [
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
                mobileNumber: "$userDetails.mobileNumber",
                dateOfBooking: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          newBooking: "$newBooking",
          completed: 1,
          cancelled: 1,
          totalBookings: {
            $concatArrays: [
              { $ifNull: ["$newBooking", []] },
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
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bookings",
      error: err.message,
    });
  }
};

export const getMonthlyRevenue = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { organiserId } = req.params;

    if (!organiserId) {
      return res.status(400).json({ error: "organiserId is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(organiserId as string)) {
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

    const monthlyRevenue = await Booking.aggregate([
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
          "retreat.organizerId": new mongoose.Types.ObjectId(organiserId),
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

    const paymentDetails = await Booking.aggregate([
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
          "retreat.organizerId": new mongoose.Types.ObjectId(organiserId),
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

    const totalRevenueAllMonths = monthlyRevenue.reduce(
      (total, { totalRevenue }) => total + totalRevenue,
      0
    );

    return res.status(200).json({
      organiserId,
      totalRevenue: totalRevenueAllMonths,
      revenue: revenueData,
      paymentDetails: paymentDetails,
    });
  } catch (error) {
    console.error("Error calculating monthly revenue:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
