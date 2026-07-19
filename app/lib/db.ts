import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connections[0].readyState) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Please set it in your environment variables (Atlas URI for production).");
  }

  await mongoose.connect(process.env.MONGODB_URI);
}
