import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";
import {
  organizerValidation,
  userValidation,
  userValidationPartial,
} from "../../utils/validation";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { sendResetEmail, sendVerificationEmail } from "../../utils/store";
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
  const { _id, email, role, name, mobileNumber, city } = user;
  return jwt.sign(
    { id: _id, email, role, name, mobileNumber, city },
    ACCESS_TOKEN_SECRET as string,
    { expiresIn: "1y" }
  );
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { role } = req.body;

  const { error } =
    role === "organiser"
      ? organizerValidation(req.body)
      : userValidation(req.body);
  if (error) return handleError(res, 400, error.details[0].message);

  const {
    name,
    email,
    password,
    mobileNumber,
    city,
    imageUrl,
    organizationName,
    description,
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
    const verificationCode = generateResetCode();
    const verificationCodeExpires = new Date(Date.now() + 60000);
    const newUser = new User({
      name: role === "user" ? name : undefined,
      email,
      password: hashedPassword,
      mobileNumber,
      city: role === "user" ? city : undefined,
      role: role || "user",
      imageUrl: imageUrl || "",
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpires,
      isNewUser: true,
      organization:
        role === "organiser"
          ? { name: organizationName, description, imageUrl }
          : undefined,
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationCode);

    const responseUser: any = {
      id: newUser._id,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
      role: newUser.role,
      isNewUser: newUser.isNewUser,
      ...(newUser.role === "user" && {
        name: newUser.name,
        city: newUser.city,
      }),
      ...(newUser.role === "organiser" && {
        organizationName: newUser.organization?.name,
        description: newUser.organization?.description,
        imageUrl: newUser.organization?.imageUrl,
      }),
    };

    return res.status(201).json({
      message: `${
        role || "User"
      } registered successfully. Check your email to verify your account.`,
      user: responseUser,
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
    const user = await User.findOne({ email });
    if (!user) return handleError(res, 400, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return handleError(res, 400, "Incorrect password");

    if (user.isNewUser) {
      user.isNewUser = false;
      await user.save();
    }

    const token = createJWTToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isNewUser: user.isNewUser,
        ...(user.role === "user" && {
          name: user.name,
          city: user.city,
        }),
        ...(user.role === "organiser" && {
          organizationName: user.organization?.name,
          description: user.organization?.description,
          imageUrl: user.organization?.imageUrl,
        }),
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

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return handleError(res, 400, "User not found");

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    if (user.verificationCode !== verificationCode) {
      return handleError(res, 400, "Invalid verification code");
    }

    if (
      !user.verificationCodeExpires ||
      Date.now() > user.verificationCodeExpires.getTime()
    ) {
      return handleError(res, 400, "Verification code has expired");
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return handleError(res, 400, "User not found");

    if (user.isEmailVerified) {
      return handleError(res, 400, "Email is already verified");
    }

    const verificationCode = generateResetCode();
    const verificationCodeExpires = new Date(Date.now() + 60000); // 1 minute expiration

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    return res.status(200).json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const resendPasswordResetEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return handleError(res, 400, "User not found");

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
      message: "Password reset code sent to your email.",
    });
  } catch (err) {
    console.error(err);
    return handleError(res, 500, "Server error");
  }
};

export const addUserImages = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { imageUrls } = req.body;

    if (
      !Array.isArray(imageUrls) ||
      !imageUrls.every((url) => typeof url === "string")
    ) {
      return res
        .status(400)
        .json({ error: "imageUrls must be an array of strings." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.role !== "user") {
      return res.status(403).json({ error: "Only users can add image URLs." });
    }
    user.imageUrls = user.imageUrls || [];
    user.imageUrls.push(...imageUrls);
    await user.save();

    res.status(200).json({
      message: "Images added successfully.",
      imageUrls: user.imageUrls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};
