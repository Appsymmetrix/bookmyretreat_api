import { Request, Response } from "express";
import { BlogCategory } from "../models/BlogCategory";

export const getBlogCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const blogCategories = await BlogCategory.find();
    return res.status(200).json(blogCategories);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addBlogCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const blogCategory = new BlogCategory({ title });
    await blogCategory.save();

    return res.status(201).json(blogCategory);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBlogCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(
      id,
      { title },
      { new: true, runValidators: true }
    );

    if (!updatedBlogCategory) {
      return res.status(404).json({ message: "Blog category not found" });
    }

    return res.status(200).json(updatedBlogCategory);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
