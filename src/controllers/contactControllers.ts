import { Request, Response } from "express";
import Contact from "../models/Contact";
import { contactValidationSchema } from "../../utils/validation";

export const createContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { error } = contactValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  try {
    const contact = new Contact(req.body);
    await contact.save();
    return res.status(201).json({
      success: true,
      contact,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
