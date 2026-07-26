import { insforge } from "@/lib/insforge";

export type Product = {
  id: string;
  name: string;
  brand?: string;
  price: number;
  images: string[];
  garment_model_url: string;
  sizes: string[];
  category?: string;
};

let accessToken: string | null = null;

export const api = {
  auth: {
    register: async (data: { name: string; email: string; password: string }) => {
      const { data: authData, error } = await insforge.auth.signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      if (error) throw error;
      if (authData?.accessToken) accessToken = authData.accessToken;
      return authData;
    },
    login: async (data: { email: string; password: string }) => {
      const { data: authData, error } = await insforge.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      if (authData?.accessToken) accessToken = authData.accessToken;
      return authData;
    },
    getAccessToken: () => accessToken,
  },

  products: {
    list: async (params?: { category?: string; brand?: string; search?: string }) => {
      let query = insforge.database.from("products").select("*");
      if (params?.category) query = query.eq("category", params.category);
      if (params?.brand) query = query.eq("brand", params.brand);
      if (params?.search) query = query.ilike("name", `%${params.search}%`);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    get: async (id: string) => {
      const { data, error } = await insforge.database
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Product;
    },
    create: async (product: Omit<Product, "id">) => {
      const { data, error } = await insforge.database
        .from("products")
        .insert([product])
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
  },

  orders: {
    create: async (items: { productId: string; size: string; qty: number }[]) => {
      const { data } = await insforge.auth.getCurrentUser();
      if (!data.user) throw new Error("Not authenticated");

      let total = 0;
      for (const item of items) {
        const { data: product } = await insforge.database
          .from("products")
          .select("price")
          .eq("id", item.productId)
          .single();
        if (product) total += product.price * item.qty;
      }

      const { data: order, error } = await insforge.database
        .from("orders")
        .insert([{
          user_id: data.user.id,
          items,
          total,
        }])
        .select()
        .single();
      if (error) throw error;
      return order;
    },
    me: async () => {
      const { data } = await insforge.auth.getCurrentUser();
      if (!data.user) throw new Error("Not authenticated");

      const { data: orders, error } = await insforge.database
        .from("orders")
        .select("*, items:order_items(*, product:products(*))")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return orders;
    },
  },

  tryon: {
    generateAvatar: async (files: { front: File; back: File; left: File; right: File }) => {
      const form = new FormData();
      form.append("front", files.front);
      form.append("back", files.back);
      form.append("left", files.left);
      form.append("right", files.right);

      if (!accessToken) throw new Error("Not authenticated");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tryon/generate-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });

      if (!res.ok) throw new Error("Avatar generation failed");
      return res.json();
    },

    fitGarment: async (avatarUrl: string, garmentModelUrl: string) => {
      if (!accessToken) throw new Error("Not authenticated");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tryon/fit-garment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ avatarUrl, garmentModelUrl }),
      });

      if (!res.ok) throw new Error("Garment fitting failed");
      return res.json();
    },
  },
};
