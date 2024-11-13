import { Router } from "express";
import authRoutes from "./authRoutes";
import retreatRoutes from "./retreatRoutes";
import categoryRoutes from "./categoryRoutes";
import reviewRoutes from "./reviewRoutes";
import wishlistRoutes from "./wishlistRoutes";
import bookingRoutes from "./bookingRoutes";
import subscriptionRoutes from "./subscriptionRoutes";
import notificationRoutes from "./notificationRoutes";
import uploadRoutes from "./uploadRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/category", categoryRoutes);
router.use("/retreats", retreatRoutes);
router.use("/wishlists", wishlistRoutes);
router.use("/notification", notificationRoutes);
router.use("/review", reviewRoutes);
router.use("/booking", bookingRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/upload", uploadRoutes);

export default router;
