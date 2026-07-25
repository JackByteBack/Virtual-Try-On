import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const user = await UserModel.create({
      name,
      email,
      password_hash: await bcrypt.hash(password, 10),
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name, email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await UserModel.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
