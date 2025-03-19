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
exports.addUserImages = exports.resendPasswordResetEmail = exports.resendVerificationEmail = exports.verifyEmail = exports.resetPassword = exports.verifyResetCode = exports.forgotPassword = exports.getUserById = exports.updateUser = exports.loginUser = exports.registerUser = void 0;
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
const { ACCESS_TOKEN_SECRET, ADMIN_SECRET_KEY } = process.env;
if (!ACCESS_TOKEN_SECRET || !ADMIN_SECRET_KEY) {
    throw new Error("Environment variables are missing");
}
const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({ success: false, message });
};
const createJWTToken = (user) => {
    const { _id, email, role, name, mobileNumber, city } = user;
    return jsonwebtoken_1.default.sign({ id: _id, email, role, name, mobileNumber, city }, ACCESS_TOKEN_SECRET, { expiresIn: "1y" });
};
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { role } = req.body;
    const { error } = role === "organiser"
        ? (0, validation_1.organizerValidation)(req.body)
        : (0, validation_1.userValidation)(req.body);
    if (error)
        return handleError(res, 400, error.details[0].message);
    const { name, email, password, mobileNumber, city, imageUrl, organizationName, description, } = req.body;
    try {
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser)
            return handleError(res, 400, "Email is already registered");
        if (role === "admin" &&
            req.headers["x-admin-secret"] !== ADMIN_SECRET_KEY) {
            return handleError(res, 403, "Invalid admin secret");
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const verificationCode = (0, types_1.generateResetCode)();
        const verificationCodeExpires = new Date(Date.now() + 60000);
        const newUser = new User_1.default({
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
            organization: role === "organiser"
                ? { name: organizationName, description, imageUrl }
                : undefined,
        });
        yield newUser.save();
        yield (0, store_1.sendVerificationEmail)(email, verificationCode);
        const responseUser = Object.assign(Object.assign({ id: newUser._id, email: newUser.email, mobileNumber: newUser.mobileNumber, role: newUser.role, isNewUser: newUser.isNewUser }, (newUser.role === "user" && {
            name: newUser.name,
            city: newUser.city,
        })), (newUser.role === "organiser" && {
            organizationName: (_a = newUser.organization) === null || _a === void 0 ? void 0 : _a.name,
            description: (_b = newUser.organization) === null || _b === void 0 ? void 0 : _b.description,
            imageUrl: (_c = newUser.organization) === null || _c === void 0 ? void 0 : _c.imageUrl,
        }));
        return res.status(201).json({
            message: `${role || "User"} registered successfully. Check your email to verify your account.`,
            user: responseUser,
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return handleError(res, 400, "User not found");
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return handleError(res, 400, "Incorrect password");
        if (user.isNewUser) {
            user.isNewUser = false;
            yield user.save();
        }
        const token = createJWTToken(user);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: Object.assign(Object.assign({ id: user._id, email: user.email, mobileNumber: user.mobileNumber, role: user.role, isNewUser: user.isNewUser }, (user.role === "user" && {
                name: user.name,
                city: user.city,
            })), (user.role === "organiser" && {
                organizationName: (_a = user.organization) === null || _a === void 0 ? void 0 : _a.name,
                description: (_b = user.organization) === null || _b === void 0 ? void 0 : _b.description,
                imageUrl: (_c = user.organization) === null || _c === void 0 ? void 0 : _c.imageUrl,
            })),
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.loginUser = loginUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const updates = req.body;
    const { error } = (0, validation_1.userValidationPartial)(updates);
    if (error)
        return handleError(res, 400, error.details[0].message);
    try {
        const user = yield User_1.default.findById(userId);
        if (!user)
            return handleError(res, 400, "User not found");
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.updateUser = updateUser;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return handleError(res, 400, "Invalid User ID");
    }
    try {
        const user = yield User_1.default.findById(userId);
        if (!user)
            return handleError(res, 404, "User not found");
        return res.status(200).json({
            success: true,
            message: "User found",
            user,
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.getUserById = getUserById;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return handleError(res, 400, "Email not found");
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
        return handleError(res, 500, "Server error");
    }
});
exports.forgotPassword = forgotPassword;
const verifyResetCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, resetCode } = req.body;
    try {
        const resetData = yield ResetModal_1.default.findOne({ email });
        if (!resetData)
            return handleError(res, 400, "Reset code not found");
        if (resetCode !== resetData.resetCode)
            return handleError(res, 400, "Invalid reset code");
        if (Date.now() > resetData.expires)
            return handleError(res, 400, "Reset code has expired");
        return res.status(200).json({
            success: true,
            message: "Reset code verified successfully",
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.verifyResetCode = verifyResetCode;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return handleError(res, 400, "User not found");
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
        return handleError(res, 500, "Server error");
    }
});
exports.resetPassword = resetPassword;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, verificationCode } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return handleError(res, 400, "User not found");
        if (user.isEmailVerified) {
            return res
                .status(400)
                .json({ success: false, message: "Email already verified" });
        }
        if (user.verificationCode !== verificationCode) {
            return handleError(res, 400, "Invalid verification code");
        }
        if (!user.verificationCodeExpires ||
            Date.now() > user.verificationCodeExpires.getTime()) {
            return handleError(res, 400, "Verification code has expired");
        }
        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.verifyEmail = verifyEmail;
const resendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return handleError(res, 400, "User not found");
        if (user.isEmailVerified) {
            return handleError(res, 400, "Email is already verified");
        }
        const verificationCode = (0, types_1.generateResetCode)();
        const verificationCodeExpires = new Date(Date.now() + 60000); // 1 minute expiration
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        yield user.save();
        yield (0, store_1.sendVerificationEmail)(email, verificationCode);
        return res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox.",
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
const resendPasswordResetEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return handleError(res, 400, "User not found");
        const resetCode = (0, types_1.generateResetCode)();
        const expires = Date.now() + 3600000;
        yield ResetModal_1.default.updateOne({ email }, { email, resetCode, expires }, { upsert: true });
        yield (0, store_1.sendResetEmail)(email, resetCode);
        return res.status(200).json({
            success: true,
            message: "Password reset code sent to your email.",
        });
    }
    catch (err) {
        console.error(err);
        return handleError(res, 500, "Server error");
    }
});
exports.resendPasswordResetEmail = resendPasswordResetEmail;
const addUserImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const { imageUrls } = req.body;
        if (!Array.isArray(imageUrls) ||
            !imageUrls.every((url) => typeof url === "string")) {
            return res
                .status(400)
                .json({ error: "imageUrls must be an array of strings." });
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        if (user.role !== "user") {
            return res.status(403).json({ error: "Only users can add image URLs." });
        }
        user.imageUrls = user.imageUrls || [];
        user.imageUrls.push(...imageUrls);
        yield user.save();
        res.status(200).json({
            message: "Images added successfully.",
            imageUrls: user.imageUrls,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.addUserImages = addUserImages;
