import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productRoutes from "./routes/products.routes";
import tryonRoutes from "./routes/tryon.routes";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/orders.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tryon", tryonRoutes);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tryon";

const PORT = parseInt(process.env.PORT || "5001");

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
}).catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
