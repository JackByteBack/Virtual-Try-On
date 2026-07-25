import axios from "axios";
import FormData from "form-data";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function generateAvatar(images: Record<string, Buffer>) {
  const form = new FormData();
  for (const [key, buffer] of Object.entries(images)) {
    form.append(key, buffer, { filename: `${key}.jpg`, contentType: "image/jpeg" });
  }

  const res = await axios.post(`${AI_SERVICE_URL}/generate-avatar`, form, {
    headers: form.getHeaders(),
    timeout: 300000,
  });

  return res.data;
}

export async function fitGarment(avatarUrl: string, garmentUrl: string) {
  const res = await axios.post(`${AI_SERVICE_URL}/fit-garment`, {
    avatarUrl,
    garmentUrl,
  }, { timeout: 300000 });

  return res.data;
}
