import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/dbConnection";
import authRoutes from "./routes/authRoutes";
import retreatRoutes from "./routes/retreatRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import { errorHandler } from "./middleware/errorHandler";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import uploadRoutes from "./routes/uploadRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());

app.use(express.json());

app.use(errorHandler);

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/retreats", retreatRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/subscribtion", subscriptionRoutes);
app.use("/api/upload", uploadRoutes);

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();
