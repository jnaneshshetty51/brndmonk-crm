"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "admin" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
    });
    const data = await res.json();
    if (!data.success) { setError(data.error); setLoading(false); return; }
    router.push("/dashboard");
  };

  const inputClass = "w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#2D3142] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95] transition-colors";

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#6B5B95] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">B</div>
          <h1 className="text-2xl font-bold text-[#2D3142]">Create Account</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Set up your Brndmonk CRM workspace</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-2">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-2">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@agency.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-2">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
                <option value="admin">Admin</option>
                <option value="social_team">Social Media Team</option>
                <option value="dev_team">Dev Team</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-2">Password</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-2">Confirm Password</label>
              <input required type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inputClass} placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#6B5B95] text-white font-semibold rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors text-sm mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#9CA3AF] mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#6B5B95] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
