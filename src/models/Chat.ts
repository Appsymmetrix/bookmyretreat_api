import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  sentBy: "user" | "organiser";
  msg: string;
  createTime: Date;
}

export interface IChat extends Document {
  retreatId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
}

const MessageSchema: Schema = new Schema({
  sentBy: { type: String, enum: ["user", "organiser"], required: true },
  msg: { type: String, required: true },
  createTime: { type: Date, default: Date.now },
});

const ChatSchema: Schema = new Schema({
  retreatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retreat",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [MessageSchema],
});

const Chat = mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
