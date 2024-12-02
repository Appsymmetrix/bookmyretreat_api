import mongoose, { Schema, Document, Types } from "mongoose";

export interface WishlistItem {
  serviceType: "Retreat" | "Blog";
  serviceId: Types.ObjectId;
  addedAt?: Date;
  serviceData?: any;
}

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  items: WishlistItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const WishlistItemSchema = new Schema<WishlistItem>(
  {
    serviceType: {
      type: String,
      required: true,
      enum: ["Retreat", "Blog"],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "serviceType",
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [WishlistItemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
