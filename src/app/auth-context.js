"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAccount, deleteSession } from "@/lib/appwrite-auth";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const u = await getAccount();
    setUser(u);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function logout() {
    await deleteSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login: refresh, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
