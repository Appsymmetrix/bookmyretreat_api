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
exports.uploadController = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: "AKIA4MTWMT5NZ5SXUZHY",
    secretAccessKey: "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",
    region: "us-east-1",
});
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const supportedFormats = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/tiff",
];
const uploadImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || req.files.length === 0) {
        res.status(400).json({ error: "No files uploaded" });
        return;
    }
    const promises = req.files.map((file) => new Promise((resolve, reject) => {
        if (!supportedFormats.includes(file.mimetype)) {
            reject(`Unsupported file format: ${file.mimetype}`);
            return;
        }
        const uniqueFilename = `${(0, uuid_1.v4)()}-${Date.now()}.webp`;
        (0, sharp_1.default)(file.buffer)
            .webp({ quality: 80 })
            .toBuffer()
            .then((buffer) => {
            const uploadParams = {
                Bucket: req.query.bucketName
                    ? `bookmyretreat-v1/${req.query.bucketName}`
                    : "bookmyretreat-v1",
                Key: uniqueFilename,
                Body: buffer,
                ContentType: "image/webp",
                ACL: "public-read",
            };
            s3.upload(uploadParams, (error, data) => {
                if (error) {
                    console.error("S3 upload error:", error);
                    reject("Failed to upload images");
                }
                else {
                    resolve({
                        imageUrl: data.Location,
                    });
                }
            });
        })
            .catch((error) => {
            if (error.message.includes("Bitstream not supported")) {
                console.error("Sharp error: Unsupported image format");
                reject("Unsupported image format. Please upload a valid image.");
            }
            else {
                console.error("Sharp error:", error);
                reject("Failed to compress images");
            }
        });
    }));
    try {
        const imageData = yield Promise.all(promises);
        res.status(200).json({ images: imageData });
    }
    catch (error) {
        console.error("Error uploading images:", error);
        if (typeof error === "string" &&
            error.startsWith("Unsupported file format")) {
            res.status(400).json({ error });
        }
        else {
            res.status(500).json({ error });
        }
    }
});
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.query;
    if (typeof url !== "string") {
        res
            .status(400)
            .json({ error: "Image URL is required and must be a string" });
        return;
    }
    const key = url.split("/").pop();
    const deleteParams = {
        Bucket: "bookmyretreat-v1",
        Key: key,
    };
    s3.deleteObject(deleteParams, (error, data) => {
        if (error) {
            console.error("S3 delete error:", error);
            res.status(500).json({ error: "Failed to delete image" });
        }
        else {
            res.status(200).json({ message: "Image deleted successfully" });
        }
    });
});
exports.uploadController = {
    uploadImages: [upload.array("images", 10), uploadImages],
    deleteImage,
};
exports.default = router;
