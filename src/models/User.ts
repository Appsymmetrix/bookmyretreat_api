import mongoose, { Schema, Document } from "mongoose";
import moment from "moment";

export interface INotification {
  title: string;
  message: string;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  mobileNumber: string;
  city: string;
  role: "user" | "organiser" | "admin";
  notifications: INotification[];
  iat?: number;
  exp?: number;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  isNewUser: boolean;
  organization?: {
    name: string;
    description?: string;
    imageUrl?: string;
  };
}

const NotificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: function (this: IUser) {
        return this.role === "user";
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    createdAt: { type: Date, default: Date.now },
    mobileNumber: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: function (this: IUser) {
        return this.role === "user";
      },
    },

    role: {
      type: String,
      required: true,
      enum: ["user", "organiser", "admin"],
      default: "user",
    },
    notifications: {
      type: [NotificationSchema],
      default: [],
      required: function (this: IUser) {
        return this.role === "user";
      },
    },
    iat: { type: Number },
    exp: { type: Number },
    isEmailVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    isNewUser: { type: Boolean, default: false },
    organization: {
      type: new Schema({
        name: { type: String, required: true },
        description: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
      }),
      required: function (this: IUser) {
        return this.role === "organiser";
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
