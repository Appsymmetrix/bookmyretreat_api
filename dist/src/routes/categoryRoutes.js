"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const categoryControllers_1 = require("../controllers/categoryControllers");
const router = express_1.default.Router();
router.post("/add-category", (0, asyncHandler_1.default)(categoryControllers_1.addCategory));
router.post("/add-popular", (0, asyncHandler_1.default)(categoryControllers_1.addPopular));
router.get("/all-category", (0, asyncHandler_1.default)(categoryControllers_1.getAllCategories));
router.get("/all-popular", (0, asyncHandler_1.default)(categoryControllers_1.getPopular));
router.put("/categories/:id", (0, asyncHandler_1.default)(categoryControllers_1.updateCategory));
exports.default = router;
