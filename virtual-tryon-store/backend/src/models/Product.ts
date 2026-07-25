import { supabase } from "../config/supabase";

export interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  images: string[];
  garment_model_url?: string;
  sizes: string[];
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilter {
  category?: string;
  brand?: string;
  search?: string;
}

export const ProductModel = {
  async find(filter: ProductFilter = {}) {
    let query = supabase.from("products").select("*");
    if (filter.category) query = query.eq("category", filter.category);
    if (filter.brand) query = query.eq("brand", filter.brand);
    if (filter.search) query = query.ilike("name", `%${filter.search}%`);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data as Product[];
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data as Product | null;
  },

  async create(product: Omit<Product, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async update(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async delete(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};
