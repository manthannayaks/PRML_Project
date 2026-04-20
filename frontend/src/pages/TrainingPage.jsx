import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { GlassCard, Badge, SectionTitle } from "../components/ui/index.jsx";
import { TRAINING_EPOCHS, MODEL_COMPARISON } from "../data/mockData.js";

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(8,11,20,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#f1f5f9",
  fontSize: 12,
};

const GRID_STROKE = "rgba(255,255,255,0.05)";
const TICK = { fill: "#475569", fontSize: 10 };

function mapColor(val) {
  if (val >= 70) return "text-emerald-400";
  if (val >= 60) return "text-amber-400";
  return "text-rose-400";
}

function StatusBadge({ status }) {
  const configs = {
    Best: { dot: "bg-emerald-500", text: "text-emerald-400", label: "Best" },
    Good: { dot: "bg-cyan-500", text: "text-cyan-400", label: "Good" },
    Baseline: { dot: "bg-amber-500", text: "text-amber-400", label: "Baseline" },
  };
  const cfg = configs[status] ?? configs.Baseline;
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <div
        className={`w-2 h-2 rounded-full ${cfg.dot}`}
        style={status === "Best" ? { boxShadow: "0 0 8px #10B981" } : {}}
      />
      <span
        className={`text-[9px] font-black uppercase ${cfg.text}`}
        style={{ letterSpacing: "0.12em" }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="flex items-start justify-between">
        <SectionTitle accent="green">Training Metrics</SectionTitle>
        <Badge color="green">30 Epochs · DANN</Badge>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss curves */}
        <GlassCard className="p-6">
          <h3
            className="text-[10px] font-black uppercase text-slate-500 mb-6"
            style={{ letterSpacing: "0.15em" }}
          >
            Loss Curves
          </h3>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={TRAINING_EPOCHS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="epoch" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569" }}
              />
              <Line type="monotone" dataKey="trainLoss" stroke="#6366F1" strokeWidth={2.5} dot={false} name="Train Loss" />
              <Line type="monotone" dataKey="valLoss" stroke="#06B6D4" strokeWidth={2} dot={false} strokeDasharray="5 4" name="Val Loss" />
              <Line type="monotone" dataKey="domainLoss" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Domain Loss" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Accuracy curves */}
        <GlassCard className="p-6">
          <h3
            className="text-[10px] font-black uppercase text-slate-500 mb-6"
            style={{ letterSpacing: "0.15em" }}
          >
            Accuracy Curves
          </h3>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={TRAINING_EPOCHS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="epoch" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={TICK} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v.toFixed(1)}%`} />
              <Legend
                wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569" }}
              />
              <Line type="monotone" dataKey="trainAcc" stroke="#10B981" strokeWidth={2.5} dot={false} name="Train Acc" />
              <Line type="monotone" dataKey="valAcc" stroke="#06B6D4" strokeWidth={2} dot={false} strokeDasharray="5 4" name="Val Acc" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Comparison table */}
      <GlassCard className="p-6">
        <h3
          className="text-[10px] font-black uppercase text-slate-500 mb-6"
          style={{ letterSpacing: "0.15em" }}
        >
          Model Benchmark Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Method</th>
                <th>Backbone</th>
                <th>mAP (%)</th>
                <th>Top-1 Acc</th>
                <th>P@5</th>
                <th>Domain Adapt.</th>
                <th>Params</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_COMPARISON.map((row, i) => (
                <tr
                  key={i}
                  className="relative"
                  style={
                    row.status === "Best"
                      ? { borderLeft: "2px solid #6366F1" }
                      : {}
                  }
                >
                  <td className="font-semibold text-slate-200">{row.method}</td>
                  <td className="text-slate-400">{row.backbone}</td>
                  <td className={`font-mono font-black ${mapColor(row.map)}`}>
                    {row.map}%
                  </td>
                  <td className="font-mono text-slate-300">{row.acc}%</td>
                  <td className="font-mono text-slate-400">{row.p5}%</td>
                  <td>
                    <span
                      className={
                        row.adapt === "GRL"
                          ? "text-cyan-400 font-bold"
                          : "text-rose-400 font-bold"
                      }
                    >
                      {row.adapt === "GRL" ? "✓ GRL" : "✗ None"}
                    </span>
                  </td>
                  <td className="text-slate-500 font-mono text-xs">{row.params}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}
