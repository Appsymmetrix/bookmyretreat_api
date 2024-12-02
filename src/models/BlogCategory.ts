import { Schema, model, Document } from "mongoose";

export interface IBlogCategory extends Document {
  title: string;
  createdAt: Date;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export const BlogCategory = model<IBlogCategory>(
  "BlogCategory",
  BlogCategorySchema
);
