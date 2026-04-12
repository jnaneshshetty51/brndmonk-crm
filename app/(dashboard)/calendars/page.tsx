"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Calendar, Client } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function CalendarModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    clientId: "",
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    totalReels: "0",
    totalPosts: "0",
    totalCarousels: "0",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => { if (d.success) setClients(d.data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/calendars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">New Content Calendar</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Client *</label>
            <select
              required
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Month *</label>
              <select
                required
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
              >
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Year *</label>
              <input
                required
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Reels", key: "totalReels" },
              { label: "Posts", key: "totalPosts" },
              { label: "Carousels", key: "totalCarousels" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[#2D3142] mb-1.5">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Special requirements for this month..."
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Creating..." : "Create Calendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<(Calendar & { _count?: { briefs: number; shoots: number; videos: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchCalendars = () => {
    fetch("/api/calendars")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCalendars(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCalendars(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/calendars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchCalendars();
  };

  return (
    <div>
      <Topbar title="Content Calendars" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">Manage monthly content plans for each client</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors"
          >
            + New Calendar
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : calendars.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold text-[#2D3142]">No calendars yet</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Create your first content calendar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calendars.map((cal) => (
              <div key={cal.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        href={`/dashboard/calendars/${cal.id}`}
                        className="font-semibold text-[#2D3142] hover:text-[#6B5B95] transition-colors"
                      >
                        {cal.month} {cal.year}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(cal.status)}`}>
                        {getStatusLabel(cal.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280]">{(cal.client as { name: string })?.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#9CA3AF]">
                      <span>🎬 {cal.totalReels} Reels</span>
                      <span>📸 {cal.totalPosts} Posts</span>
                      <span>📑 {cal.totalCarousels} Carousels</span>
                      <span>· {cal._count?.briefs || 0} briefs · {cal._count?.shoots || 0} shoots · {cal._count?.videos || 0} videos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {cal.status === "draft" && (
                      <button
                        onClick={() => updateStatus(cal.id, "sent_to_client")}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Send to Client
                      </button>
                    )}
                    <Link
                      href={`/dashboard/calendars/${cal.id}`}
                      className="text-xs px-3 py-1.5 bg-[#6B5B95]/10 text-[#6B5B95] font-medium rounded-lg hover:bg-[#6B5B95]/20 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                {cal.sentToClientAt && (
                  <p className="text-xs text-[#9CA3AF] mt-2">Sent to client: {formatDate(cal.sentToClientAt)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <CalendarModal onClose={() => setShowModal(false)} onSave={fetchCalendars} />}
    </div>
  );
}
