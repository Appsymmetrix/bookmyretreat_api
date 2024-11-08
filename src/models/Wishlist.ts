// models/Wishlist.ts
import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IWishlist extends Document {
  userId: ObjectId;
  retreatId: ObjectId;
}

const WishlistSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    retreatId: { type: Schema.Types.ObjectId, ref: "Retreat", required: true },
  },
  { timestamps: true }
);

const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
