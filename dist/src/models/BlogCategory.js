"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogCategory = void 0;
const mongoose_1 = require("mongoose");
const BlogCategorySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false,
});
exports.BlogCategory = (0, mongoose_1.model)("BlogCategory", BlogCategorySchema);
