import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { createContact } from "../controllers/contactControllers";

const router = Router();

router.post("/post-enquiry", asyncHandler(createContact));

export default router;
