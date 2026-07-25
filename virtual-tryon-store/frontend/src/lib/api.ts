const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ token: string; user: { id: string; name: string; email: string } }>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: { id: string; name: string; email: string } }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  },

  products: {
    list: (params?: { category?: string; brand?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.brand) query.set("brand", params.brand);
      if (params?.search) query.set("search", params.search);
      const qs = query.toString();
      return request<any[]>(`/api/products${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<any>(`/api/products/${id}`),
    create: (data: any, token: string) =>
      request<any>("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        token,
      }),
  },

  orders: {
    create: (items: { productId: string; size: string; qty: number }[], token: string) =>
      request<any>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
        token,
      }),
    me: (token: string) => request<any[]>("/api/orders/me", { token }),
  },

  tryon: {
    generateAvatar: async (files: { front: File; back: File; left: File; right: File }, token: string) => {
      const form = new FormData();
      form.append("front", files.front);
      form.append("back", files.back);
      form.append("left", files.left);
      form.append("right", files.right);

      const res = await fetch(`${API_BASE}/api/tryon/generate-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error("Avatar generation failed");
      return res.json();
    },

    fitGarment: (avatarUrl: string, garmentModelUrl: string, token: string) =>
      request<{ combinedModelUrl: string }>("/api/tryon/fit-garment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl, garmentModelUrl }),
        token,
      }),
  },
};

export const API_URL = API_BASE;

export type Product = {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  images: string[];
  garmentModelUrl: string;
  sizes: string[];
  category?: string;
};

export async function getProducts(): Promise<Product[]> {
  return api.products.list();
}

export async function getProductById(id: string): Promise<Product> {
  return api.products.get(id);
}
