import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  addCategory,
  addPopular,
  getAllCategories,
  getPopular,
} from "../controllers/categoryControllers";

const router = express.Router();

router.post("/add-category", asyncHandler(addCategory));

router.post("/add-popular", asyncHandler(addPopular));

router.get("/all-category", asyncHandler(getAllCategories));

router.get("/all-popular", asyncHandler(getPopular));

export default router;
