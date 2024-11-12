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

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET is not defined in the environment variables"
  );
}

if (!ADMIN_SECRET_KEY) {
  throw new Error(
    "ADMIN_SECRET_KEY is not defined in the environment variables"
  );
}

export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { error } = userValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

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
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already registered" });
    }

    if (role === "admin") {
      const secretKey = req.headers["x-admin-secret"];
      if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Invalid admin secret key",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      city,
      countryCode,
      role: role || "user",
      imageUrl: imageUrl || "",
    });

    await newUser.save();

    return res.status(201).json({
      message: `${role || "user"} registered successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        city: newUser.city,
        countryCode: newUser.countryCode,
        role: newUser.role,
        imageUrl: newUser.imageUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        mobileNumber: user.mobileNumber,
        city: user.city,
        countryCode: user.countryCode,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "5h" }
    );

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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId } = req.params;
  const updates: Partial<IUser> = req.body;

  const { error } = userValidationPartial(updates);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (updates.imageUrl) {
      user.imageUrl = updates.imageUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        mobileNumber: updatedUser?.mobileNumber,
        city: updatedUser?.city,
        countryCode: updatedUser?.countryCode,
        role: updatedUser?.role,
        imageUrl: updatedUser?.imageUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID missing",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid User ID",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        city: user.city,
        countryCode: user.countryCode,
        role: user.role,
        imageUrl: user?.imageUrl,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Email not found" });
    }

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
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyResetCode = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { email, resetCode } = req.body;

  try {
    const resetData = await PasswordReset.findOne({ email });
    if (!resetData) {
      return res
        .status(400)
        .json({ success: false, message: "Reset code not found" });
    }

    if (resetCode !== resetData.resetCode) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reset code" });
    }

    if (Date.now() > resetData.expires) {
      return res
        .status(400)
        .json({ success: false, message: "Reset code has expired" });
    }

    return res.status(200).json({
      success: true,
      message: "Reset code verified successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

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
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
