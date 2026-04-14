"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { ArrowLeft, Printer, Send, CheckCircle, AlertCircle, Edit2, Save, X, FileText, Clock } from "lucide-react";

interface LineItem { description: string; qty: number; rate: number; amount: number; }
interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  lineItems: LineItem[];
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string; phone?: string; contactPerson?: string };
}

const statusMeta: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:   { label: "Draft",   bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200" },
  sent:    { label: "Sent",    bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200" },
  paid:    { label: "Paid",    bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  overdue: { label: "Overdue", bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200" },
};

const statusIcon: Record<string, React.ElementType> = {
  draft: FileText,
  sent: Send,
  paid: CheckCircle,
  overdue: AlertCircle,
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then((r) => r.json()).then((d) => {
      if (d.success) { setInvoice(d.data); setNotes(d.data.notes ?? ""); }
    }).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json();
    if (data.success) setInvoice(data.data);
  };

  const saveNotes = async () => {
    await fetch(`/api/invoices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes }) });
    setInvoice((prev) => prev ? { ...prev, notes } : prev);
    setEditNotes(false);
  };

  if (loading) return (
    <div>
      <Topbar title="Invoice" />
      <div className="p-6 max-w-4xl">
        <div className="h-[600px] bg-white rounded-2xl border border-[--border] animate-pulse" style={{ boxShadow: "var(--shadow-card)" }} />
      </div>
    </div>
  );
  if (!invoice) return (
    <div>
      <Topbar title="Invoice" />
      <div className="p-6 text-center text-[--text-tertiary] mt-20">Invoice not found.</div>
    </div>
  );

  const meta = statusMeta[invoice.status] ?? statusMeta.draft;
  const StatusIcon = statusIcon[invoice.status] ?? FileText;
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";
  const isPaid = invoice.status === "paid";

  return (
    <div>
      <Topbar title={invoice.invoiceNumber} />
      <div className="p-4 md:p-6 max-w-4xl space-y-4">

        {/* Back + actions bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary] font-semibold transition-colors">
            <ArrowLeft size={15} /> Back to Invoices
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {invoice.status === "draft" && (
              <button onClick={() => updateStatus("sent")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <Send size={13} strokeWidth={2.5} /> Mark Sent
              </button>
            )}
            {invoice.status === "sent" && (
              <>
                <button onClick={() => updateStatus("paid")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                  <CheckCircle size={13} strokeWidth={2.5} /> Mark Paid
                </button>
                <button onClick={() => updateStatus("overdue")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">
                  <AlertCircle size={13} strokeWidth={2.5} /> Mark Overdue
                </button>
              </>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[--border] text-sm font-semibold text-[--text-secondary] hover:bg-[--bg-app] bg-white transition-colors">
              <Printer size={14} /> Print / PDF
            </button>
          </div>
        </div>

        {/* Invoice card */}
        <div
          id="invoice-print"
          className="bg-white rounded-2xl overflow-hidden print:rounded-none print:shadow-none"
          style={{ boxShadow: "var(--shadow-card-hover)", border: "1px solid var(--border)" }}
        >
          {/* Gradient top band */}
          <div className="h-2 w-full" style={{ background: isPaid ? "linear-gradient(90deg, #10B981, #059669)" : "var(--gradient-brand)" }} />

          <div className="p-8 print:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ background: "var(--gradient-brand)", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
                    B
                  </div>
                  <div>
                    <p className="font-black text-[--text-primary] text-xl tracking-tight leading-tight">Brndmonk</p>
                    <p className="text-xs text-[--text-tertiary] font-medium">Social Media & Dev Agency</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[--text-tertiary] uppercase tracking-widest mb-1">Invoice</p>
                <p className="text-3xl font-black text-[--text-primary] font-mono">{invoice.invoiceNumber}</p>
                <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-3 py-1.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
                  <StatusIcon size={11} strokeWidth={2.5} />
                  {meta.label}
                </span>
              </div>
            </div>

            {/* Bill to + dates */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="bg-[--bg-app] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-widest mb-3">Bill To</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: "var(--gradient-brand)" }}>
                    {invoice.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[--text-primary] text-sm">{invoice.client.name}</p>
                    <p className="text-xs text-[--text-secondary]">{invoice.client.email}</p>
                  </div>
                </div>
                {invoice.client.phone && <p className="text-sm text-[--text-secondary] ml-12">{invoice.client.phone}</p>}
                {invoice.client.contactPerson && <p className="text-xs text-[--text-tertiary] ml-12 mt-0.5">Attn: {invoice.client.contactPerson}</p>}
              </div>
              <div className="flex flex-col justify-center gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-widest">Invoice Date</span>
                  <span className="text-sm font-semibold text-[--text-primary]">{fmtDate(invoice.createdAt)}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-widest flex items-center gap-1"><Clock size={9} /> Due Date</span>
                    <span className={`text-sm font-bold ${invoice.status === "overdue" ? "text-red-600" : "text-[--text-primary]"}`}>{fmtDate(invoice.dueDate)}</span>
                  </div>
                )}
                {invoice.sentAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-widest">Sent On</span>
                    <span className="text-sm font-semibold text-blue-600">{fmtDate(invoice.sentAt)}</span>
                  </div>
                )}
                {invoice.paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-widest">Paid On</span>
                    <span className="text-sm font-bold text-emerald-600">{fmtDate(invoice.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line items table */}
            <div className="rounded-xl overflow-hidden border border-[--border] mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--bg-app)" }}>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3.5 text-center text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider w-20">Qty</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider w-32">Rate</th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold text-[--text-tertiary] uppercase tracking-wider w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {invoice.lineItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-[--text-primary]">{item.description}</td>
                      <td className="px-5 py-4 text-center text-[--text-secondary]">{item.qty}</td>
                      <td className="px-5 py-4 text-right text-[--text-secondary]">₹{Number(item.rate).toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-bold text-[--text-primary]">₹{Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-72 space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[--text-secondary]">Subtotal</span>
                  <span className="font-semibold text-[--text-primary]">₹{invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[--text-secondary]">Tax ({invoice.taxPercent}%)</span>
                  <span className="font-semibold text-[--text-primary]">₹{invoice.taxAmount.toLocaleString()}</span>
                </div>
                <div className="mt-2 pt-3 border-t border-[--border] rounded-xl" />
                <div className="flex justify-between items-center px-4 py-3 rounded-xl" style={{ background: isPaid ? "linear-gradient(135deg, #ECFDF5, #D1FAE5)" : "linear-gradient(135deg, #EEF2FF, #E0E7FF)" }}>
                  <span className="font-bold text-sm" style={{ color: isPaid ? "#059669" : "#4F46E5" }}>Total</span>
                  <span className="font-black text-2xl" style={{ color: isPaid ? "#059669" : "#4F46E5" }}>₹{invoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(invoice.notes || editNotes) && (
              <div className="border-t border-[--border] pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-widest">Notes & Payment Details</p>
                  {!editNotes && (
                    <button onClick={() => setEditNotes(true)} className="print:hidden text-[--text-tertiary] hover:text-indigo-600 transition-colors">
                      <Edit2 size={11} />
                    </button>
                  )}
                </div>
                {editNotes ? (
                  <div className="space-y-2">
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2.5 border border-[--border] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={saveNotes} className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-colors" style={{ background: "var(--gradient-brand)" }}>
                        <Save size={11} /> Save
                      </button>
                      <button onClick={() => { setNotes(invoice.notes ?? ""); setEditNotes(false); }} className="flex items-center gap-1 text-xs font-semibold text-[--text-secondary] px-3 py-1.5 rounded-lg border border-[--border] hover:bg-[--bg-app] transition-colors">
                        <X size={11} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[--text-secondary] whitespace-pre-line bg-[--bg-app] rounded-xl px-4 py-3">{invoice.notes}</p>
                )}
              </div>
            )}
            {!invoice.notes && !editNotes && (
              <div className="border-t border-[--border] pt-4 print:hidden">
                <button onClick={() => setEditNotes(true)} className="text-xs text-[--text-tertiary] hover:text-indigo-600 font-semibold transition-colors flex items-center gap-1.5">
                  <Edit2 size={11} /> Add notes / payment details
                </button>
              </div>
            )}

            {/* Paid watermark */}
            {isPaid && (
              <div className="mt-6 flex justify-center print:mt-12">
                <div className="px-8 py-3 rounded-xl border-4 border-emerald-300 text-emerald-500 font-black text-3xl tracking-[0.3em] opacity-20 rotate-[-5deg] select-none">
                  PAID
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body > * { display: none; }
          #invoice-print { display: block !important; position: fixed; inset: 0; background: white; }
          .print\\:hidden { display: none; }
        }
      `}</style>
    </div>
  );
}
