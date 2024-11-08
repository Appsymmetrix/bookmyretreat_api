import { Request, Response } from "express";
import Subscription from "../models/Subscription";
import { subscriptionValidator } from "../../utils/validation";

export const subscribeRetreat = async (req: Request, res: Response) => {
  try {
    const { error } = subscriptionValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingSubscription = await Subscription.findOne({
      email: req.body.email,
    });
    if (existingSubscription) {
      return res
        .status(400)
        .json({ message: "This email is already subscribed." });
    }

    const newSubscription = new Subscription({
      email: req.body.email,
    });

    await newSubscription.save();

    res.status(201).json({
      message: "Subscription successful!",
      email: newSubscription.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while subscribing." });
  }
};
