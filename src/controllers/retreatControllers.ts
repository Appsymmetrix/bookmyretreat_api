import { Request, Response } from "express";
import Retreat from "../models/RetreatModal";
import { retreatSchema } from "../../utils/validation";

// Create Retreat
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
    const { title } = req.body;
    const existingRetreat = await Retreat.findOne({ title }).lean();

    if (existingRetreat) {
      return res.status(400).json({
        success: false,
        message: "A retreat with this title already exists",
      });
    }

    const newRetreat = new Retreat(req.body);
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

// Update Retreat
export const updateRetreat = async (
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

// Delete Retreat
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
  const { lastId, limit = 10 } = req.query;

  try {
    let query = {};
    if (lastId) {
      query = { _id: { $gt: lastId } };
    }

    // Use lean query for faster performance
    const retreats = await Retreat.find(query)
      .limit(+limit)
      .sort({ _id: 1 })
      .lean();

    const totalRetreats = await Retreat.countDocuments();
    const totalPages = Math.ceil(totalRetreats / +limit);

    const nextLastId =
      retreats.length > 0 ? retreats[retreats.length - 1]._id : null;

    return res.status(200).json({
      success: true,
      message: "Retreats fetched successfully",
      data: {
        retreats,
        totalRetreats,
        totalPages,
        lastId: nextLastId,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
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

    return res.status(200).json({
      success: true,
      message: "Retreat fetched successfully",
      data: retreat,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
