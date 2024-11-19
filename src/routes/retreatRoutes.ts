import express from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  createRetreat,
  deleteRetreat,
  updateRetreat,
  getAllRetreats,
  getRetreatById,
  getRetreatsByOrganizer,
} from "../controllers/retreatControllers";
import { verifyToken, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/add-retreat",
  verifyToken,
  authorizeRole(["admin", "organiser"]),
  asyncHandler(createRetreat)
);

router.put(
  "/update-retreat/:id",
  verifyToken,
  authorizeRole(["admin", "organiser"]),
  asyncHandler(updateRetreat)
);

router.delete(
  "/delete-retreat/:id",
  verifyToken,
  authorizeRole(["admin"]),
  asyncHandler(deleteRetreat)
);

router.get("/get-all-retreats", asyncHandler(getAllRetreats));

router.get("/get-retreats/:id", asyncHandler(getRetreatById));

router.get(
  "/organiser/retreats/:organizerId",
  asyncHandler(getRetreatsByOrganizer)
);

export default router;
