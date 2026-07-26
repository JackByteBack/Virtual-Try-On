"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { insforge } from "@/lib/insforge";

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const { data } = await insforge.auth.getCurrentUser();
      if (data.user) {
        setUser({
          id: data.user.id,
          name: (data.user as Record<string, unknown>).profile && typeof (data.user as Record<string, unknown>).profile === 'object'
            ? ((data.user as Record<string, unknown>).profile as Record<string, string>).name || ""
            : "",
          email: data.user.email || "",
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.accessToken) accessToken = data.accessToken;
    await refreshUser();
  }

  async function register(name: string, email: string, password: string) {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    });
    if (error) throw error;
    if (data?.accessToken) {
      accessToken = data.accessToken;
      await refreshUser();
    }
  }

  async function verifyEmail(email: string, otp: string) {
    const { data, error } = await insforge.auth.verifyEmail({ email, otp });
    if (error) throw error;
    if (data?.accessToken) {
      accessToken = data.accessToken;
      await refreshUser();
    }
  }

  async function resendVerification(email: string) {
    const { error } = await insforge.auth.resendVerificationEmail({ email });
    if (error) throw error;
  }

  async function logout() {
    await insforge.auth.signOut();
    accessToken = null;
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, resendVerification, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
