"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetCode = exports.forgotPassword = exports.getUserById = exports.updateUser = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const validation_1 = require("../../utils/validation");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const store_1 = require("../../utils/store");
const ResetModal_1 = __importDefault(require("../models/ResetModal"));
const types_1 = require("../../utils/types");
dotenv_1.default.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in the environment variables");
}
if (!ADMIN_SECRET_KEY) {
    throw new Error("ADMIN_SECRET_KEY is not defined in the environment variables");
}
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = (0, validation_1.userValidation)(req.body);
    if (error) {
        return res
            .status(400)
            .json({ success: false, message: error.details[0].message });
    }
    const { name, email, password, mobileNumber, city, countryCode, role, imageUrl, } = req.body;
    try {
        const existingUser = yield User_1.default.findOne({ email });
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
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const newUser = new User_1.default({
            name,
            email,
            password: hashedPassword,
            mobileNumber,
            city,
            countryCode,
            role: role || "user",
            imageUrl: imageUrl || "",
        });
        yield newUser.save();
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            mobileNumber: user.mobileNumber,
            city: user.city,
            countryCode: user.countryCode,
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5h" });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.loginUser = loginUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const updates = req.body;
    const { error } = (0, validation_1.userValidationPartial)(updates);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    try {
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "User not found" });
        }
        if (updates.imageUrl) {
            user.imageUrl = updates.imageUrl;
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: {
                id: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id,
                name: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.name,
                email: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email,
                mobileNumber: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.mobileNumber,
                city: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.city,
                countryCode: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.countryCode,
                role: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.role,
                imageUrl: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.imageUrl,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.updateUser = updateUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID missing",
        });
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid User ID",
        });
    }
    try {
        const user = yield User_1.default.findById(userId);
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
                imageUrl: user === null || user === void 0 ? void 0 : user.imageUrl,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getUserById = getUserById;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Email not found" });
        }
        const resetCode = (0, types_1.generateResetCode)();
        const expires = Date.now() + 3600000;
        yield ResetModal_1.default.updateOne({ email }, { email, resetCode, expires }, { upsert: true });
        yield (0, store_1.sendResetEmail)(email, resetCode);
        return res.status(200).json({
            success: true,
            message: "Password reset code sent to your email",
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.forgotPassword = forgotPassword;
const verifyResetCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, resetCode } = req.body;
    try {
        const resetData = yield ResetModal_1.default.findOne({ email });
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.verifyResetCode = verifyResetCode;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "User not found" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        yield ResetModal_1.default.deleteOne({ email });
        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.resetPassword = resetPassword;
