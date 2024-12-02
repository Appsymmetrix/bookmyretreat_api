import { Router } from "express";
import {} from "../controllers/bookingControllers";
import asyncHandler from "../../utils/asyncHandler";
import {
  addBlogCategory,
  getBlogCategories,
} from "../controllers/blogCategoryControllers";

const router = Router();

router.get("/blog-category", asyncHandler(getBlogCategories));

router.post("/blog-category", asyncHandler(addBlogCategory));

export default router;
