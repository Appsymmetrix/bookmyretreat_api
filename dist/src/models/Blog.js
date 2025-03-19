"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blog = void 0;
const mongoose_1 = require("mongoose");
const BlogSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    desc: {
        type: String,
        required: true,
    },
    imageTileUrl: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    readTime: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "BlogCategory",
        required: true,
    },
    keywords: [
        {
            type: String,
            trim: true,
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false,
});
exports.Blog = (0, mongoose_1.model)("Blog", BlogSchema);
