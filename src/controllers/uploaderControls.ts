import express, { Request, Response } from "express";
import multer, { Multer } from "multer";
import AWS from "aws-sdk";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: "AKIA4MTWMT5NZ5SXUZHY",
  secretAccessKey: "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",
  region: "us-east-1",
});

const storage: multer.StorageEngine = multer.memoryStorage();
const upload: Multer = multer({ storage });

const supportedFormats = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/tiff",
];

const uploadImages = async (req: Request, res: Response): Promise<void> => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }

  const promises = (req.files as Express.Multer.File[]).map(
    (file) =>
      new Promise((resolve, reject) => {
        if (!supportedFormats.includes(file.mimetype)) {
          reject(`Unsupported file format: ${file.mimetype}`);
          return;
        }

        const uniqueFilename = `${uuidv4()}-${Date.now()}.webp`;
        sharp(file.buffer)
          .webp({ quality: 80 })
          .toBuffer()
          .then((buffer) => {
            const uploadParams: AWS.S3.PutObjectRequest = {
              Bucket: req.query.bucketName
                ? `bookmyretreat-v1/${req.query.bucketName}`
                : "bookmyretreat-v1",
              Key: uniqueFilename,
              Body: buffer,
              ContentType: "image/webp",
              ACL: "public-read",
            };

            s3.upload(uploadParams, (error, data) => {
              if (error) {
                console.error("S3 upload error:", error);
                reject("Failed to upload images");
              } else {
                resolve({
                  imageUrl: data.Location,
                });
              }
            });
          })
          .catch((error) => {
            if (error.message.includes("Bitstream not supported")) {
              console.error("Sharp error: Unsupported image format");
              reject("Unsupported image format. Please upload a valid image.");
            } else {
              console.error("Sharp error:", error);
              reject("Failed to compress images");
            }
          });
      })
  );

  try {
    const imageData = await Promise.all(promises);
    res.status(200).json({ images: imageData });
  } catch (error) {
    console.error("Error uploading images:", error);
    if (
      typeof error === "string" &&
      error.startsWith("Unsupported file format")
    ) {
      res.status(400).json({ error });
    } else {
      res.status(500).json({ error });
    }
  }
};

const deleteImage = async (req: Request, res: Response): Promise<void> => {
  const { url } = req.query;

  if (typeof url !== "string") {
    res
      .status(400)
      .json({ error: "Image URL is required and must be a string" });
    return;
  }

  const key = url.split("/").pop();

  const deleteParams: AWS.S3.DeleteObjectRequest = {
    Bucket: "bookmyretreat-v1",
    Key: key as string,
  };

  s3.deleteObject(deleteParams, (error, data) => {
    if (error) {
      console.error("S3 delete error:", error);
      res.status(500).json({ error: "Failed to delete image" });
    } else {
      res.status(200).json({ message: "Image deleted successfully" });
    }
  });
};

export const uploadController = {
  uploadImages: [upload.array("images", 10), uploadImages],
  deleteImage,
};

export default router;
