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
exports.getRetreatById = exports.getAllRetreats = exports.deleteRetreat = exports.updateRetreat = exports.createRetreat = void 0;
const validation_1 = require("../../utils/validation");
const RetreatModal_1 = __importDefault(require("../models/RetreatModal"));
const createRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    console.log(req);
    const userRole = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found." });
    }
    if (userRole !== "admin" && userRole !== "organiser") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: You do not have the necessary permissions",
        });
    }
    const { error } = (0, validation_1.retreatValidationPartial)(req.body);
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
        const retreatData = req.body;
        const existingRetreat = yield RetreatModal_1.default.findOne({ title: retreatData.title });
        if (existingRetreat) {
            return res.status(400).json({
                success: false,
                message: "A retreat with this title already exists",
            });
        }
        const newRetreat = new RetreatModal_1.default(Object.assign({}, retreatData));
        yield newRetreat.save();
        const formattedData = Object.assign(Object.assign({}, newRetreat.toObject()), { category: (_b = newRetreat.category) === null || _b === void 0 ? void 0 : _b.map(({ id, name }) => ({ id, name })), popular: (_c = newRetreat.popular) === null || _c === void 0 ? void 0 : _c.map(({ id, name }) => ({ id, name })) });
        return res.status(201).json({
            success: true,
            message: "Retreat created successfully",
            data: formattedData,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.createRetreat = createRetreat;
const updateRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userRole = req?.user?.role;
    // if (!req.user) {
    //   return res.status(401).json({ message: "Unauthorized: No user found." });
    // }
    // if (userRole !== "admin" && userRole !== "organiser") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Forbidden: You do not have the necessary permissions",
    //   });
    // }
    const { error } = (0, validation_1.retreatValidationPartial)(req.body);
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
        const retreatData = req.body;
        const retreat = yield RetreatModal_1.default.findById(id);
        if (!retreat) {
            return res.status(404).json({
                success: false,
                message: "Retreat not found",
            });
        }
        Object.assign(retreat, retreatData);
        yield retreat.save();
        return res.status(200).json({
            success: true,
            message: "Retreat updated successfully",
            data: retreat,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.updateRetreat = updateRetreat;
const deleteRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userRole = req?.user?.role;
    // if (userRole !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Forbidden: You do not have the necessary permissions",
    //   });
    // }
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
    const { lastId, limit = 10 } = req.query;
    try {
        let query = {};
        if (lastId) {
            query = { _id: { $gt: lastId } };
        }
        const retreats = yield RetreatModal_1.default.find(query).limit(+limit).sort({ _id: 1 });
        const totalRetreats = yield RetreatModal_1.default.countDocuments();
        const totalPages = Math.ceil(totalRetreats / +limit);
        const nextLastId = retreats.length > 0 ? retreats[retreats.length - 1]._id : null;
        return res.status(200).json({
            success: true,
            message: "Retreats fetched successfully",
            data: {
                retreats,
                totalRetreats,
                totalPages,
                lastId: nextLastId,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getAllRetreats = getAllRetreats;
const getRetreatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const retreat = yield RetreatModal_1.default.findById(id);
        if (!retreat) {
            return res.status(404).json({
                success: false,
                message: "Retreat not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Retreat fetched successfully",
            data: retreat,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getRetreatById = getRetreatById;
