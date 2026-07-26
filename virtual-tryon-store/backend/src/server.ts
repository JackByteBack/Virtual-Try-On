import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabase";
import productRoutes from "./routes/products.routes";
import tryonRoutes from "./routes/tryon.routes";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/orders.routes";
import scrapeRoutes from "./routes/scrape.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tryon", tryonRoutes);
app.use("/api/scrape", scrapeRoutes);

const PORT = parseInt(process.env.PORT || "5001");

async function start() {
  const { error } = await supabase.from("users").select("id").limit(1);
  if (error && error.code === "42P01") {
    console.log("Note: Tables not yet created. Please run the SQL migrations in Supabase dashboard.");
  } else if (error) {
    console.error("Supabase connection error:", error.message);
  } else {
    console.log("Connected to Supabase");
  }
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
}

start();
