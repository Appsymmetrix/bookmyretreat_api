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
exports.updateBlogCategory = exports.addBlogCategory = exports.getBlogCategories = void 0;
const BlogCategory_1 = require("../models/BlogCategory");
const getBlogCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogCategories = yield BlogCategory_1.BlogCategory.find();
        return res.status(200).json(blogCategories);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getBlogCategories = getBlogCategories;
const addBlogCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const blogCategory = new BlogCategory_1.BlogCategory({ title });
        yield blogCategory.save();
        return res.status(201).json(blogCategory);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.addBlogCategory = addBlogCategory;
const updateBlogCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const updatedBlogCategory = yield BlogCategory_1.BlogCategory.findByIdAndUpdate(id, { title }, { new: true, runValidators: true });
        if (!updatedBlogCategory) {
            return res.status(404).json({ message: "Blog category not found" });
        }
        return res.status(200).json(updatedBlogCategory);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.updateBlogCategory = updateBlogCategory;
