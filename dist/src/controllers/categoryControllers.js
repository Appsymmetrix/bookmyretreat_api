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
exports.getPopular = exports.getAllCategories = exports.addPopular = exports.addCategory = void 0;
const validation_1 = require("../../utils/validation");
const Category_1 = __importDefault(require("../models/Category"));
const Filter_1 = __importDefault(require("../models/Filter"));
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.categorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { name } = req.body;
        const existingCategory = yield Category_1.default.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const newCategory = new Category_1.default({ name });
        const savedCategory = yield newCategory.save();
        res.status(201).json({
            message: "Category added successfully",
            category: {
                id: savedCategory._id,
                name: savedCategory.name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to add category", error });
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
        const existingFilter = yield Filter_1.default.findOne({ name });
        if (existingFilter) {
            return res.status(400).json({ message: "Popular already exists" });
        }
        const newFilter = new Filter_1.default({ name });
        const savedFilter = yield newFilter.save();
        res.status(201).json({
            message: "Popular added successfully",
            popular: {
                id: savedFilter._id,
                name: savedFilter.name,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to add filter", error });
    }
});
exports.addPopular = addPopular;
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.default.find();
        res.status(200).json({ categories });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve categories", error });
    }
});
exports.getAllCategories = getAllCategories;
const getPopular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const popular = yield Filter_1.default.find({ isPopular: true });
        res.status(200).json({ popular });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to retrieve popular filters", error });
    }
});
exports.getPopular = getPopular;
