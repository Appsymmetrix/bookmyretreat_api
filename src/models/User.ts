// models/User.ts
import mongoose, { Schema, Document } from "mongoose";

// Define the IUser interface that extends mongoose Document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  mobileNumber: string;
  city: string;
  countryCode: string;
  role: "user" | "organiser" | "admin" | undefined;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    createdAt: { type: Date, default: Date.now },
    mobileNumber: { type: String, required: true },
    city: { type: String, required: true },
    countryCode: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["user", "organiser", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Create the User model using the IUser interface
const User = mongoose.model<IUser>("User", UserSchema);

// Export the model as well as the interface IUser
export default User;
