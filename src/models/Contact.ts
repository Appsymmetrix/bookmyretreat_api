import mongoose, { Schema, Document } from "mongoose";

interface IContact extends Document {
  name: string;
  mobileNumber: string;
  category: string;
}

const ContactSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
