"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Module-level cache so auth check doesn't re-run on client-side navigation
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
    if (cachedUser !== undefined) { setUser(cachedUser); setLoading(false); return; }
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
    cachedUser = data.data.user;
    setUser(data.data.user);
    router.push("/dashboard");
  };

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    cachedUser = null;
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
