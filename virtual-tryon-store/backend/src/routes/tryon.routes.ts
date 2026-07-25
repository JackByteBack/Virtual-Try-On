import { Router } from "express";
import axios from "axios";
import FormData from "form-data";
import upload from "../middleware/upload";

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

router.post(
  "/generate-avatar",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "left", maxCount: 1 },
    { name: "right", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      if (!files.front || !files.back || !files.left || !files.right) {
        return res.status(400).json({ error: "All 4 views (front, back, left, right) are required" });
      }

      const form = new FormData();
      for (const key of ["front", "back", "left", "right"]) {
        form.append(key, files[key][0].buffer, { filename: `${key}.jpg`, contentType: "image/jpeg" });
      }

      const aiRes = await axios.post(`${AI_SERVICE_URL}/generate-avatar`, form, {
        headers: form.getHeaders(),
        timeout: 300000,
      });

      res.json(aiRes.data);
    } catch (err: any) {
      console.error("Avatar generation error:", err.message);
      res.status(500).json({ error: "Avatar generation failed" });
    }
  }
);

router.post("/fit-garment", async (req, res) => {
  try {
    const { avatarUrl, garmentModelUrl } = req.body;
    if (!avatarUrl || !garmentModelUrl) {
      return res.status(400).json({ error: "avatarUrl and garmentModelUrl are required" });
    }

    const aiRes = await axios.post(`${AI_SERVICE_URL}/fit-garment`, {
      avatarUrl,
      garmentUrl: garmentModelUrl,
    }, { timeout: 300000 });

    res.json(aiRes.data);
  } catch (err: any) {
    console.error("Garment fitting error:", err.message);
    res.status(500).json({ error: "Garment fitting failed" });
  }
});

export default router;
