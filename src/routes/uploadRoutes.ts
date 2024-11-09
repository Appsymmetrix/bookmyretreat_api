import express from "express";
import { uploadController } from "../controllers/uploaderControls";

const router = express.Router();

router.route("/images").post(uploadController.uploadImages);

router.route("/delete-image").delete(uploadController.deleteImage);

export default router;
