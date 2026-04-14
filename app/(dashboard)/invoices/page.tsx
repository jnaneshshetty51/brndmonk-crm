"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";
import {
  Plus, FileText, Search, Download, Trash2, Send,
  CheckCircle, Clock, AlertCircle, ArrowUpRight, X,
  Receipt, TrendingUp, AlertTriangle, DollarSign,
} from "lucide-react";

interface Client { id: string; name: string; email: string; }
interface LineItem { description: string; qty: number; rate: number; amount: number; }
interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  notes: string | null;
  lineItems: LineItem[];
  client: { id: string; name: string; email: string };
  createdAt: string;
}

const statusMeta: Record<string, { label: string; bg: string; text: string; Icon: React.ElementType; dot: string }> = {
  draft:   { label: "Draft",   bg: "bg-slate-100",   text: "text-slate-600",   Icon: FileText,    dot: "#94A3B8" },
  sent:    { label: "Sent",    bg: "bg-blue-50",     text: "text-blue-600",    Icon: Send,        dot: "#3B82F6" },
  paid:    { label: "Paid",    bg: "bg-emerald-50",  text: "text-emerald-700", Icon: CheckCircle, dot: "#10B981" },
  overdue: { label: "Overdue", bg: "bg-red-50",      text: "text-red-600",     Icon: AlertCircle, dot: "#EF4444" },
};

const inputCls = "w-full px-3 py-2.5 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white";
const labelCls = "block text-xs font-semibold text-[--text-secondary] mb-1.5";

