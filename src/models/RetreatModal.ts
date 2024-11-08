// models/RetreatModal.ts
import mongoose, { Document, Schema, ObjectId } from "mongoose";

// Define the Retreat interface and schema
interface ILocation {
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface IRetreat extends Document {
  title: string;
  description: string;
  price: number;
  locations: ILocation;
  features: string;
  availability: {
    startDate: Date;
    endDate: Date;
  };
  imageUrls: string[];
  category: { id: ObjectId; name: string }[];
  popular: { id: ObjectId; name: string }[];
  isWishlisted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const LocationSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

const RetreatSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    locations: LocationSchema,
    features: { type: String, required: true },
    availability: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    imageUrls: [{ type: String, required: true }],
    category: [
      {
        id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        name: { type: String, required: true },
      },
    ],
    popular: [
      {
        id: { type: Schema.Types.ObjectId, ref: "Popular", required: true },
        name: { type: String, required: true },
      },
    ],
    isWishlisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Retreat = mongoose.model<IRetreat>("Retreat", RetreatSchema);
export default Retreat;
