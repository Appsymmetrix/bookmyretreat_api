"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogControllers_1 = require("../controllers/blogControllers");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const router = (0, express_1.Router)();
router.post("/add-blog", (0, asyncHandler_1.default)(blogControllers_1.createBlog));
router.get("/blogs", (0, asyncHandler_1.default)(blogControllers_1.getAllBlogs));
router.get("/blog-by-id/:slug", (0, asyncHandler_1.default)(blogControllers_1.getBlogBySlug));
router.put("/blog-by-id/:slug", (0, asyncHandler_1.default)(blogControllers_1.updateBlog));
router.delete("/blog-by-id/:slug", (0, asyncHandler_1.default)(blogControllers_1.deleteBlog));
exports.default = router;
