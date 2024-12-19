import mongoose, { Document, Schema, ObjectId, Types } from "mongoose";
import Organizer from "./Organizer";
import Category, { ICategory } from "./Category"; // Ensure to import Category model
import Popular from "./Filter";

interface IRoom {
  type: string;
  numberOfRooms: number;
  peopleAllowed: number;
  roomPrice: number;
}

export interface IRetreat extends Document {
  title: string;
  description: string;
  price: number;
  organizerId?: ObjectId;
  organizerName: string;
  organizerContact: string;
  retreatMonths: string;
  daysOfRetreat: string;
  rooms: IRoom[];
  city: string;
  state: string;
  country: string;
  fullAddress: string;
  googleMapUrl: string;
  geoLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  imageUrls: string[];
  features: string;
  customSection: string;
  benefits: string;
  programs: string;
  includedInPackage: string;
  includedInPrice: string;
  availability: {
    startDate: Date;
    endDate: Date;
  };
  category: Types.ObjectId | ICategory;
  popular: { id: ObjectId; name: string }[];
  isWishlisted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isApproved: boolean;
}

const RoomSchema: Schema = new Schema({
  type: { type: String, required: true },
  numberOfRooms: { type: Number, required: true },
  peopleAllowed: { type: Number, required: true },
  roomPrice: { type: Number, required: true },
});

const TeacherSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: false },
});

const RetreatSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: Organizer,
      required: false,
      default: null,
    },
    organizerName: { type: String, required: true },
    organizerContact: { type: String, required: true },
    retreatMonths: { type: String, default: "" },
    daysOfRetreat: { type: String, required: true },
    rooms: [RoomSchema],
    teachers: [TeacherSchema],
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    fullAddress: { type: String, required: true },
    googleMapUrl: { type: String },
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
    },
    imageUrls: [{ type: String, required: true }],
    features: { type: String, required: true },
    benefits: { type: String, required: true },
    programs: { type: String, required: true },
    customSection: { type: String, required: true },
    includedInPackage: { type: String, required: true },
    includedInPrice: { type: String, required: true },
    availability: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Category,
      required: true,
    },
    popular: [
      {
        id: { type: Schema.Types.ObjectId, ref: Popular },
        name: { type: String, required: true },
      },
    ],
    isWishlisted: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isCreatedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Retreat = mongoose.model<IRetreat>("Retreat", RetreatSchema);
export default Retreat;
