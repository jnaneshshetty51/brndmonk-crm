"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Users, FolderKanban, Camera, Receipt,
  ArrowRight, X, Loader2,
} from "lucide-react";

interface SearchResults {
  clients:  { id: string; name: string; email: string; status: string }[];
  projects: { id: string; name: string; status: string; client: { name: string } }[];
  shoots:   { id: string; shootName: string | null; status: string; shootDate: string; client: { name: string } }[];
  invoices: { id: string; invoiceNumber: string; total: number; status: string; client: { name: string } }[];
}

const empty: SearchResults = { clients: [], projects: [], shoots: [], invoices: [] };

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(empty);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus on open
  useEffect(() => {
    if (open) { setQuery(""); setResults(empty); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  // Debounced search
  const search = useCallback((q: string) => {
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 2) { setResults(empty); setLoading(false); return; }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success) setResults(data.data);
      } finally { setLoading(false); }
    }, 250);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  const navigate = (href: string) => { router.push(href); onClose(); };

  const hasResults = results.clients.length + results.projects.length + results.shoots.length + results.invoices.length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[--border]">
          {loading
            ? <Loader2 size={17} className="text-[--text-tertiary] shrink-0 animate-spin" />
            : <Search size={17} className="text-[--text-tertiary] shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, projects, shoots, invoices…"
            className="flex-1 text-sm text-[--text-primary] placeholder:text-[--text-tertiary] bg-transparent focus:outline-none"
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[--text-tertiary] hover:text-[--text-primary]"><X size={14} /></button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-[--text-tertiary] border border-[--border] rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-10 text-center">
              <Search size={28} className="mx-auto text-[--text-tertiary] mb-3" strokeWidth={1.25} />
              <p className="text-sm text-[--text-secondary] font-medium">Start typing to search…</p>
              <p className="text-xs text-[--text-tertiary] mt-1">Clients, projects, shoots, invoices</p>
            </div>
          ) : !hasResults && !loading ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-[--text-secondary] font-medium">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <div className="py-2">
              <Section title="Clients" Icon={Users} items={results.clients} onSelect={(c) => navigate(`/clients`)} renderLabel={(c) => c.name} renderSub={(c) => c.email} />
              <Section title="Projects" Icon={FolderKanban} items={results.projects} onSelect={(p) => navigate(`/projects/${p.id}`)} renderLabel={(p) => p.name} renderSub={(p) => p.client.name} />
              <Section title="Shoots" Icon={Camera} items={results.shoots} onSelect={(s) => navigate(`/shoots/${s.id}`)} renderLabel={(s) => s.shootName ?? "Unnamed Shoot"} renderSub={(s) => s.client.name} />
              <Section title="Invoices" Icon={Receipt} items={results.invoices} onSelect={(i) => navigate(`/invoices/${i.id}`)} renderLabel={(i) => i.invoiceNumber} renderSub={(i) => `${i.client.name} — ₹${i.total.toLocaleString()}`} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[--border] bg-[--bg-app] flex items-center gap-4 text-[10px] text-[--text-tertiary] font-medium">
          <span className="flex items-center gap-1"><kbd className="border border-[--border] rounded px-1 py-0.5 font-mono bg-white">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="border border-[--border] rounded px-1 py-0.5 font-mono bg-white">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="border border-[--border] rounded px-1 py-0.5 font-mono bg-white">ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

function Section<T extends { id: string }>({
  title, Icon, items, onSelect, renderLabel, renderSub,
}: {
  title: string;
  Icon: React.ElementType;
  items: T[];
  onSelect: (item: T) => void;
  renderLabel: (item: T) => string;
  renderSub: (item: T) => string;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 px-4 py-1.5">
        <Icon size={11} className="text-[--text-tertiary]" strokeWidth={2} />
        <span className="text-[10px] font-bold text-[--text-tertiary] uppercase tracking-widest">{title}</span>
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[--brand-primary-light] group transition-colors text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[--text-primary] group-hover:text-[--brand-primary] truncate transition-colors">{renderLabel(item)}</p>
            <p className="text-xs text-[--text-tertiary] truncate">{renderSub(item)}</p>
          </div>
          <ArrowRight size={13} className="shrink-0 text-[--text-tertiary] opacity-0 group-hover:opacity-100 group-hover:text-[--brand-primary] transition-all group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
}
