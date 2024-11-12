"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authControllers_1 = require("../controllers/authControllers");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const router = express_1.default.Router();
router.post("/register", (0, asyncHandler_1.default)(authControllers_1.registerUser));
router.post("/login", (0, asyncHandler_1.default)(authControllers_1.loginUser));
router.put("/update/:userId", (0, asyncHandler_1.default)(authControllers_1.updateUser));
router.get("/my-profile/:userId", (0, asyncHandler_1.default)(authControllers_1.getUserById));
router.post("/forgot-password", (0, asyncHandler_1.default)(authControllers_1.forgotPassword));
router.post("/verify-reset-code", (0, asyncHandler_1.default)(authControllers_1.verifyResetCode));
router.post("/reset-password", (0, asyncHandler_1.default)(authControllers_1.resetPassword));
exports.default = router;
