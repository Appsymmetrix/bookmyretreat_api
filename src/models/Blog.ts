import { Schema, model, Document, Types } from "mongoose";

export interface IBlog extends Document {
  title: string;
  desc: string;
  imageTileUrl: string;
  slug: string;
  readTime: number;
  content: string;
  category: Types.ObjectId;
  keywords: string[];
  createdAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
    },
    imageTileUrl: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    readTime: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export const Blog = model<IBlog>("Blog", BlogSchema);
