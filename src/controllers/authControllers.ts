import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
import { userValidation, userValidationPartial } from "../../utils/validation";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { sendResetEmail } from "../../utils/store";
import PasswordReset from "../models/ResetModal";
import { generateResetCode } from "../../utils/types";

dotenv.config();

const { ACCESS_TOKEN_SECRET, ADMIN_SECRET_KEY } = process.env;

if (!ACCESS_TOKEN_SECRET || !ADMIN_SECRET_KEY) {
  throw new Error("Environment variables are missing");
}

const handleError = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).json({ success: false, message });
};

const createJWTToken = (user: IUser) => {
  const { _id, email, role, name, mobileNumber, city, countryCode } = user;
  return jwt.sign(
    { id: _id, email, role, name, mobileNumber, city, countryCode },
    ACCESS_TOKEN_SECRET as string,
    { expiresIn: "1h" }
  );
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { error } = userValidation(req.body);
  if (error) return handleError(res, 400, error.details[0].message);

  const {
    name,
    email,
    password,
    mobileNumber,
    city,
    countryCode,
    role,
    imageUrl,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return handleError(res, 400, "Email is already registered");

    if (
      role === "admin" &&
      req.headers["x-admin-secret"] !== ADMIN_SECRET_KEY
    ) {
      return handleError(res, 403, "Invalid admin secret");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      city,
      countryCode,
      role: role || "user",
      imageUrl: imageUrl || "",
      isEmailVerified: false,
    });

    await newUser.save();

    return res.status(201).json({
      message: `${role || "user"} registered successfully.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        city: newUser.city,
        countryCode: newUser.countryCode,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).lean<IUser>();
    if (!user) return handleError(res, 400, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return handleError(res, 400, "Incorrect password");

    const token = createJWTToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        city: user.city,
        countryCode: user.countryCode,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const updates: Partial<IUser> = req.body;

  const { error } = userValidationPartial(updates);
  if (error) return handleError(res, 400, error.details[0].message);

  try {
    const user = await User.findById(userId);
    if (!user) return handleError(res, 400, "User not found");

    if (updates.imageUrl) user.imageUrl = updates.imageUrl;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return handleError(res, 400, "Invalid User ID");
  }

  try {
    const user = await User.findById(userId);
    if (!user) return handleError(res, 404, "User not found");

    return res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return handleError(res, 400, "Email not found");

    const resetCode = generateResetCode();
    const expires = Date.now() + 3600000;

    await PasswordReset.updateOne(
      { email },
      { email, resetCode, expires },
      { upsert: true }
    );

    await sendResetEmail(email, resetCode);

    return res.status(200).json({
      success: true,
      message: "Password reset code sent to your email",
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const verifyResetCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, resetCode } = req.body;

  try {
    const resetData = await PasswordReset.findOne({ email });
    if (!resetData) return handleError(res, 400, "Reset code not found");

    if (resetCode !== resetData.resetCode)
      return handleError(res, 400, "Invalid reset code");

    if (Date.now() > resetData.expires)
      return handleError(res, 400, "Reset code has expired");

    return res.status(200).json({
      success: true,
      message: "Reset code verified successfully",
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return handleError(res, 400, "User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await PasswordReset.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};
