import { Router } from "express";
import { OrderModel } from "../models/Order";
import { ProductModel } from "../models/Product";
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
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      total += product.price * item.qty;
    }

    const order = await OrderModel.create({
      user_id: req.userId!,
      items: items.map((item: any) => ({
        product_id: item.productId,
        size: item.size,
        qty: item.qty,
      })),
      total,
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const orders = await OrderModel.findByUserId(req.userId!);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const order = await OrderModel.findByIdAndUser(req.params.id, req.userId!);
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
