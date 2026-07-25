import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  brand: String,
  price: { type: Number, required: true },
  images: [String],
  garmentModelUrl: String,
  sizes: [String],
  category: String,
}, { timestamps: true });

export default model("Product", productSchema);
