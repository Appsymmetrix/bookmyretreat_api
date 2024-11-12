"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/subscriptionRoutes.ts
const express_1 = __importDefault(require("express"));
const subscriptionController_1 = require("../controllers/subscriptionController");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const router = express_1.default.Router();
router.post("/retreat-subscription", (0, asyncHandler_1.default)(subscriptionController_1.subscribeRetreat));
exports.default = router;
