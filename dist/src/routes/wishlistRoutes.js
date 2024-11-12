"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlistController_1 = require("../controllers/wishlistController");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const router = express_1.default.Router();
router.post("/add-wishlist", (0, asyncHandler_1.default)(wishlistController_1.addToWishlist));
router.delete("/remove-wishlist", (0, asyncHandler_1.default)(wishlistController_1.removeFromWishlist));
router.get("/all-wishlist/:userId", (0, asyncHandler_1.default)(wishlistController_1.getUserWishlist));
exports.default = router;
