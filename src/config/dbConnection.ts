import mongoose from "mongoose";

export const connectDb = async () => {
    try {
      const connectionString = process.env.CONNECTION_STRING;
      if (!connectionString) {
        throw new Error("Database connection string is not defined in environment variables.");
      }
      const connect = await mongoose.connect(connectionString);
      console.log("Database connected");
    } catch (err) {
      process.exit(1);
    }
};
