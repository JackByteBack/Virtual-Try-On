import { supabase } from "../config/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const UserModel = {
  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data as User | null;
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as User;
  },

  async create(user: { name: string; email: string; password_hash: string }) {
    const { data, error } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },
};
