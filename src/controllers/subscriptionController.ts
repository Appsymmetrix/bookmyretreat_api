import { Request, Response } from "express";
import Subscription from "../models/Subscription";
import { subscriptionValidator } from "../../utils/validation";

export const subscribeRetreat = async (req: Request, res: Response) => {
  const { email } = req.body;

  const { error } = subscriptionValidator.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: `Validation Error: ${error.details[0].message}` });
  }

  try {
    const existingSubscription = await Subscription.findOne({ email }).lean();
    if (existingSubscription) {
      return res.status(400).json({
        message:
          "This email is already subscribed. Please use a different email.",
      });
    }

    const newSubscription = new Subscription({ email });
    await newSubscription.save();

    res.status(201).json({
      message: "Subscription successful!",
      subscription: { email: newSubscription.email },
    });
  } catch (err) {
    console.error("Error occurred during subscription:", err);
    res.status(500).json({
      message: "An error occurred while subscribing. Please try again later.",
    });
  }
};
