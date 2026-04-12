"use client";
import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import type { Shoot, Client } from "@/types";

function ShootModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    clientId: "",
    shootName: "",
    shootDate: "",
    duration: "",
    location: "",
    equipmentNeeded: "",
    specialInstructions: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => { if (d.success) setClients(d.data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/shoots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]";
  const labelClass = "block text-sm font-medium text-[#2D3142] mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">Schedule Shoot</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Client *</label>
            <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className={inputClass}>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Shoot Name</label>
            <input value={form.shootName} onChange={(e) => setForm({ ...form, shootName: e.target.value })} className={inputClass} placeholder="Studio Shoot - Batch 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date & Time *</label>
              <input required type="datetime-local" value={form.shootDate} onChange={(e) => setForm({ ...form, shootDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Duration (minutes)</label>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} placeholder="120" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="Studio address or outdoor location" />
          </div>
          <div>
            <label className={labelClass}>Equipment Needed</label>
            <input value={form.equipmentNeeded} onChange={(e) => setForm({ ...form, equipmentNeeded: e.target.value })} className={inputClass} placeholder="Camera, tripod, lights..." />
          </div>
          <div>
            <label className={labelClass}>Special Instructions</label>
            <textarea rows={2} value={form.specialInstructions} onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })} className={`${inputClass} resize-none`} placeholder="Notes for the team..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Scheduling..." : "Schedule Shoot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateStatusModal({ shoot, onClose, onSave }: { shoot: Shoot; onClose: () => void; onSave: () => void }) {
  const [status, setStatus] = useState(shoot.status);
  const [rawFootageLocation, setRawFootageLocation] = useState(shoot.rawFootageLocation || "");
  const [notesPostShoot, setNotesPostShoot] = useState(shoot.notesPostShoot || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await fetch(`/api/shoots/${shoot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rawFootageLocation, notesPostShoot }),
    });
    onSave();
    onClose();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#2D3142]">Update Shoot Status</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#2D3142] text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]">
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          {status === "completed" && (
            <div>
              <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Raw Footage Link (Google Drive)</label>
              <input value={rawFootageLocation} onChange={(e) => setRawFootageLocation(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95]" placeholder="https://drive.google.com/..." />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#2D3142] mb-1.5">Post-Shoot Notes</label>
            <textarea rows={3} value={notesPostShoot} onChange={(e) => setNotesPostShoot(e.target.value)} className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30 focus:border-[#6B5B95] resize-none" placeholder="What happened, any issues..." />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] disabled:opacity-50 transition-colors">
              {saving ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShootsPage() {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updateShoot, setUpdateShoot] = useState<Shoot | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchShoots = () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/shoots${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setShoots(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShoots(); }, [statusFilter]);

  return (
    <div>
      <Topbar title="Shoots" />
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/30"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <div className="flex-1" />
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-[#6B5B95] text-white text-sm font-medium rounded-lg hover:bg-[#5A4A84] transition-colors">
            + Schedule Shoot
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-24 animate-pulse" />)}</div>
        ) : shoots.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <p className="text-4xl mb-3">🎬</p>
            <p className="font-semibold text-[#2D3142]">No shoots yet</p>
            <p className="text-[#9CA3AF] text-sm mt-1">Schedule your first shoot</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shoots.map((shoot) => (
              <div key={shoot.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#2D3142] text-sm">{shoot.shootName || "Unnamed Shoot"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(shoot.status)}`}>
                        {getStatusLabel(shoot.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280]">{(shoot.client as { name: string })?.name}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#9CA3AF]">
                      <span>📅 {formatDate(shoot.shootDate)}</span>
                      {shoot.location && <span>📍 {shoot.location}</span>}
                      {shoot.duration && <span>⏱ {shoot.duration} min</span>}
                    </div>
                    {shoot.rawFootageLocation && (
                      <a href={shoot.rawFootageLocation} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-[#6B5B95] hover:underline">
                        📁 Raw Footage →
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setUpdateShoot(shoot)}
                    className="text-xs px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
                {shoot.notesPostShoot && (
                  <p className="mt-2 text-xs text-[#6B7280] bg-[#F9FAFB] px-3 py-2 rounded-lg">{shoot.notesPostShoot}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <ShootModal onClose={() => setShowModal(false)} onSave={fetchShoots} />}
      {updateShoot && <UpdateStatusModal shoot={updateShoot} onClose={() => setUpdateShoot(null)} onSave={fetchShoots} />}
    </div>
  );
}
