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
exports.clearWishlist = exports.removeFromWishlist = exports.addToWishlist = exports.getWishlistByServiceType = exports.getWishlistByUser = exports.createOrUpdateWishlist = void 0;
const mongoose_1 = require("mongoose");
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const RetreatModal_1 = __importDefault(require("../models/RetreatModal"));
const Blog_1 = require("../models/Blog");
const populateWishlistItemsByServiceType = (wishlist, serviceType) => __awaiter(void 0, void 0, void 0, function* () {
    const groupedItems = {};
    const filteredItems = wishlist.items.filter((item) => item.serviceType === serviceType);
    for (let item of filteredItems) {
        let model;
        switch (item.serviceType) {
            case "Retreat":
                model = RetreatModal_1.default;
                break;
            case "Blog":
                model = Blog_1.Blog;
                break;
            default:
                continue;
        }
        const serviceId = new mongoose_1.Types.ObjectId(item.serviceId);
        try {
            //@ts-ignore
            const service = (yield model.findById(serviceId).exec());
            if (service) {
                if (!groupedItems[item.serviceType]) {
                    groupedItems[item.serviceType] = {
                        serviceType: item.serviceType,
                        data: [],
                    };
                }
                groupedItems[item.serviceType].data.push({ serviceId });
            }
        }
        catch (error) {
            console.error(`Error fetching ${item.serviceType} with ID ${item.serviceId}`, error);
        }
    }
    return Object.values(groupedItems);
});
const createOrUpdateWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const wishlistData = req.body;
    try {
        let wishlist = yield Wishlist_1.default.findOne({ userId }).exec();
        if (!wishlist) {
            wishlist = new Wishlist_1.default({ userId, items: wishlistData.items });
            yield wishlist.save();
            return res.status(201).json(wishlist);
        }
        else {
            wishlist.items = wishlistData.items;
            yield wishlist.save();
            return res.status(200).json(wishlist);
        }
    }
    catch (err) {
        console.error("Error creating/updating wishlist:", err);
        return res.status(500).json({
            success: false,
            message: "Server error occurred while creating/updating wishlist.",
        });
    }
});
exports.createOrUpdateWishlist = createOrUpdateWishlist;
const getWishlistByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const wishlist = yield Wishlist_1.default.findOne({ userId })
            .populate({
            path: "items.serviceId",
            model: "Retreat",
        })
            .exec();
        if (!wishlist) {
            return res.status(200).json([]);
        }
        const populatedWishlist = wishlist.items.map((item) => {
            if (item.serviceType === "Retreat" && item.serviceId) {
                item.serviceData = item.serviceId || {};
            }
            else {
                item.serviceData = null;
            }
            return item;
        });
        return res.status(200).json(populatedWishlist);
    }
    catch (error) {
        console.error("Failed to retrieve wishlist", error);
        return res
            .status(500)
            .json({ message: "Failed to retrieve wishlist", error });
    }
});
exports.getWishlistByUser = getWishlistByUser;
const getWishlistByServiceType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, serviceType } = req.params;
    try {
        let wishlist = yield Wishlist_1.default.findOne({ userId }).exec();
        if (!wishlist) {
            return res.status(200).json([]);
        }
        const populatedWishlist = yield populateWishlistItemsByServiceType(wishlist, serviceType);
        return res.status(200).json(populatedWishlist);
    }
    catch (err) {
        console.error("Error retrieving wishlist by serviceType:", err);
        return res.status(500).json({
            success: false,
            message: "Server error occurred while fetching wishlist by serviceType.",
        });
    }
});
exports.getWishlistByServiceType = getWishlistByServiceType;
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { serviceType, serviceId } = req.body;
    try {
        let wishlist = yield Wishlist_1.default.findOne({ userId }).exec();
        if (!wishlist) {
            wishlist = new Wishlist_1.default({ userId, items: [{ serviceType, serviceId }] });
            yield wishlist.save();
            return res.status(201).json(wishlist);
        }
        else {
            const existingItem = wishlist.items.find((item) => item.serviceType === serviceType &&
                item.serviceId.toString() === serviceId.toString());
            if (existingItem) {
                return res.status(400).json({ message: "Item already in wishlist." });
            }
            wishlist.items.push({ serviceType, serviceId });
            yield wishlist.save();
            return res.status(200).json(wishlist);
        }
    }
    catch (err) {
        console.error("Error adding item to wishlist:", err);
        return res.status(500).json({
            success: false,
            message: "Server error occurred while adding item to wishlist.",
        });
    }
});
exports.addToWishlist = addToWishlist;
const removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, serviceType, serviceId } = req.params;
    try {
        const wishlist = yield Wishlist_1.default.findOne({ userId }).exec();
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found." });
        }
        const index = wishlist.items.findIndex((item) => item.serviceType === serviceType &&
            item.serviceId.toString() === serviceId);
        if (index === -1) {
            return res.status(404).json({ message: "Item not found in wishlist." });
        }
        wishlist.items.splice(index, 1);
        yield wishlist.save();
        return res.status(200).json(wishlist);
    }
    catch (err) {
        console.error("Error removing item from wishlist:", err);
        return res.status(500).json({
            success: false,
            message: "Server error occurred while removing item from wishlist.",
        });
    }
});
exports.removeFromWishlist = removeFromWishlist;
const clearWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const wishlist = yield Wishlist_1.default.findOne({ userId }).exec();
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found." });
        }
        wishlist.items = [];
        yield wishlist.save();
        return res.status(200).json({ message: "Wishlist cleared successfully." });
    }
    catch (err) {
        console.error("Error clearing wishlist:", err);
        return res.status(500).json({
            success: false,
            message: "Server error occurred while clearing wishlist.",
        });
    }
});
exports.clearWishlist = clearWishlist;
