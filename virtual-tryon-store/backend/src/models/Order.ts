import { supabase } from "../config/supabase";

export interface OrderItem {
  product_id: string;
  size: string;
  qty: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
}

export const OrderModel = {
  async create(order: { user_id: string; items: OrderItem[]; total: number }) {
    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async findByIdAndUser(id: string, userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*))")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },
};
