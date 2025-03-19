"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlogBySlug = exports.getAllBlogs = exports.createBlog = void 0;
const Blog_1 = require("../models/Blog");
const mongoose_1 = require("mongoose");
const validation_1 = require("../../utils/validation");
const createBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.blogValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    try {
        const blog = new Blog_1.Blog(req.body);
        yield blog.save();
        return res.status(201).json({
            success: true,
            blog,
        });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
exports.createBlog = createBlog;
const getAllBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    try {
        const filter = {};
        if (category) {
            if (!(0, mongoose_1.isValidObjectId)(category)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid category ID" });
            }
            filter.category = category;
        }
        const blogs = yield Blog_1.Blog.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .select("title desc imageTileUrl slug readTime category createdAt")
            .populate("category")
            .lean();
        const totalBlogs = yield Blog_1.Blog.countDocuments(filter);
        const totalPages = Math.ceil(totalBlogs / limitNumber);
        return res.status(200).json({
            totalPages,
            currentPage: pageNumber,
            totalBlogs,
            blogs,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getAllBlogs = getAllBlogs;
const getBlogBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.Blog.findOne({ slug: req.params.slug }).populate("category");
        if (!blog)
            return res.status(404).json({ error: "Blog post not found" });
        return res.status(200).json(blog);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getBlogBySlug = getBlogBySlug;
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.Blog.findOneAndUpdate({ slug: req.params.slug }, req.body, {
            new: true,
            runValidators: true,
        });
        if (!blog)
            return res.status(404).json({ error: "Blog post not found" });
        return res.status(200).json(blog);
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
exports.updateBlog = updateBlog;
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield Blog_1.Blog.findOneAndDelete({ slug: req.params.slug });
        if (!blog)
            return res.status(404).json({ error: "Blog post not found" });
        return res.status(200).json({ message: "Blog post deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.deleteBlog = deleteBlog;
