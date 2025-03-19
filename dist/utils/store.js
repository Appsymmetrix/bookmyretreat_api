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
exports.sendVerificationEmail = exports.sendResetEmail = exports.passwordResetStore = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
exports.passwordResetStore = {};
const sendResetEmail = (email, resetCode) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Source: process.env.EMAIL_USER,
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
        const command = new client_ses_1.SendEmailCommand(params);
        const data = yield sesClient.send(command);
        console.log("Email sent:", data);
    }
    catch (err) {
        console.error("Error sending email:", err);
        throw new Error("Failed to send reset email");
    }
});
exports.sendResetEmail = sendResetEmail;
const sendVerificationEmail = (email, resetCode) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Source: process.env.EMAIL_USER,
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Subject: {
                Data: "Email verifing code",
            },
            Body: {
                Text: {
                    Data: `Your e-mail verifying code is: ${resetCode}`,
                },
            },
        },
    };
    try {
        const command = new client_ses_1.SendEmailCommand(params);
        const data = yield sesClient.send(command);
        console.log("Email sent:", data);
    }
    catch (err) {
        console.error("Error sending email:", err);
        throw new Error("Failed to send reset email");
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
