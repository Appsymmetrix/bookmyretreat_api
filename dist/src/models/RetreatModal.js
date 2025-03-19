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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const Organizer_1 = __importDefault(require("./Organizer"));
const Category_1 = __importDefault(require("./Category"));
const Filter_1 = __importDefault(require("./Filter"));
const FoodSchema = new mongoose_1.Schema({
    mealName: { type: String, required: true },
    description: { type: String, required: true },
});
const TeacherSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false },
});
const RoomSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    numberOfRooms: { type: Number, required: true },
    peopleAllowed: { type: Number, required: true },
    roomPrice: { type: Number, required: true },
    imageUrls: [{ type: String, required: true }],
});
const RetreatSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    organizerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: Organizer_1.default,
        required: false,
        default: null,
    },
    organizerName: { type: String, required: true },
    organizerContact: { type: String, required: true },
    retreatMonths: { type: String, default: "" },
    daysOfRetreat: { type: String, required: true },
    rooms: [RoomSchema],
    teachers: [TeacherSchema],
    foodDetails: [FoodSchema],
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    fullAddress: { type: String, required: true },
    googleMapUrl: { type: String },
    geoLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
            index: "2dsphere",
        },
    },
    imageUrls: [{ type: String, required: true }],
    features: { type: String, required: true },
    benefits: { type: String, required: true },
    programs: { type: String, required: true },
    customSection: { type: String, required: true },
    includedInPackage: { type: String, required: true },
    includedInPrice: { type: String, required: true },
    availability: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: Category_1.default,
        required: true,
    },
    popular: [
        {
            id: { type: mongoose_1.Schema.Types.ObjectId, ref: Filter_1.default },
            name: { type: String, required: true },
        },
    ],
    isWishlisted: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isCreatedByAdmin: { type: Boolean, default: false },
}, { timestamps: true });
const Retreat = mongoose_1.default.model("Retreat", RetreatSchema);
exports.default = Retreat;
