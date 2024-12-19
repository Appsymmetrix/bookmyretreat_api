import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  imgUrl: string[];
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imgUrl: { type: [String], required: true },
});

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
