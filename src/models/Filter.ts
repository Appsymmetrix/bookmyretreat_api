import mongoose, { Document, Schema, ObjectId } from "mongoose";

interface IFilter extends Document {
  _id: ObjectId;
  name: string;
}

const FilterSchema: Schema = new Schema({
  name: { type: String, required: true },
});

const Popular = mongoose.model<IFilter>("Popular", FilterSchema);
export default Popular;
