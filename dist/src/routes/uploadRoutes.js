"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploaderControls_1 = require("../controllers/uploaderControls");
const router = express_1.default.Router();
router.route("/images").post(uploaderControls_1.uploadController.uploadImages);
router.route("/delete-image").delete(uploaderControls_1.uploadController.deleteImage);
exports.default = router;
