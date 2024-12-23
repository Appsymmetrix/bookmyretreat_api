import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";
import Booking from "../models/Booking";

export const getUsersDashboard = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const currentDate = new Date();

    const usersData = await User.aggregate([
      { $match: { role: "user" } },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "userId",
          as: "bookings",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          imageUrls: 1,
          totalBookings: { $size: { $ifNull: ["$bookings", []] } },
          upcomingBookings: {
            $size: {
              $filter: {
                input: { $ifNull: ["$bookings", []] },
                as: "booking",
                cond: {
                  $and: [
                    { $eq: ["$$booking.status", "confirmed"] },
                    { $gte: ["$$booking.dates.start", currentDate] },
                  ],
                },
              },
            },
          },
        },
      },
      { $limit: 100 },
    ]).exec();

    return res.status(200).json({
      success: true,
      message: "Users dashboard data fetched successfully",
      data: usersData,
    });
  } catch (err) {
    console.error("Error fetching users dashboard data:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the users data.",
    });
  }
};

export const getOrganizersDashboard = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const organizersData = await User.aggregate([
      { $match: { role: "organiser" } },
      {
        $lookup: {
          from: "retreats",
          localField: "_id",
          foreignField: "organizerId",
          as: "retreats",
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "retreats._id",
          foreignField: "retreatId",
          as: "reviews",
        },
      },
      {
        $project: {
          email: 1,
          organizationName: "$organization.name",
          organizationImageUrl: { $ifNull: ["$organization.imageUrl", ""] },
          retreatsCount: { $size: "$retreats" },
          totalReviews: {
            $sum: {
              $map: {
                input: "$reviews",
                as: "review",
                in: { $size: { $ifNull: ["$$review.reviews", []] } },
              },
            },
          },
        },
      },
      { $limit: 100 },
    ]).exec();
    return res.status(200).json({
      success: true,
      message: "Organizers dashboard data fetched successfully",
      data: organizersData,
    });
  } catch (err) {
    console.error("Error fetching organizers dashboard data:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the organizers data.",
    });
  }
};

export const getAllBookingsByUser = async (
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
    const bookings = await Booking.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
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
        $lookup: {
          from: "retreats",
          localField: "retreatId",
          foreignField: "_id",
          as: "retreatDetails",
        },
      },
      { $unwind: "$retreatDetails" },
      {
        $project: {
          bookingId: "$_id",
          retreatTitle: "$retreatDetails.title",
          totalAmount: "$totalAmount",
          bookedOn: "$dateOfBooking",
          status: "$status",
          orderId: "$orderId",
          retreatAddress: "$retreatDetails.fullAddress",
          dates: "$dates",
          personName: "$personName",
          accommodation: "$accommodation",
          userName: "$userDetails.name",
          mobileNumber: "$userDetails.mobileNumber",
          userImage: {
            $ifNull: [
              { $arrayElemAt: ["$userDetails.imageUrls", 0] },
              "https://via.placeholder.com/150",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$userDetails._id",
          userName: { $first: "$userName" },
          userImage: { $first: "$userImage" },
          totalBookings: { $sum: 1 },
          bookings: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          userName: 1,
          userImage: 1,
          totalBookings: 1,
          bookings: 1,
        },
      },
    ]);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings[0],
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bookings",
      error: err.message,
    });
  }
};
