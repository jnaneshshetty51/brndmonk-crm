"use client";
import { useEffect, useState, useCallback } from "react";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Client, ServiceSubscription } from "@/types";
import { Search, Plus, Download, X, Users } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400";
const labelCls = "block text-xs font-semibold text-[--text-secondary] mb-1.5";

function ClientModal({ client, onClose, onSave }: { client?: Client | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: client?.name || "", email: client?.email || "", phone: client?.phone || "",
    contactPerson: client?.contactPerson || "", timezone: client?.timezone || "",
    status: client?.status || "active", services: client?.services || [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch(client ? `/api/clients/${client.id}` : "/api/clients", {
      method: client ? "PUT" : "POST",
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
          <h2 className="font-bold text-[--text-primary]">{client ? "Edit Client" : "New Client"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary]"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Company name" /></div>
            <div><label className={labelCls}>Email *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="client@company.com" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+91 98765 43210" /></div>
            <div><label className={labelCls}>Contact Person</label><input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className={inputCls} placeholder="John Doe" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "paused" | "archived" })} className={inputCls}>
                <option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option>
              </select>
            </div>
            <div><label className={labelCls}>Timezone</label><input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className={inputCls} placeholder="Asia/Kolkata" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[--border] text-[--text-secondary] text-sm font-semibold rounded-xl hover:bg-[--bg-app]">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl disabled:opacity-50" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Saving…" : client ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function exportCSV(clients: Client[]) {
  const serviceLabels: Record<string, string> = { social_media: "Social Media", app_dev: "App Dev", web_dev: "Web Dev" };
  const headers = ["Name", "Email", "Phone", "Contact Person", "Status", "Services", "Timezone", "Calendars", "Projects"];
  const rows = clients.map((c) => [
    c.name, c.email, c.phone ?? "", c.contactPerson ?? "", c.status,
    (c.services as ServiceSubscription[]).map((s) => serviceLabels[s.type] ?? s.type).join("; "),
    c.timezone ?? "",
    c._count?.calendars ?? 0,
    c._count?.projects ?? 0,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `clients-${Date.now()}.csv`;
  a.click();
}

const serviceLabels: Record<string, string> = { social_media: "Social Media", app_dev: "App Dev", web_dev: "Web Dev" };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchClients = useCallback(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/clients${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setClients(d.data); })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? This will also delete all their calendars, briefs, and projects.")) return;
    setDeleting(id);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setDeleting(null);
  };

  const toggleSelect = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === clients.length ? new Set() : new Set(clients.map((c) => c.id)));

  const bulkUpdateStatus = async (status: string) => {
    await Promise.all([...selected].map((id) => fetch(`/api/clients/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })));
    setSelected(new Set());
    fetchClients();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} clients? This cannot be undone.`)) return;
    await Promise.all([...selected].map((id) => fetch(`/api/clients/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    fetchClients();
  };

  const selectedClients = clients.filter((c) => selected.has(c.id));

  return (
    <div>
      <Topbar title="Clients" />
      <div className="p-4 md:p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-tertiary]" />
            <input type="search" placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[--border] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => exportCSV(clients)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[--border] text-sm font-semibold text-[--text-secondary] hover:bg-[--bg-app] bg-white">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => { setEditClient(null); setShowModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "var(--gradient-brand)" }}>
              <Plus size={14} /> Add Client
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-sm">
            <span className="font-semibold text-indigo-700">{selected.size} selected</span>
            <div className="flex gap-2 ml-2">
              <button onClick={() => bulkUpdateStatus("active")} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">Set Active</button>
              <button onClick={() => bulkUpdateStatus("paused")} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600">Set Paused</button>
              <button onClick={() => bulkUpdateStatus("archived")} className="px-3 py-1.5 rounded-lg bg-slate-500 text-white text-xs font-bold hover:bg-slate-600">Archive</button>
              <button onClick={bulkDelete} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">Delete</button>
              <button onClick={() => exportCSV(selectedClients)} className="px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 text-xs font-bold hover:bg-indigo-100">Export Selected</button>
            </div>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-indigo-400 hover:text-indigo-700"><X size={14} /></button>
          </div>
        )}

        {/* Select all row */}
        {clients.length > 0 && !loading && (
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={selected.size === clients.length && clients.length > 0} onChange={toggleAll} className="rounded" />
            <span className="text-xs text-[--text-tertiary] font-medium">
              {selected.size > 0 ? `${selected.size} of ${clients.length} selected` : `Select all ${clients.length} clients`}
            </span>
          </div>
        )}

        {/* Clients Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-[--border] p-5 h-40 animate-pulse" />)}
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[--border] p-16 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg-app)" }}>
              <Users size={24} className="text-[--text-tertiary]" strokeWidth={1.25} />
            </div>
            <p className="font-bold text-[--text-secondary] text-sm">No clients yet</p>
            <p className="text-[--text-tertiary] text-xs mt-1 mb-4">Add your first client to get started</p>
            <button onClick={() => { setEditClient(null); setShowModal(true); }} className="px-4 py-2 text-sm font-bold text-white rounded-xl" style={{ background: "var(--gradient-brand)" }}>Add Client</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-all duration-200 relative ${selected.has(client.id) ? "border-indigo-300 ring-2 ring-indigo-100" : "border-[--border]"}`}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(client.id)}
                  onChange={() => toggleSelect(client.id)}
                  className="absolute top-4 left-4 rounded z-10"
                />

                <div className="flex items-start justify-between mb-3 pl-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "var(--gradient-brand)" }}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[--text-primary] text-sm truncate">{client.name}</p>
                      <p className="text-xs text-[--text-tertiary] truncate">{client.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ml-2 ${getStatusColor(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </div>

                {client.contactPerson && (
                  <p className="text-xs text-[--text-secondary] mb-2 pl-6">Contact: {client.contactPerson}</p>
                )}

                {(client.services as ServiceSubscription[]).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3 pl-6">
                    {(client.services as ServiceSubscription[]).map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--brand-primary-light)", color: "var(--brand-primary)" }}>
                        {serviceLabels[s.type] || s.type}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-[--border]">
                  <span className="text-xs text-[--text-tertiary]">
                    {client._count?.calendars ?? 0} calendars · {client._count?.projects ?? 0} projects
                  </span>
                  <div className="flex-1" />
                  <button onClick={() => { setEditClient(client); setShowModal(true); }}
                    className="text-xs text-[--text-secondary] hover:text-indigo-600 font-semibold transition-colors">Edit</button>
                  <button onClick={() => handleDelete(client.id)} disabled={deleting === client.id}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors disabled:opacity-50">
                    {deleting === client.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ClientModal client={editClient} onClose={() => setShowModal(false)} onSave={fetchClients} />}
    </div>
  );
}
