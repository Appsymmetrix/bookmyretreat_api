import { Request, Response } from "express";
import { retreatSchema } from "../../utils/validation";
import Retreat from "../models/RetreatModal";
import mongoose from "mongoose";
import Review from "../models/Review";

export const createRetreat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userRole = req?.user?.role as "user" | "organiser" | "admin";

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found." });
  }

  if (!["admin", "organiser"].includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You do not have the necessary permissions",
    });
  }

  const { error } = retreatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((err) => ({
        message: err.message,
        path: err.path,
        type: err.type,
      })),
    });
  }

  try {
    const { title, organizerId } = req.body;

    if (!organizerId) {
      return res.status(400).json({
        success: false,
        message: "Organizer ID is required",
      });
    }

    const existingRetreat = await Retreat.findOne({ title }).lean();

    if (existingRetreat) {
      return res.status(400).json({
        success: false,
        message: "A retreat with this title already exists",
      });
    }

    const newRetreat = new Retreat({
      ...req.body,
    });

    await newRetreat.save();

    return res.status(201).json({
      success: true,
      message: "Retreat created successfully",
      data: newRetreat.toObject(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateRetreat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // const userRole = req?.user?.role as "user" | "organiser" | "admin";

  // if (!req.user) {
  //   return res.status(401).json({ message: "Unauthorized: No user found." });
  // }

  // if (!["admin", "organiser"].includes(userRole)) {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Forbidden: You do not have the necessary permissions",
  //   });
  // }

  const { error } = retreatSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details.map((err) => ({
        message: err.message,
        path: err.path,
        type: err.type,
      })),
    });
  }

  try {
    const { id } = req.params;
    const retreat = await Retreat.findById(id).lean();

    if (!retreat) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found",
      });
    }

    await Retreat.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      success: true,
      message: "Retreat updated successfully",
      data: { ...retreat, ...req.body },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteRetreat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userRole = req?.user?.role;

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You do not have the necessary permissions",
    });
  }

  const { id } = req.params;

  try {
    const deletedRetreat = await Retreat.findByIdAndDelete(id);
    if (!deletedRetreat) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Retreat deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllRetreats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const parsedLimit = parseInt(limit as string, 10);
    const parsedPage = parseInt(page as string, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid limit value" });
    }
    if (isNaN(parsedPage) || parsedPage <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page number" });
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const retreats = await Retreat.find({})
      .skip(skip)
      .limit(parsedLimit)
      .sort({ _id: 1 })
      .lean();

    const totalRetreats = await Retreat.countDocuments();
    const totalPages = Math.ceil(totalRetreats / parsedLimit);

    return res.status(200).json({
      success: true,
      message: "Retreats fetched successfully",
      data: {
        retreats,
        totalRetreats,
        totalPages,
        currentPage: parsedPage,
      },
    });
  } catch (err) {
    console.error("Error fetching retreats:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching retreats",
    });
  }
};

export const getRetreatById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const retreat = await Retreat.findById(id).lean();

    if (!retreat) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found",
      });
    }

    const reviews = await Review.find({ retreatId: id }).lean();

    const allRatings = reviews.flatMap((review) =>
      review.reviews.map((details) => details.rating)
    );

    const totalRatings = allRatings.reduce((sum, rating) => sum + rating, 0);
    const averageRating =
      allRatings.length > 0
        ? parseFloat((totalRatings / allRatings.length).toFixed(1))
        : 0;

    const retreatWithRating = {
      ...retreat,
      averageRating,
    };

    return res.status(200).json({
      success: true,
      message: "Retreat fetched successfully",
      data: retreatWithRating,
    });
  } catch (error) {
    console.error("Error fetching retreat with rating:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRetreatsByOrganizer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { organizerId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!organizerId) {
    return res.status(400).json({
      success: false,
      message: "Organizer ID is required",
    });
  }

  try {
    const objectId = mongoose.Types.ObjectId.isValid(organizerId)
      ? new mongoose.Types.ObjectId(organizerId)
      : null;

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Organizer ID format",
      });
    }

    const query = { organizerId: objectId };

    const skip = page && limit ? (Number(page) - 1) * Number(limit) : 0;

    let retreats;
    let totalRetreats;

    if (page && limit) {
      retreats = await Retreat.find(query).skip(skip).limit(Number(limit));
      totalRetreats = await Retreat.countDocuments(query);
    } else {
      retreats = await Retreat.find(query);
      totalRetreats = retreats.length;
    }

    if (retreats.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No retreats found for this organizer",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Retreats fetched successfully",
      data: {
        retreats,
        totalRetreats,
        totalPages:
          page && limit ? Math.ceil(totalRetreats / Number(limit)) : 1,
        currentPage: page && limit ? Number(page) : 1,
      },
    });
  } catch (err) {
    console.error("Error fetching retreats:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


