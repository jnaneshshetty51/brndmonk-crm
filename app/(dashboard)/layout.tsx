"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import CommandPalette from "@/components/CommandPalette";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cmdOpen, setCmdOpen] = useState(false);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[--bg-app] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 animate-pulse" style={{ background: "var(--gradient-brand)" }}>B</div>
          <p className="text-[--text-tertiary] text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[--bg-app]">
      <Sidebar onOpenSearch={() => setCmdOpen(true)} />
      <main className="flex-1 md:ml-60 min-h-screen overflow-x-hidden pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
