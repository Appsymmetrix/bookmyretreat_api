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
exports.editReview = exports.getReviewsByUserId = exports.addReview = void 0;
const validation_1 = require("../../utils/validation");
const Review_1 = __importDefault(require("../models/Review"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.reviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { userId, reviews } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format" });
    }
    try {
        let userReview = yield Review_1.default.findOne({ userId });
        if (userReview) {
            if (Array.isArray(reviews) && reviews.length > 0) {
                reviews.forEach((review) => {
                    const reviewData = {
                        rating: review.rating,
                        comment: review.comment,
                        helpfulCount: 0,
                        datePosted: new Date(),
                    };
                    userReview.reviews.push(reviewData);
                });
                yield userReview.save();
                return res.status(200).json({
                    message: "Review added successfully",
                    reviews: userReview.reviews,
                });
            }
            else {
                return res.status(400).json({ message: "Invalid review format" });
            }
        }
        else {
            const newReviewData = {
                userId,
                reviews: reviews.map((review) => ({
                    rating: review.rating,
                    comment: review.comment,
                    helpfulCount: 0,
                    datePosted: new Date(),
                })),
            };
            const newReview = new Review_1.default(newReviewData);
            yield newReview.save();
            return res.status(201).json({
                message: "Review added successfully",
                reviews: newReview.reviews,
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Failed to add review", error });
    }
});
exports.addReview = addReview;
const getReviewsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format" });
    }
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userReview = yield Review_1.default.findOne({ userId });
        if (!userReview) {
            return res
                .status(404)
                .json({ message: "No reviews found for this user" });
        }
        const reviewsWithName = {
            name: user.name,
            reviews: userReview,
        };
        res.status(200).json(reviewsWithName);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve reviews", error });
    }
});
exports.getReviewsByUserId = getReviewsByUserId;
const editReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, reviewId } = req.params;
    const { rating, comment } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId) ||
        !mongoose_1.default.Types.ObjectId.isValid(reviewId)) {
        return res
            .status(400)
            .json({ message: "Invalid userId or reviewId format" });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    try {
        const userReview = yield Review_1.default.findOne({ userId });
        if (!userReview) {
            return res
                .status(404)
                .json({ message: "Review not found for this user" });
        }
        const reviewIndex = userReview.reviews.findIndex((review) => { var _a; return ((_a = review._id) === null || _a === void 0 ? void 0 : _a.toString()) === reviewId; });
        if (reviewIndex === -1) {
            return res.status(404).json({ message: "Review not found" });
        }
        userReview.reviews[reviewIndex].rating = rating;
        userReview.reviews[reviewIndex].comment = comment;
        userReview.reviews[reviewIndex].datePosted = new Date();
        yield userReview.save();
        res.status(200).json({
            message: "Review updated successfully",
            reviews: userReview.reviews,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update review", error });
    }
});
exports.editReview = editReview;
