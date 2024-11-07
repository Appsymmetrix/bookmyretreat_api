import mongoose, { Schema, Document } from 'mongoose';

interface IPasswordReset extends Document {
  email: string;
  resetCode: string;
  expires: number;
}

const passwordResetSchema = new Schema<IPasswordReset>({
  email: { type: String, required: true, unique: true },
  resetCode: { type: String, required: true },
  expires: { type: Number, required: true },
});

const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema);

export default PasswordReset;
