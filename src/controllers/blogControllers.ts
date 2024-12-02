import { Request, Response } from "express";
import { Blog } from "../models/Blog";
import { isValidObjectId } from "mongoose";
import { blogValidationSchema } from "../../utils/validation";

export const createBlog = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { error } = blogValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const blog = new Blog(req.body);
    await blog.save();
    return res.status(201).json({
      success: true,
      blog,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllBlogs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { category, page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  try {
    const filter: any = {};
    if (category) {
      if (!isValidObjectId(category as string)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category ID" });
      }
      filter.category = category;
    }

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .select("title desc imageTileUrl slug readTime category createdAt")
      .populate("category")
      .lean();

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / limitNumber);

    return res.status(200).json({
      totalPages,
      currentPage: pageNumber,
      totalBlogs,
      blogs,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate(
      "category"
    );
    if (!blog) return res.status(404).json({ error: "Blog post not found" });
    return res.status(200).json(blog);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!blog) return res.status(404).json({ error: "Blog post not found" });
    return res.status(200).json(blog);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const blog = await Blog.findOneAndDelete({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog post not found" });
    return res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
