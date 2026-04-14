"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Permissions } from "@/lib/permissions";
import { can as canCheck } from "@/lib/permissions";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Permissions | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  can: (section: string, action: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Module-level cache — runs once per session, not on every navigation
let cachedUser: User | null | undefined = undefined;
let fetchPromise: Promise<User | null> | null = null;

function fetchCurrentUser(): Promise<User | null> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("/api/auth/me", { credentials: "include" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      const u = data?.success ? (data.data as User) : null;
      cachedUser = u;
      return u;
    })
    .catch(() => { cachedUser = null; return null; })
    .finally(() => { fetchPromise = null; });
  return fetchPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser ?? null);
  const [loading, setLoading] = useState(cachedUser === undefined);
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (cachedUser !== undefined) { return; }
    fetchCurrentUser().then((u) => { setUser(u); setLoading(false); });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    // Fetch full user with permissions after login
    cachedUser = undefined;
    const full = await fetchCurrentUser();
    setUser(full);
    router.push("/dashboard");
  };

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    cachedUser = null;
    setUser(null);
    router.push("/login");
  };

  const can = (section: string, action: string): boolean => {
    if (!user?.permissions) return user?.role === "admin";
    return canCheck(user.permissions, section as Parameters<typeof canCheck>[1], action);
  };

  return (
    <AuthContext.Provider value={{ user, loading, can, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
