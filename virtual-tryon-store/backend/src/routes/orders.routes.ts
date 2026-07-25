import { Router } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: "Items are required" });
    }

    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      total += product.price * item.qty;
    }

    const order = await Order.create({
      userId: req.userId,
      items,
      total,
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId })
      .populate("items.productId");
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
