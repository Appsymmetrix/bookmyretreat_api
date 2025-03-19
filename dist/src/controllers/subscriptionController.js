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
exports.subscribeRetreat = void 0;
const Subscription_1 = __importDefault(require("../models/Subscription"));
const validation_1 = require("../../utils/validation");
const subscribeRetreat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const { error } = validation_1.subscriptionValidator.validate(req.body);
    if (error) {
        return res
            .status(400)
            .json({ message: `Validation Error: ${error.details[0].message}` });
    }
    try {
        const existingSubscription = yield Subscription_1.default.findOne({ email }).lean();
        if (existingSubscription) {
            return res.status(400).json({
                message: "This email is already subscribed. Please use a different email.",
            });
        }
        const newSubscription = new Subscription_1.default({ email });
        yield newSubscription.save();
        res.status(201).json({
            message: "Subscription successful!",
            subscription: { email: newSubscription.email },
        });
    }
    catch (err) {
        console.error("Error occurred during subscription:", err);
        res.status(500).json({
            message: "An error occurred while subscribing. Please try again later.",
        });
    }
});
exports.subscribeRetreat = subscribeRetreat;
