import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { GlassCard, Badge, SectionTitle } from "../components/ui/index.jsx";
import { EMBEDDING_STATS, DOMAINS, DOMAIN_COLORS } from "../data/mockData.js";

// Seeded pseudo-random for deterministic clusters
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

function generatePoints(adapted) {
  const rand = seededRand(42);
  return Array.from({ length: 360 }, (_, i) => {
    const domainIdx = i % 4;
    let x, y;
    if (adapted) {
      // Well-separated clusters
      const baseAngles = [Math.PI * 0.2, Math.PI * 0.85, Math.PI * 1.4, Math.PI * 1.85];
      const angle = baseAngles[domainIdx];
      const dist = 80 + rand() * 38;
      x = 200 + dist * Math.cos(angle) + (rand() - 0.5) * 50;
      y = 190 + dist * Math.sin(angle) + (rand() - 0.5) * 50;
    } else {
      // Heavily overlapping
      x = 200 + (rand() - 0.5) * 260;
      y = 190 + (rand() - 0.5) * 240;
    }
    return {
      x: Math.max(12, Math.min(388, x)),
      y: Math.max(12, Math.min(368, y)),
      domain: DOMAINS[domainIdx],
      color: Object.values(DOMAIN_COLORS)[domainIdx],
      cls: ["Chair", "Backpack", "Bike", "Table", "Bottle"][Math.floor(rand() * 5)],
    };
  });
}

function TSNECanvas({ adapted }) {
  const points = useMemo(() => generatePoints(adapted), [adapted]);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="relative w-full" style={{ paddingBottom: "75%", minHeight: 300 }}>
      <svg
        viewBox="0 0 400 380"
        className="absolute inset-0 w-full h-full"
        style={{ background: "#0D1117", borderRadius: 12 }}
      >
        {/* Grid lines */}
        {[100, 200, 300].map((v) => (
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={380} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1={0} y1={v} x2={400} y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </g>
        ))}

        {/* Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            animate={{ cx: p.x, cy: p.y }}
            transition={{ type: "spring", stiffness: 40, damping: 16, delay: Math.random() * 0.2 }}
            r={4}
            fill={p.color}
            opacity={0.78}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) =>
              setTooltip({ x: e.clientX, y: e.clientY, domain: p.domain, cls: p.cls })
            }
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Axis labels */}
        <text x="200" y="375" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="4">t-SNE DIM 1</text>
        <text x="10" y="195" textAnchor="middle" fill="#334155" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif" transform="rotate(-90, 10, 195)" letterSpacing="4">DIM 2</text>
      </svg>

      {/* Tooltip (portalled via fixed pos would be ideal, here we use absolute) */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg text-xs text-slate-200 pointer-events-none"
          style={{
            top: tooltip.y - 56,
            left: tooltip.x + 10,
            background: "rgba(8,11,20,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="font-black text-[10px] uppercase" style={{ letterSpacing: "0.1em", color: DOMAIN_COLORS[tooltip.domain] }}>{tooltip.domain}</div>
          <div className="text-slate-300">{tooltip.cls}</div>
        </div>
      )}
    </div>
  );
}

export default function EmbeddingsPage() {
  const [adapted, setAdapted] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <SectionTitle accent="indigo">Embedding Space (t-SNE)</SectionTitle>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main t-SNE plot */}
        <div className="xl:col-span-3 space-y-4">
          <GlassCard className="p-5">
            {/* Toggle + Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-5">
                {DOMAINS.map((d) => (
                  <div key={d} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: DOMAIN_COLORS[d] }}
                    />
                    <span
                      className="text-[9px] font-black uppercase text-slate-400"
                      style={{ letterSpacing: "0.12em" }}
                    >
                      {d}
                    </span>
                  </div>
                ))}
              </div>

              {/* Toggle */}
              <div
                className="flex p-1 rounded-lg gap-0.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {[
                  { label: "Source Only", val: false },
                  { label: "Adapted (DANN)", val: true },
                ].map(({ label, val }) => (
                  <button
                    key={label}
                    onClick={() => setAdapted(val)}
                    className="px-4 py-1.5 rounded-md transition-all text-[10px] font-black uppercase"
                    style={
                      adapted === val
                        ? {
                            background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                            color: "white",
                            boxShadow: "0 0 16px rgba(99,102,241,0.3)",
                            letterSpacing: "0.1em",
                          }
                        : { color: "#475569", letterSpacing: "0.1em" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <TSNECanvas adapted={adapted} />

            <div className="flex items-center justify-between mt-4">
              <div
                className="glass px-3 py-1.5 flex items-center gap-2"
                style={{ borderRadius: 8 }}
              >
                <Info size={12} className="text-indigo-400" />
                <span className="text-[10px] text-slate-500 font-medium">
                  {adapted
                    ? "Clusters well-separated — domain-invariant features learned"
                    : "Clusters overlap — domain-specific bias present"}
                </span>
              </div>
              <div className="flex gap-2">
                <Badge color="muted">Perplexity: 30</Badge>
                <Badge color="muted">n_iter: 1000</Badge>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Stats sidebar */}
        <div className="xl:col-span-1 space-y-5">
          <h3
            className="text-[10px] font-black uppercase text-slate-500"
            style={{ letterSpacing: "0.18em" }}
          >
            Clustering Metrics
          </h3>

          {EMBEDDING_STATS.map((s) => {
            const colorMap = {
              indigo: { text: "#6366F1", bar: "#6366F1" },
              cyan: { text: "#06B6D4", bar: "#06B6D4" },
              green: { text: "#10B981", bar: "#10B981" },
              amber: { text: "#F59E0B", bar: "#F59E0B" },
            };
            const c = colorMap[s.color];
            return (
              <GlassCard key={s.label} className="p-4 space-y-2">
                <div className="flex items-end justify-between">
                  <span
                    className="text-[9px] font-black uppercase text-slate-500"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    {s.label}
                  </span>
                  <span className="text-base font-black" style={{ color: c.text }}>
                    {s.value}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full opacity-60"
                    style={{ background: c.bar }}
                  />
                </div>
              </GlassCard>
            );
          })}

          <GlassCard
            className="p-4 space-y-2"
            style={{
              background: "rgba(99,102,241,0.06)",
              borderColor: "rgba(99,102,241,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-indigo-400" />
              <span
                className="text-[9px] font-black uppercase text-indigo-300"
                style={{ letterSpacing: "0.12em" }}
              >
                Interpretation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {adapted
                ? "DANN training aligns domain features in latent space, improving cross-domain retrieval by 12.3% mAP."
                : "Without adaptation, source-only training produces domain-clustered features that hurt cross-domain generalization."}
            </p>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