function InvoiceModal({ clients, onClose, onSave }: { clients: Client[]; onClose: () => void; onSave: () => void }) {
  const [clientId, setClientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxPercent, setTaxPercent] = useState(0);
  const [items, setItems] = useState<LineItem[]>([{ description: "", qty: 1, rate: 0, amount: 0 }]);
  const [saving, setSaving] = useState(false);

  const updateItem = (i: number, field: keyof LineItem, val: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      if (field === "qty" || field === "rate") {
        next[i].amount = Number(next[i].qty) * Number(next[i].rate);
      }
      return next;
    });
  };

  const subtotal = items.reduce((s, it) => s + (it.amount || 0), 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, lineItems: items, subtotal, taxPercent, taxAmount, total, dueDate: dueDate || null, notes }),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
              <Receipt size={14} className="text-white" />
            </div>
            <h2 className="font-bold text-[--text-primary]">New Invoice</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[--bg-app] text-[--text-tertiary] transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Client + due date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client *</label>
              <select required value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>
                <option value="">Select client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Line Items</label>
              <button type="button" onClick={() => setItems((p) => [...p, { description: "", qty: 1, rate: 0, amount: 0 }])}
                className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors flex items-center gap-1">
                <Plus size={11} /> Add row
              </button>
            </div>
            <div className="border border-[--border] rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-0 px-3 py-2.5 text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider" style={{ background: "var(--bg-app)" }}>
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Rate (₹)</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 px-3 py-2.5 border-t border-[--border] items-center hover:bg-slate-50/50 transition-colors">
                  <input className="col-span-6 text-sm border-0 focus:outline-none bg-transparent placeholder:text-[--text-tertiary]" placeholder="Service description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} required />
                  <input className="col-span-2 text-sm border-0 focus:outline-none bg-transparent text-center" type="number" min="1" value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))} />
                  <input className="col-span-2 text-sm border-0 focus:outline-none bg-transparent text-right" type="number" min="0" value={item.rate} onChange={(e) => updateItem(i, "rate", Number(e.target.value))} />
                  <div className="col-span-1 text-sm text-right font-semibold text-indigo-600">₹{item.amount.toLocaleString()}</div>
                  <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} className="col-span-1 flex justify-end text-[--text-tertiary] hover:text-red-500 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-2">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[--text-tertiary]">Subtotal</span>
                <span className="font-semibold text-[--text-primary]">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-[--text-tertiary] flex items-center gap-2">
                  Tax
                  <input type="number" min="0" max="100" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-14 px-2 py-0.5 border border-[--border] rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                  %
                </label>
                <span className="font-semibold text-[--text-primary]">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[--border]">
                <span className="font-bold text-[--text-primary]">Total</span>
                <span className="font-black text-xl text-indigo-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="Payment terms, bank details, thank you note…" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-opacity" style={{ background: "var(--gradient-brand)" }}>
              {saving ? "Creating…" : "Create Invoice"}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-[--text-secondary] rounded-xl border border-[--border] hover:bg-[--bg-app] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function exportCSV(invoices: Invoice[]) {
  const headers = ["Invoice #", "Client", "Status", "Subtotal", "Tax", "Total", "Due Date", "Created"];
  const rows = invoices.map((inv) => [
    inv.invoiceNumber, inv.client.name, inv.status,
    inv.subtotal, inv.taxAmount, inv.total,
    inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "",
    new Date(inv.createdAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `invoices-${Date.now()}.csv`;
  a.click();
}

export default function InvoicesPage() {
  const { can } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => {
    fetch("/api/invoices").then((r) => r.json()).then((d) => { if (d.success) setInvoices(d.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetch("/api/clients").then((r) => r.json()).then((d) => { if (d.success) setClients(d.data); }); }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchQ = !q || inv.invoiceNumber.toLowerCase().includes(q) || inv.client.name.toLowerCase().includes(q);
    const matchS = !filterStatus || inv.status === filterStatus;
    return matchQ && matchS;
  });

  const toggleSelect = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id)));

  const bulkUpdateStatus = async (status: string) => {
    await Promise.all([...selected].map((id) => fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })));
    setSelected(new Set());
    load();
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    load();
  };

  const summary = {
    total: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
    pending: invoices.filter((i) => i.status === "sent").reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  const summaryCards = [
    { label: "Total Invoiced", value: `₹${summary.total.toLocaleString()}`, Icon: Receipt, gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)", shadow: "rgba(99,102,241,0.3)" },
    { label: "Collected", value: `₹${summary.paid.toLocaleString()}`, Icon: TrendingUp, gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)", shadow: "rgba(16,185,129,0.3)" },
    { label: "Outstanding", value: `₹${summary.pending.toLocaleString()}`, Icon: Clock, gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", shadow: "rgba(59,130,246,0.3)" },
    { label: "Overdue", value: String(summary.overdue), Icon: AlertTriangle, gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)", shadow: "rgba(239,68,68,0.3)" },
  ];

  return (
    <div>
      <Topbar title="Invoices" />
      <div className="p-4 md:p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryCards.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-[--border] flex items-center gap-4 group hover:-translate-y-0.5 transition-all duration-200" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: s.gradient, boxShadow: `0 4px 14px ${s.shadow}` }}>
                <s.Icon size={18} className="text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[--text-tertiary] uppercase tracking-wider truncate">{s.label}</p>
                <p className="text-xl font-black text-[--text-primary] mt-0.5 leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-tertiary]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by invoice # or client…"
              className="w-full pl-9 pr-4 py-2.5 border border-[--border] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-[--border] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-[--text-secondary]">
            <option value="">All statuses</option>
            {Object.keys(statusMeta).map((s) => <option key={s} value={s}>{statusMeta[s].label}</option>)}
          </select>
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[--border] text-sm font-semibold text-[--text-secondary] hover:bg-[--bg-app] bg-white transition-colors">
            <Download size={14} /> Export CSV
          </button>
          {can("clients", "create") && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "var(--gradient-brand)" }}>
              <Plus size={14} /> New Invoice
            </button>
          )}
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-sm">
            <span className="font-bold text-indigo-700">{selected.size} selected</span>
            <div className="flex gap-2 ml-2 flex-wrap">
              <button onClick={() => bulkUpdateStatus("sent")} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">Mark Sent</button>
              <button onClick={() => bulkUpdateStatus("paid")} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">Mark Paid</button>
              <button onClick={() => bulkUpdateStatus("overdue")} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">Mark Overdue</button>
            </div>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-indigo-400 hover:text-indigo-700 transition-colors"><X size={14} /></button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[--border] overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          {loading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-[--bg-app] animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg-app)" }}>
                <FileText size={24} className="text-[--text-tertiary]" strokeWidth={1.25} />
              </div>
              <p className="font-bold text-[--text-secondary] text-sm">No invoices yet</p>
              <p className="text-[--text-tertiary] text-xs mt-1 mb-4">Create your first invoice to get started</p>
              <button onClick={() => setShowModal(true)} className="text-sm font-bold text-white px-4 py-2 rounded-xl" style={{ background: "var(--gradient-brand)" }}>
                New Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[--border]" style={{ background: "var(--bg-app)" }}>
                    <th className="px-4 py-3.5 text-left w-10">
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                    </th>
                    {["Invoice #", "Client", "Amount", "Status", "Due Date", ""].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {filtered.map((inv) => {
                    const meta = statusMeta[inv.status] ?? statusMeta.draft;
                    const StatusIcon = meta.Icon;
                    const isOverdue = inv.status === "overdue";
                    return (
                      <tr key={inv.id} className={`hover:bg-slate-50/70 transition-colors group ${isOverdue ? "bg-red-50/30" : ""}`}>
                        <td className="px-4 py-4">
                          <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)} className="rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono font-bold text-[--text-primary] text-xs tracking-wide bg-[--bg-app] px-2 py-1 rounded-lg">{inv.invoiceNumber}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: "var(--gradient-brand)" }}>
                              {inv.client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[--text-primary] text-sm">{inv.client.name}</p>
                              <p className="text-xs text-[--text-tertiary]">{inv.client.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-black text-[--text-primary] text-base">₹{inv.total.toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                            <StatusIcon size={11} strokeWidth={2.5} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-[--text-secondary]">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : <span className="text-[--text-tertiary]">—</span>}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/invoices/${inv.id}`} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="View invoice">
                              <ArrowUpRight size={14} />
                            </Link>
                            {can("clients", "delete") && (
                              <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && <InvoiceModal clients={clients} onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
}
