import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IWishlist extends Document {
  userId: ObjectId;
  items: { retreatId: ObjectId; addedAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        retreatId: {
          type: Schema.Types.ObjectId,
          ref: "Retreat",
          required: true,
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
