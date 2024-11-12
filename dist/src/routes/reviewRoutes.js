"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const reviewControllers_1 = require("../controllers/reviewControllers");
const router = express_1.default.Router();
router.post("/add-review", (0, asyncHandler_1.default)(reviewControllers_1.addReview));
router.get("/get-review/:userId", (0, asyncHandler_1.default)(reviewControllers_1.getReviewsByUserId));
exports.default = router;
