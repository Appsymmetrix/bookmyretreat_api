import mongoose, { Schema, Document } from "mongoose";

export interface INotification {
  title: string;
  message: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  mobileNumber: string;
  city: string;
  countryCode: string;
  role: "user" | "organiser" | "admin" | undefined;
  notifications: INotification[];
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
});

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
    notifications: { type: [NotificationSchema], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
