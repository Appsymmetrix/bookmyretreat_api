// models/Category.ts
import mongoose, { Document, Schema, ObjectId } from "mongoose";

interface ICategory extends Document {
  _id: ObjectId;
  name: string;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
});

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
