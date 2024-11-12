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
exports.sendResetEmail = exports.passwordResetStore = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const ses = new aws_sdk_1.default.SES();
exports.passwordResetStore = {};
const sendResetEmail = (email, resetCode) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Source: process.env.EMAIL_USER, // Ensure this email is verified in SES
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Subject: {
                Data: "Password Reset Code",
            },
            Body: {
                Text: {
                    Data: `Your password reset code is: ${resetCode}`,
                },
            },
        },
    };
    try {
        const data = yield ses.sendEmail(params).promise();
        console.log("Email sent:", data);
    }
    catch (err) {
        console.error("Error sending email:", err);
        throw new Error("Failed to send reset email");
    }
});
exports.sendResetEmail = sendResetEmail;
