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
exports.getUserWishlist = exports.removeFromWishlist = exports.addToWishlist = void 0;
const RetreatModal_1 = __importDefault(require("../models/RetreatModal"));
const Wishlist_1 = __importDefault(require("../models/Wishlist"));
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, retreatId } = req.body;
    try {
        const existingWishlist = yield Wishlist_1.default.findOne({ userId, retreatId });
        if (existingWishlist) {
            return res.status(400).json({
                success: false,
                message: "Retreat is already in the wishlist",
            });
        }
        const newWishlist = new Wishlist_1.default({
            userId,
            retreatId,
        });
        yield newWishlist.save();
        yield RetreatModal_1.default.findByIdAndUpdate(retreatId, { isWishlisted: true });
        return res.status(201).json({
            success: true,
            message: "Retreat added to wishlist successfully",
            data: newWishlist,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.addToWishlist = addToWishlist;
const removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, retreatId } = req.body;
    try {
        const deletedWishlist = yield Wishlist_1.default.findOneAndDelete({
            userId,
            retreatId,
        });
        if (!deletedWishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist entry not found",
            });
        }
        yield RetreatModal_1.default.findByIdAndUpdate(retreatId, { isWishlisted: false });
        return res.status(200).json({
            success: true,
            message: "Retreat removed from wishlist successfully",
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.removeFromWishlist = removeFromWishlist;
const getUserWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const userWishlist = yield Wishlist_1.default.find({ userId }).populate("retreatId");
        if (!userWishlist || userWishlist.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No wishlist items found for this user",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User's wishlist fetched successfully",
            data: userWishlist,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getUserWishlist = getUserWishlist;
