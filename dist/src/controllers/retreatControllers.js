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
exports.getRetreats = exports.approveRetreat = exports.getCreatedRetreatsByAdmin = exports.getRetreatsByOrganizer = exports.getRetreatById = exports.getAllRetreats = exports.deleteRetreat = exports.updateRetreat = exports.createRetreat = void 0;
const validation_1 = require("../../utils/validation");
const RetreatModal_1 = __importDefault(require("../models/RetreatModal"));
const mongoose_1 = __importDefault(require("mongoose"));
const Review_1 = __importDefault(require("../models/Review"));
const createRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found." });
    }
    if (!["admin", "organiser"].includes(userRole)) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You do not have the necessary permissions",
        });
    }
    const { error } = validation_1.retreatSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            details: error.details.map((err) => ({
                message: err.message,
                path: err.path,
                type: err.type,
            })),
        });
    }
    try {
        const { title, organizerId, teachers, isCreatedByAdmin } = req.body;
        if (!organizerId && !isCreatedByAdmin) {
            return res.status(400).json({
                success: false,
                message: "Organizer ID or Admin creation flag is required",
            });
        }
        const updatedTeachers = teachers.map((teacher) => (Object.assign(Object.assign({}, teacher), { image: teacher.image || null })));
        const existingRetreat = yield RetreatModal_1.default.findOne({ title }).lean();
        if (existingRetreat) {
            return res.status(400).json({
                success: false,
                message: "A retreat with this title already exists",
            });
        }
        const retreatData = Object.assign(Object.assign({}, req.body), { teachers: updatedTeachers, isCreatedByAdmin: isCreatedByAdmin || false });
        if (isCreatedByAdmin) {
            retreatData.isApproved = true;
            retreatData.organizerId = null;
        }
        const newRetreat = new RetreatModal_1.default(retreatData);
        yield newRetreat.save();
        return res.status(201).json({
            success: true,
            message: "Retreat created successfully",
            data: newRetreat.toObject(),
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.createRetreat = createRetreat;
const updateRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found." });
    }
    if (!["admin", "organiser"].includes(userRole)) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You do not have the necessary permissions",
        });
    }
    const { error } = validation_1.retreatSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            details: error.details.map((err) => ({
                message: err.message,
                path: err.path,
                type: err.type,
            })),
        });
    }
    try {
        const { id } = req.params;
        const retreat = yield RetreatModal_1.default.findById(id).lean();
        if (!retreat) {
            return res.status(404).json({
                success: false,
                message: "Retreat not found",
            });
        }
        yield RetreatModal_1.default.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({
            success: true,
            message: "Retreat updated successfully",
            data: Object.assign(Object.assign({}, retreat), req.body),
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.updateRetreat = updateRetreat;
const deleteRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (userRole !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You do not have the necessary permissions",
        });
    }
    const { id } = req.params;
    try {
        const deletedRetreat = yield RetreatModal_1.default.findByIdAndDelete(id);
        if (!deletedRetreat) {
            return res.status(404).json({
                success: false,
                message: "Retreat not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Retreat deleted successfully",
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.deleteRetreat = deleteRetreat;
const getAllRetreats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, city, categoryId, search_query, sortBy, } = req.query;
    try {
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid limit value" });
        }
        if (isNaN(parsedPage) || parsedPage <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid page number" });
        }
        const skip = (parsedPage - 1) * parsedLimit;
        let filter = { isApproved: true };
        if (search_query && typeof search_query === "string") {
            if (search_query.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Search query must be at least 2 characters long",
                });
            }
            const searchTokens = search_query.split(/\s+/);
            const searchConditions = searchTokens.map((token) => ({
                $or: [
                    { title: { $regex: new RegExp(token, "i") } },
                    { "category.name": { $regex: new RegExp(token, "i") } },
                    { city: { $regex: new RegExp(token, "i") } },
                ],
            }));
            filter.$and = searchConditions;
        }
        if (city && typeof city === "string") {
            filter.city = { $regex: new RegExp(city, "i") };
        }
        if (categoryId && typeof categoryId === "string") {
            filter["category"] = categoryId;
        }
        let sortOption = {};
        if (sortBy) {
            if (sortBy === "price_asc") {
                sortOption = { price: 1 };
            }
            else if (sortBy === "price_desc") {
                sortOption = { price: -1 };
            }
        }
        else {
            sortOption = { createdAt: -1 };
        }
        const retreats = yield RetreatModal_1.default.find(filter)
            .skip(skip)
            .limit(parsedLimit)
            .sort(sortOption)
            .populate("category", "_id name")
            .lean();
        const totalRetreats = yield RetreatModal_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalRetreats / parsedLimit);
        return res.status(200).json({
            success: true,
            message: "Retreats fetched successfully",
            data: {
                retreats,
                totalRetreats,
                totalPages,
                currentPage: parsedPage,
            },
        });
    }
    catch (err) {
        console.error("Error fetching retreats:", err);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching retreats",
        });
    }
});
exports.getAllRetreats = getAllRetreats;
const getRetreatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const retreat = yield RetreatModal_1.default.findById(id)
            .populate("category", "_id name")
            .lean();
        if (!retreat) {
            return res
                .status(404)
                .json({ success: false, message: "Retreat not found" });
        }
        const categories = Array.isArray(retreat.category)
            ? retreat.category
            : [retreat.category];
        const reviews = yield Review_1.default.aggregate([
            { $match: { retreatId: new mongoose_1.default.Types.ObjectId(id) } },
            { $unwind: "$reviews" },
            { $group: { _id: null, averageRating: { $avg: "$reviews.rating" } } },
        ]);
        const averageRating = reviews.length > 0 ? reviews[0].averageRating : 0;
        return res.status(200).json({
            success: true,
            message: "Retreat fetched successfully",
            data: Object.assign(Object.assign({}, retreat), { category: categories, averageRating }),
        });
    }
    catch (error) {
        console.error("Error fetching retreat:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getRetreatById = getRetreatById;
const getRetreatsByOrganizer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!organizerId) {
        return res.status(400).json({
            success: false,
            message: "Organizer ID is required",
        });
    }
    try {
        const objectId = mongoose_1.default.Types.ObjectId.isValid(organizerId)
            ? new mongoose_1.default.Types.ObjectId(organizerId)
            : null;
        if (!objectId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Organizer ID format",
            });
        }
        const query = { organizerId: objectId };
        const skip = page && limit ? (Number(page) - 1) * Number(limit) : 0;
        let retreats;
        let totalRetreats;
        if (page && limit) {
            retreats = yield RetreatModal_1.default.find(query).skip(skip).limit(Number(limit));
            totalRetreats = yield RetreatModal_1.default.countDocuments(query);
        }
        else {
            retreats = yield RetreatModal_1.default.find(query);
            totalRetreats = retreats.length;
        }
        if (retreats.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No retreats found for this organizer",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Retreats fetched successfully",
            data: {
                retreats,
                totalRetreats,
                totalPages: page && limit ? Math.ceil(totalRetreats / Number(limit)) : 1,
                currentPage: page && limit ? Number(page) : 1,
            },
        });
    }
    catch (err) {
        console.error("Error fetching retreats:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.getRetreatsByOrganizer = getRetreatsByOrganizer;
const getCreatedRetreatsByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = req.query;
    try {
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid limit value" });
        }
        if (isNaN(parsedPage) || parsedPage <= 0) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid page number" });
        }
        const skip = (parsedPage - 1) * parsedLimit;
        const retreats = yield RetreatModal_1.default.find({ isApproved: false })
            .populate("organizerId")
            .skip(skip)
            .limit(parsedLimit)
            .sort({ createdAt: -1 })
            .lean();
        const totalRetreats = yield RetreatModal_1.default.countDocuments({ isApproved: false });
        const totalPages = Math.ceil(totalRetreats / parsedLimit);
        return res.status(200).json({
            success: true,
            message: "Retreats created by organizers fetched successfully",
            data: {
                retreats,
                totalRetreats,
                totalPages,
                currentPage: parsedPage,
            },
        });
    }
    catch (error) {
        console.error("Error fetching created retreats by organizer:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.getCreatedRetreatsByAdmin = getCreatedRetreatsByAdmin;
const approveRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userRole = req?.user?.role;
    // if (userRole !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Forbidden: You do not have the necessary permissions",
    //   });
    // }
    const { id } = req.params;
    try {
        const retreat = yield RetreatModal_1.default.findById(id);
        if (!retreat) {
            return res.status(404).json({
                success: false,
                message: "Retreat not found",
            });
        }
        retreat.isApproved = true;
        yield retreat.save();
        return res.status(200).json({
            success: true,
            message: "Retreat approved successfully",
            data: retreat,
        });
    }
    catch (err) {
        console.error("Error approving retreat:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});
exports.approveRetreat = approveRetreat;
const getRetreats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const retreats = yield RetreatModal_1.default.find({}).select("title _id").lean();
        if (!retreats.length) {
            return res.status(404).json({ message: "No retreats found" });
        }
        const retreatOptions = retreats.map((retreat) => ({
            label: retreat.title,
            value: retreat._id,
        }));
        return res.status(200).json({
            message: "Retreats retrieved successfully",
            data: retreatOptions,
        });
    }
    catch (error) {
        console.error("Failed to fetch retreats:", error);
        return res.status(500).json({ message: "Failed to fetch retreats", error });
    }
});
exports.getRetreats = getRetreats;
