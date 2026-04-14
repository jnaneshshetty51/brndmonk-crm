"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Calendar, Client } from "@/types";
import { Plus, X, CalendarDays, Film, Image, Layers, Send, ArrowUpRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const inputCls = "w-full px-3 py-2.5 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white";
const labelCls = "block text-xs font-semibold text-[--text-secondary] mb-1.5";

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
    fetch("/api/clients").then((r) => r.json()).then((d) => { if (d.success) setClients(d.data); });
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
              <CalendarDays size={14} className="text-white" />
            </div>
            <h2 className="font-bold text-[--text-primary]">New Content Calendar</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary] transition-colors">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Client *</label>
            <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={inputCls}>
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Month *</label>
              <select required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className={inputCls}>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Year *</label>
              <input required type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Content Targets</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Reels", key: "totalReels", Icon: Film, color: "#6366F1" },
                { label: "Posts", key: "totalPosts", Icon: Image, color: "#06B6D4" },
                { label: "Carousels", key: "totalCarousels", Icon: Layers, color: "#8B5CF6" },
              ].map(({ label, key, Icon, color }) => (
                <div key={key} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1.5">
                    <Icon size={12} style={{ color }} />
                    <span className="text-xs font-semibold text-[--text-secondary]">{label}</span>
                  </div>
                  <input type="number" min="0" value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-[--border] rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              placeholder="Special requirements for this month…"
              className={`${inputCls} resize-none`} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-opacity" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Creating…" : "Create Calendar"}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[--border] text-[--text-secondary] text-sm font-semibold rounded-xl hover:bg-[--bg-app] transition-colors">
              Cancel
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
      <div className="p-4 md:p-6 space-y-5">

        {/* Header toolbar */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[--text-secondary]">Monthly content plans for each client</p>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-opacity hover:opacity-90" style={{ background: "var(--gradient-brand)" }}>
            <Plus size={14} /> New Calendar
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[--border] p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : calendars.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[--border] p-16 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg-app)" }}>
              <CalendarDays size={24} className="text-[--text-tertiary]" strokeWidth={1.25} />
            </div>
            <p className="font-bold text-[--text-secondary] text-sm">No calendars yet</p>
            <p className="text-[--text-tertiary] text-xs mt-1 mb-4">Create your first content calendar to get started</p>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 text-sm font-bold text-white rounded-xl" style={{ background: "var(--gradient-brand)" }}>
              New Calendar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {calendars.map((cal) => (
              <div key={cal.id} className="bg-white rounded-2xl border border-[--border] p-5 hover:shadow-md transition-all duration-200 group" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Month badge */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm" style={{ background: "var(--gradient-brand)" }}>
                      {cal.month.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                        <Link href={`/calendars/${cal.id}`} className="font-bold text-[--text-primary] hover:text-indigo-600 transition-colors text-base leading-tight">
                          {cal.month} {cal.year}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getStatusColor(cal.status)}`}>
                          {getStatusLabel(cal.status)}
                        </span>
                      </div>
                      <p className="text-sm text-[--text-secondary] mb-2">{(cal.client as { name: string })?.name}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-[--text-tertiary] font-medium">
                          <Film size={11} className="text-indigo-400" /> {cal.totalReels} Reels
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[--text-tertiary] font-medium">
                          <Image size={11} className="text-cyan-400" /> {cal.totalPosts} Posts
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[--text-tertiary] font-medium">
                          <Layers size={11} className="text-violet-400" /> {cal.totalCarousels} Carousels
                        </span>
                        <span className="text-xs text-[--text-tertiary]">
                          · {cal._count?.briefs || 0} briefs · {cal._count?.shoots || 0} shoots · {cal._count?.videos || 0} videos
                        </span>
                      </div>
                      {cal.sentToClientAt && (
                        <p className="text-xs text-emerald-500 mt-1.5 font-medium">Sent to client: {formatDate(cal.sentToClientAt)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    {cal.status === "draft" && (
                      <button onClick={() => updateStatus(cal.id, "sent_to_client")}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors">
                        <Send size={11} /> Send to Client
                      </button>
                    )}
                    <Link href={`/calendars/${cal.id}`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors text-white"
                      style={{ background: "var(--gradient-brand)" }}>
                      <ArrowUpRight size={11} /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <CalendarModal onClose={() => setShowModal(false)} onSave={fetchCalendars} />}
    </div>
  );
}
