// Shared reusable UI primitives

// ── GlassCard ──────────────────────────────────────────────────────────────
export function GlassCard({ children, className = "", onClick }) {
  return (
    <div className={`glass ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  indigo: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25",
  cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25",
  amber: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
  green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  red: "bg-rose-500/10 text-rose-400 border border-rose-500/25",
  muted: "bg-white/5 text-slate-400 border border-white/10",
};

export function Badge({ children, color = "muted" }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${BADGE_STYLES[color]}`}
    >
      {children}
    </span>
  );
}

// ── SectionTitle ───────────────────────────────────────────────────────────
export function SectionTitle({ children, accent = "cyan" }) {
  const accent_colors = {
    cyan: "bg-cyan-500",
    indigo: "bg-indigo-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
  };
  return (
    <div className="flex items-center gap-3 mb-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-100">
        {children}
      </h2>
      <div
        className={`h-0.5 w-12 rounded-full mt-1 ${accent_colors[accent] ?? "bg-cyan-500"}`}
      />
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-10 h-10 border-4 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse">
        {text}
      </p>
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────
export function Divider() {
  return <hr className="border-white/[0.06] my-6" />;
}
