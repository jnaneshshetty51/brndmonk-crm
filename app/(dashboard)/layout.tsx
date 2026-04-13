"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[--bg-app] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[--brand-primary] flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 animate-pulse">B</div>
          <p className="text-[--text-tertiary] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[--bg-app]">
      <Sidebar />
      <main className="flex-1 md:ml-60 min-h-screen overflow-x-hidden pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
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
