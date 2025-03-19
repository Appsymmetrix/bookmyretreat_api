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
exports.getUserReviews = exports.adminEditReview = exports.getReviewsByRetreatId = exports.editReview = exports.getReviewsByUserId = exports.addReview = void 0;
const validation_1 = require("../../utils/validation");
const Review_1 = __importDefault(require("../models/Review"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const RetreatModal_1 = __importDefault(require("../models/RetreatModal"));
const handleUserReview = (userId, retreatId, reviews) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewData = reviews.map((review) => ({
        rating: review.rating,
        comment: review.comment,
        helpfulCount: 0,
        datePosted: new Date(),
        userId: new mongoose_1.default.Types.ObjectId(userId),
        username: review.username,
    }));
    let userReview = yield Review_1.default.findOne({ userId, retreatId });
    if (userReview) {
        userReview.reviews.push(...reviewData);
        yield userReview.save();
        return userReview;
    }
    else {
        const newReviewData = {
            userId,
            retreatId,
            reviews: reviewData,
        };
        const newReview = new Review_1.default(newReviewData);
        yield newReview.save();
        return newReview;
    }
});
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validation_1.reviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { userId, retreatId, reviews } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId) ||
        !mongoose_1.default.Types.ObjectId.isValid(retreatId)) {
        return res
            .status(400)
            .json({ message: "Invalid userId or retreatId format" });
    }
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({ message: "Invalid review format" });
    }
    try {
        const user = yield User_1.default.findById(userId).select("name");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userReview = yield handleUserReview(userId, retreatId, reviews.map((review) => (Object.assign(Object.assign({}, review), { username: user.name }))));
        return res.status(201).json({
            message: "Review added successfully",
            reviews: userReview.reviews,
            userName: user.name,
        });
    }
    catch (error) {
        console.error("Failed to add review:", error);
        return res.status(500).json({ message: "Failed to add review", error });
    }
});
exports.addReview = addReview;
const getReviewsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, retreatId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId) ||
        !mongoose_1.default.Types.ObjectId.isValid(retreatId)) {
        return res
            .status(400)
            .json({ message: "Invalid userId or retreatId format" });
    }
    try {
        const user = yield User_1.default.findById(userId).select("name").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userReview = yield Review_1.default.findOne({ userId, retreatId }).lean();
        if (!userReview) {
            return res
                .status(404)
                .json({ message: "No reviews found for this user and retreat" });
        }
        return res.status(200).json({
            message: "Reviews retrieved successfully",
            userName: user.name,
            reviews: userReview.reviews,
        });
    }
    catch (error) {
        console.error("Failed to retrieve reviews:", error);
        return res
            .status(500)
            .json({ message: "Failed to retrieve reviews", error });
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
        return res.status(200).json({
            message: "Review updated successfully",
            reviews: userReview.reviews,
        });
    }
    catch (error) {
        console.error("Failed to update review:", error);
        return res.status(500).json({ message: "Failed to update review", error });
    }
});
exports.editReview = editReview;
const getReviewsByRetreatId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { retreatId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(retreatId)) {
        return res.status(400).json({ message: "Invalid retreatId format" });
    }
    try {
        const retreat = yield RetreatModal_1.default.findById(retreatId).select("title");
        if (!retreat) {
            return res.status(404).json({ message: "Retreat not found" });
        }
        const reviews = yield Review_1.default.aggregate([
            {
                $match: { retreatId: new mongoose_1.default.Types.ObjectId(retreatId) },
            },
            {
                $unwind: "$reviews",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "reviews.userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: "$reviews._id",
                    rating: "$reviews.rating",
                    comment: "$reviews.comment",
                    helpfulCount: "$reviews.helpfulCount",
                    datePosted: "$reviews.datePosted",
                    username: { $ifNull: ["$userDetails.name", "Anonymous"] },
                    retreatName: retreat.title,
                },
            },
        ]);
        if (!reviews.length) {
            return res
                .status(404)
                .json({ message: "No reviews found for this retreat" });
        }
        return res.status(200).json({
            message: "Reviews fetched successfully",
            data: reviews,
        });
    }
    catch (error) {
        console.error("Failed to fetch reviews:", error);
        return res.status(500).json({ message: "Failed to fetch reviews", error });
    }
});
exports.getReviewsByRetreatId = getReviewsByRetreatId;
const adminEditReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: "Invalid reviewId format" });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    try {
        const review = yield Review_1.default.findOneAndUpdate({ "reviews._id": reviewId }, {
            $set: {
                "reviews.$.rating": rating,
                "reviews.$.comment": comment,
                "reviews.$.datePosted": new Date(),
            },
        }, { new: true });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json({
            message: "Review updated successfully",
            reviews: review.reviews,
        });
    }
    catch (error) {
        console.error("Failed to update review:", error);
        return res.status(500).json({ message: "Failed to update review", error });
    }
});
exports.adminEditReview = adminEditReview;
const getUserReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format" });
    }
    try {
        const userReviews = yield Review_1.default.aggregate([
            {
                $match: { userId: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $unwind: "$reviews",
            },
            {
                $lookup: {
                    from: "retreats",
                    localField: "retreatId",
                    foreignField: "_id",
                    as: "retreatDetails",
                },
            },
            {
                $unwind: {
                    path: "$retreatDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    reviewId: "$reviews._id",
                    rating: "$reviews.rating",
                    comment: "$reviews.comment",
                    datePosted: "$reviews.datePosted",
                    retreatId: "$retreatId",
                    retreatTitle: "$retreatDetails.title",
                },
            },
        ]);
        if (!userReviews.length) {
            return res
                .status(404)
                .json({ message: "No reviews found for this user" });
        }
        return res.status(200).json({
            message: "User reviews fetched successfully",
            reviews: userReviews,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Failed to fetch user reviews", error });
    }
});
exports.getUserReviews = getUserReviews;
