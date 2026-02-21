"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAccount, getPrefs, deleteSession, syncSessionCookieIfNeeded } from "@/lib/appwrite-auth";

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
    try {
      const u = await getAccount();
      if (u) {
        await syncSessionCookieIfNeeded();
        try {
          const prefs = await getPrefs();
          setUser({ ...u, prefs: prefs && typeof prefs === "object" ? prefs : {} });
        } catch {
          setUser(u);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
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
