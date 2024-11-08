import { Request, Response } from "express";
import { categorySchema, filterSchema } from "../../utils/validation";
import Category from "../models/Category";
import Popular from "../models/Filter";

export const addCategory = async (req: Request, res: Response) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ name });
    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: {
        id: savedCategory._id,
        name: savedCategory.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add category", error });
  }
};

export const addPopular = async (req: Request, res: Response) => {
  const { error } = filterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name } = req.body;

    const existingFilter = await Popular.findOne({ name });
    if (existingFilter) {
      return res.status(400).json({ message: "Popular already exists" });
    }

    const newFilter = new Popular({ name });
    const savedFilter = await newFilter.save();

    res.status(201).json({
      message: "Popular added successfully",
      popular: {
        id: savedFilter._id,
        name: savedFilter.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add filter", error });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve categories", error });
  }
};

export const getPopular = async (req: Request, res: Response) => {
  try {
    const popular = await Popular.find({ isPopular: true });
    res.status(200).json({ popular });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve popular filters", error });
  }
};
