import { Router } from "express";
import { ProductModel } from "../models/Product";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, brand, search } = req.query;
    const products = await ProductModel.find({
      category: category as string,
      brand: brand as string,
      search: search as string,
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const product = await ProductModel.create(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const product = await ProductModel.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await ProductModel.delete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
