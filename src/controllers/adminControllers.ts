import { Request, Response } from "express";
import User from "../models/User";

export const getAdminDashboard = async (
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
      message: "Admin Dashboard data fetched successfully",
      data: {
        users: usersData,
        organizers: organizersData,
      },
    });
  } catch (err) {
    console.error("Error fetching admin dashboard data:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the dashboard data.",
    });
  }
};
