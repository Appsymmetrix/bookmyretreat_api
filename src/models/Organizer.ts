import mongoose, { Schema, Document } from "mongoose";

interface IOrganizer extends Document {
  name: string;
  contact: string;
}

const OrganizerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
  },
  { timestamps: true }
);

const Organizer = mongoose.model<IOrganizer>("Organizer", OrganizerSchema);
export default Organizer;
