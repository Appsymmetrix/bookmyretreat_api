import mongoose, { Schema, Document, Types } from "mongoose";

interface IReviewDetails {
  _id?: Types.ObjectId;
  rating: number;
  comment: string;
  helpfulCount: number;
  datePosted: Date;
}

export interface IReview extends Document {
  userId: string;
  retreatId: Types.ObjectId;
  reviews: IReviewDetails[];
}

const reviewDetailsSchema = new Schema<IReviewDetails>({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  helpfulCount: { type: Number, default: 0 },
  datePosted: { type: Date, default: Date.now },
});

const reviewSchema = new Schema<IReview>({
  userId: { type: String, required: true },
  retreatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retreat",
    required: true,
  },
  reviews: { type: [reviewDetailsSchema], default: [] },
});

export default mongoose.model<IReview>("Review", reviewSchema);
