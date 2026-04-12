"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Client, ServiceSubscription } from "@/types";

function ClientModal({
  client,
  onClose,
  onSave,
}: {
  client?: Client | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    contactPerson: client?.contactPerson || "",
    timezone: client?.timezone || "",
    status: client?.status || "active",
    services: client?.services || [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = client ? `/api/clients/${client.id}` : "/api/clients";
    const method = client ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      onSave();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">{client ? "Edit Client" : "New Client"}</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
                placeholder="client@company.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Contact Person</label>
              <input
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "paused" | "archived" })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Timezone</label>
              <input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
                placeholder="Asia/Kolkata"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : client ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchClients = () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/clients${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setClients(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? This will also delete all their calendars, briefs, and projects.")) return;
    setDeleting(id);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  };

  const serviceLabels: Record<string, string> = {
    social_media: "Social Media",
    app_dev: "App Dev",
    web_dev: "Web Dev",
  };

  return (
    <div>
      <Topbar title="Clients" />
      <div className="p-6 space-y-5">
        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]"
          />
          <button
            onClick={() => { setEditClient(null); setShowModal(true); }}
            className="px-4 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors"
          >
            + Add Client
          </button>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-40 animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold text-[#2D3142]">No clients yet</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Add your first client to get started</p>
            <button
              onClick={() => { setEditClient(null); setShowModal(true); }}
              className="mt-4 px-4 py-2 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors"
            >
              Add Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6B5B95]/10 flex items-center justify-center text-[#6B5B95] font-bold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3142] text-sm">{client.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{client.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </div>

                {client.contactPerson && (
                  <p className="text-xs text-[#6B7280] mb-2">Contact: {client.contactPerson}</p>
                )}

                {/* Services */}
                {(client.services as ServiceSubscription[]).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(client.services as ServiceSubscription[]).map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-[#6B5B95]/10 text-[#6B5B95] rounded-full">
                        {serviceLabels[s.type] || s.type}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-[#F3F4F6]">
                  <span className="text-xs text-[#9CA3AF]">
                    {(client._count?.calendars || 0)} calendars · {(client._count?.projects || 0)} projects
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => { setEditClient(client); setShowModal(true); }}
                    className="text-xs text-[#6B7280] hover:text-[#6B5B95] font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    disabled={deleting === client.id}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                  >
                    {deleting === client.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ClientModal
          client={editClient}
          onClose={() => setShowModal(false)}
          onSave={fetchClients}
        />
      )}
    </div>
  );
}
