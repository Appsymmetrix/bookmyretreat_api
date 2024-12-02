import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blogControllers";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.post("/add-blog", asyncHandler(createBlog));

router.get("/blogs", asyncHandler(getAllBlogs));

router.get("/blog-by-id/:slug", asyncHandler(getBlogBySlug));

router.put("/blog-by-id/:slug", asyncHandler(updateBlog));

router.delete("/blog-by-id/:slug", asyncHandler(deleteBlog));

export default router;
