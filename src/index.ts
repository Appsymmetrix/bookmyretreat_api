import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDb } from "./config/dbConnection";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",authRoutes); 

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
