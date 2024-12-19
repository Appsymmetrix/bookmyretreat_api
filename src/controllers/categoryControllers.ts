import { Request, Response } from "express";
import { categorySchema, filterSchema } from "../../utils/validation";
import Category from "../models/Category";
import Popular from "../models/Filter";

const handleDatabaseError = (err: any, res: Response) => {
  console.error(err);
  return res.status(500).json({ message: "Server error", error: err.message });
};

const checkExisting = async (model: any, name: string) => {
  return await model.findOne({ name }).lean();
};

export const addCategory = async (req: Request, res: Response) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name, description, imgUrl } = req.body;

    const existingCategory = await checkExisting(Category, name);
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ name, description, imgUrl });
    const savedCategory = await newCategory.save();

    return res.status(201).json({
      message: "Category added successfully",
      category: {
        id: savedCategory._id,
        name: savedCategory.name,
        description: savedCategory.description,
        imgUrl: savedCategory.imgUrl,
      },
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

export const addPopular = async (req: Request, res: Response) => {
  const { error } = filterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { name } = req.body;
    const existingFilter = await checkExisting(Popular, name);

    if (existingFilter) {
      return res.status(400).json({ message: "Popular filter already exists" });
    }

    const newFilter = new Popular({ name });
    const savedFilter = await newFilter.save();

    return res.status(201).json({
      message: "Popular filter added successfully",
      popular: {
        id: savedFilter._id,
        name: savedFilter.name,
      },
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().lean();
    if (!categories.length) {
      return res.status(404).json({ message: "No categories found" });
    }

    return res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

export const getPopular = async (req: Request, res: Response) => {
  try {
    const popular = await Popular.find({ isPopular: true }).lean();
    if (!popular.length) {
      return res.status(404).json({ message: "No popular filters found" });
    }

    return res.status(200).json({
      message: "Popular filters retrieved successfully",
      popular,
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, imgUrl } = req.body;

  if (!name && !description && !imgUrl) {
    return res.status(400).json({
      message:
        "At least one field (name, description, or imgUrl) must be provided",
    });
  }

  try {
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updateData: Partial<{
      name: string;
      description: string;
      imgUrl: string[];
    }> = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (imgUrl) updateData.imgUrl = imgUrl;

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category: {
        id: updatedCategory?._id,
        name: updatedCategory?.name,
        description: updatedCategory?.description,
        imgUrl: updatedCategory?.imgUrl,
      },
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
};
