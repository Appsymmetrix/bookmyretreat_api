import mongoose, { Schema, Document, Types, Model } from "mongoose";

interface IReviewDetails {
  _id?: Types.ObjectId;
  rating: number;
  comment: string;
  helpfulCount: number;
  datePosted: Date;
  userId: Types.ObjectId;
  username?: string;
}

export interface IReview extends Document {
  userId: Types.ObjectId;
  retreatId: Types.ObjectId;
  reviews: IReviewDetails[];
}

const reviewDetailsSchema = new Schema<IReviewDetails>({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  helpfulCount: { type: Number, default: 0 },
  datePosted: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String },
});

const reviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  retreatId: { type: Schema.Types.ObjectId, ref: "Retreat", required: true },
  reviews: { type: [reviewDetailsSchema], default: [] },
});

const ReviewModel = mongoose.model<IReview>("Review", reviewSchema);
export default ReviewModel;
