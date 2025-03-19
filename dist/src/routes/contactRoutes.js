"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const contactControllers_1 = require("../controllers/contactControllers");
const router = (0, express_1.Router)();
router.post("/post-enquiry", (0, asyncHandler_1.default)(contactControllers_1.createContact));
exports.default = router;
