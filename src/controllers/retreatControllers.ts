import { Request, Response } from "express";
import { retreatValidationPartial } from "../../utils/validation";
import Retreat from "../models/RetreatModal";

export const createRetreat = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  // Uncomment this section if you need to check user role and authorization
  // const userRole = req?.user.role;
  // if (!req.user) {
  //   return res.status(401).json({ message: "Unauthorized: No user found." });
  // }
  // if (userRole !== "admin" && userRole !== "organiser") {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Forbidden: You do not have the necessary permissions",
  //   });
  // }

  const { error } = retreatValidationPartial(req.body);
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
    const retreatData = req.body;

    const existingRetreat = await Retreat.findOne({ title: retreatData.title });

    if (existingRetreat) {
      return res.status(400).json({
        success: false,
        message: "A retreat with this title already exists",
      });
    }

    const newRetreat = new Retreat({
      ...retreatData,
    });

    await newRetreat.save();

    const formattedData = {
      ...newRetreat.toObject(),
      category: newRetreat.category?.map(({ id, name }) => ({ id, name })),
      popular: newRetreat.popular?.map(({ id, name }) => ({ id, name })),
    };

    return res.status(201).json({
      success: true,
      message: "Retreat created successfully",
      data: formattedData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateRetreat = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  // const userRole = req?.user?.role;
  // if (!req.user) {
  //   return res.status(401).json({ message: "Unauthorized: No user found." });
  // }
  // if (userRole !== "admin" && userRole !== "organiser") {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Forbidden: You do not have the necessary permissions",
  //   });
  // }

  const { error } = retreatValidationPartial(req.body);
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
    const retreatData = req.body;

    const retreat = await Retreat.findById(id);

    if (!retreat) {
      return res.status(404).json({
        success: false,
        message: "Retreat not found",
      });
    }

    Object.assign(retreat, retreatData);

    await retreat.save();

    return res.status(200).json({
      success: true,
      message: "Retreat updated successfully",
      data: retreat,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteRetreat = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  // const userRole = req?.user?.role;
  // if (userRole !== "admin") {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Forbidden: You do not have the necessary permissions",
  //   });
  // }

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
): Promise<Response | void> => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const retreats = await Retreat.find()
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const totalRetreats = await Retreat.countDocuments();
    const totalPages = Math.ceil(totalRetreats / +limit);

    return res.status(200).json({
      success: true,
      message: "Retreats fetched successfully",
      data: {
        retreats,
        totalRetreats,
        currentPage: +page,
        totalPages,
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
): Promise<Response | void> => {
  const { id } = req.params;

  try {
    const retreat = await Retreat.findById(id);

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
