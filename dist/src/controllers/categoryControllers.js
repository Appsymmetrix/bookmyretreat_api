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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.getPopular = exports.getAllCategories = exports.addPopular = exports.addCategory = void 0;
const validation_1 = require("../../utils/validation");
const Category_1 = __importDefault(require("../models/Category"));
const Filter_1 = __importDefault(require("../models/Filter"));
const handleDatabaseError = (err, res) => {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
};
const checkExisting = (model, name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield model.findOne({ name }).lean();
});
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.categorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { name, description, imgUrl } = req.body;
        const existingCategory = yield checkExisting(Category_1.default, name);
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const newCategory = new Category_1.default({ name, description, imgUrl });
        const savedCategory = yield newCategory.save();
        return res.status(201).json({
            message: "Category added successfully",
            category: {
                id: savedCategory._id,
                name: savedCategory.name,
                description: savedCategory.description,
                imgUrl: savedCategory.imgUrl,
            },
        });
    }
    catch (error) {
        return handleDatabaseError(error, res);
    }
});
exports.addCategory = addCategory;
const addPopular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.filterSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { name } = req.body;
        const existingFilter = yield checkExisting(Filter_1.default, name);
        if (existingFilter) {
            return res.status(400).json({ message: "Popular filter already exists" });
        }
        const newFilter = new Filter_1.default({ name });
        const savedFilter = yield newFilter.save();
        return res.status(201).json({
            message: "Popular filter added successfully",
            popular: {
                id: savedFilter._id,
                name: savedFilter.name,
            },
        });
    }
    catch (error) {
        return handleDatabaseError(error, res);
    }
});
exports.addPopular = addPopular;
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.find().lean();
        if (!categories.length) {
            return res.status(404).json({ message: "No categories found" });
        }
        return res.status(200).json({
            message: "Categories retrieved successfully",
            categories,
        });
    }
    catch (error) {
        return handleDatabaseError(error, res);
    }
});
exports.getAllCategories = getAllCategories;
const getPopular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const popular = yield Filter_1.default.find({ isPopular: true }).lean();
        if (!popular.length) {
            return res.status(404).json({ message: "No popular filters found" });
        }
        return res.status(200).json({
            message: "Popular filters retrieved successfully",
            popular,
        });
    }
    catch (error) {
        return handleDatabaseError(error, res);
    }
});
exports.getPopular = getPopular;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, imgUrl } = req.body;
    if (!name && !description && !imgUrl) {
        return res.status(400).json({
            message: "At least one field (name, description, or imgUrl) must be provided",
        });
    }
    try {
        const existingCategory = yield Category_1.default.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (imgUrl)
            updateData.imgUrl = imgUrl;
        const updatedCategory = yield Category_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            message: "Category updated successfully",
            category: {
                id: updatedCategory === null || updatedCategory === void 0 ? void 0 : updatedCategory._id,
                name: updatedCategory === null || updatedCategory === void 0 ? void 0 : updatedCategory.name,
                description: updatedCategory === null || updatedCategory === void 0 ? void 0 : updatedCategory.description,
                imgUrl: updatedCategory === null || updatedCategory === void 0 ? void 0 : updatedCategory.imgUrl,
            },
        });
    }
    catch (error) {
        return handleDatabaseError(error, res);
    }
});
exports.updateCategory = updateCategory;
