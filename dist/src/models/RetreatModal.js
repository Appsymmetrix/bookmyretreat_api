"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const LocationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
});
const RetreatSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    locations: LocationSchema,
    features: { type: String, required: true },
    benefits: { type: String, required: true },
    programs: { type: String, required: true },
    includedInPackage: { type: String, required: true },
    includedInPrice: { type: String, required: true },
    availability: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    },
    imageUrls: [{ type: String, required: true }],
    category: [
        {
            id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
            name: { type: String, required: true },
        },
    ],
    popular: [
        {
            id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Popular", required: true },
            name: { type: String, required: true },
        },
    ],
    isWishlisted: { type: Boolean, default: false },
}, { timestamps: true });
const Retreat = mongoose_1.default.model("Retreat", RetreatSchema);
exports.default = Retreat;
