"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const blogCategoryControllers_1 = require("../controllers/blogCategoryControllers");
const router = (0, express_1.Router)();
router.get("/blog-category", (0, asyncHandler_1.default)(blogCategoryControllers_1.getBlogCategories));
router.post("/blog-category", (0, asyncHandler_1.default)(blogCategoryControllers_1.addBlogCategory));
router.put("/blog-categories/:id", (0, asyncHandler_1.default)(blogCategoryControllers_1.updateBlogCategory));
exports.default = router;
