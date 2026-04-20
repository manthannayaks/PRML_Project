import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Cpu, LayoutGrid, Zap } from "lucide-react";
import { GlassCard, Badge, SectionTitle } from "../components/ui/index.jsx";
import { OVERVIEW_STATS, TRANSFER_MATRIX, DOMAINS } from "../data/mockData.js";

const ICON_MAP = { Target, Cpu, LayoutGrid, Zap };

const COLOR_CLASSES = {
  indigo: {
    bar: "from-indigo-500 to-indigo-600",
    glow: "rgba(99,102,241,0.15)",
    border: "#6366F1",
    text: "text-indigo-400",
    icon_bg: "rgba(99,102,241,0.12)",
  },
  cyan: {
    bar: "from-cyan-500 to-cyan-600",
    glow: "rgba(6,182,212,0.15)",
    border: "#06B6D4",
    text: "text-cyan-400",
    icon_bg: "rgba(6,182,212,0.12)",
  },
  amber: {
    bar: "from-amber-500 to-amber-600",
    glow: "rgba(245,158,11,0.15)",
    border: "#F59E0B",
    text: "text-amber-400",
    icon_bg: "rgba(245,158,11,0.12)",
  },
  green: {
    bar: "from-emerald-500 to-emerald-600",
    glow: "rgba(16,185,129,0.15)",
    border: "#10B981",
    text: "text-emerald-400",
    icon_bg: "rgba(16,185,129,0.12)",
  },
};

// Animated counter hook
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof target !== "number") return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ stat, delay }) {
  const Icon = ICON_MAP[stat.iconName];
  const color = COLOR_CLASSES[stat.color];
  const count = useCountUp(typeof stat.value === "number" ? stat.value : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <GlassCard className="p-6 h-full relative overflow-hidden">
        {/* Top colored bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${color.bar} rounded-t-2xl`}
        />

        <div className="flex justify-between items-start mb-5">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: color.icon_bg, boxShadow: `0 0 16px ${color.glow}` }}
          >
            {Icon && <Icon size={20} className={color.text} />}
          </div>
          {stat.trend && (
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">
              {stat.trend}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-black tracking-tight text-slate-100">
            {typeof stat.value === "number"
              ? `${count.toFixed(1)}${stat.suffix ?? ""}`
              : stat.value}
          </div>
          <div
            className="text-[10px] font-black uppercase text-slate-500"
            style={{ letterSpacing: "0.12em" }}
          >
            {stat.label}
          </div>
          <div className="text-[11px] text-slate-600 pt-0.5">{stat.description}</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function TransferMatrix() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-100">Domain Transfer Matrix</h3>
        <Badge color="muted">mAP (%)</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table w-full text-sm">
          <thead>
            <tr>
              <th className="text-left" style={{ letterSpacing: "0.1em" }}>Source → Target</th>
              {DOMAINS.map((d) => <th key={d} className="text-left">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {TRANSFER_MATRIX.rows.map((rowDomain, ri) => (
              <tr key={rowDomain}>
                <td className="font-semibold text-slate-300 pr-4">{rowDomain}</td>
                {TRANSFER_MATRIX.values[ri].map((val, ci) => {
                  const num = val ? parseFloat(val) : null;
                  const colorClass =
                    num === null ? "text-slate-700" :
                    num > 75 ? "text-emerald-400" :
                    num > 65 ? "text-amber-400" : "text-rose-400";
                  return (
                    <td key={ci} className={`font-mono font-bold ${colorClass}`}>
                      {val ?? "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function ArchitectureDiagram() {
  const box = (label, sub, style) => (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="px-5 py-3 rounded-xl text-sm font-bold text-center"
        style={{ minWidth: 160, ...style }}
      >
        {label}
      </div>
      {sub && (
        <span
          className="text-[9px] font-black uppercase text-slate-600"
          style={{ letterSpacing: "0.15em" }}
        >
          {sub}
        </span>
      )}
    </div>
  );

  const arrow = (label) => (
    <div className="flex flex-col items-center gap-1 py-1">
      <div className="w-px h-6 bg-slate-700" />
      <div
        className="w-0 h-0"
        style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid #334155" }}
      />
      {label && <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">{label}</span>}
    </div>
  );

  return (
    <GlassCard className="p-6 flex flex-col h-full">
      <h3 className="text-base font-bold text-slate-100 mb-6">DANN Architecture</h3>
      <div className="flex-grow flex flex-col items-center justify-center space-y-1">
        {box("Feature Extractor (CNN)", "ResNet-50 / VGG / DenseNet", {
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.4)",
          color: "#c7d2fe",
        })}
        {arrow("Features")}

        {/* Branch */}
        <div className="flex w-full items-start justify-center gap-10 mt-1">
          {/* Left branch: Class */}
          <div className="flex flex-col items-center gap-1.5">
            {box("Class Classifier", "Object Prediction", {
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.35)",
              color: "#a5f3fc",
            })}
          </div>
          {/* Right branch: GRL → Domain */}
          <div className="flex flex-col items-center gap-1.5">
            {box("Gradient Reversal Layer", "Adversarial", {
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#fca5a5",
            })}
            {arrow()}
            {box("Domain Classifier", "Art / Clipart / Product / RW", {
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.35)",
              color: "#fde68a",
            })}
          </div>
        </div>

        <p className="text-[10px] text-slate-600 text-center mt-4 max-w-xs leading-relaxed">
          GRL negates domain-classifier gradients during back-propagation, forcing the feature extractor to produce domain-invariant representations.
        </p>
      </div>
    </GlassCard>
  );
}

export default function OverviewPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <SectionTitle accent="cyan">Research Overview</SectionTitle>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {OVERVIEW_STATS.map((stat, i) => (
          <StatCard key={stat.id} stat={stat} delay={i * 0.08} />
        ))}
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <TransferMatrix />
        </div>
        <div className="xl:col-span-2">
          <ArchitectureDiagram />
        </div>
      </div>
    </motion.div>
  );
}
