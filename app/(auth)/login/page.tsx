"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthProvider } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#6B5B95] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-[#2D3142]">Brndmonk CRM</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Sign in to your workspace</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@agency.com"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#2D3142] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#2D3142] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6B5B95] text-white font-semibold rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
