import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { GlassCard, SectionTitle } from "../components/ui/index.jsx";
import { EDA_DOMAIN_DATA, EDA_CLASS_DATA, DOMAIN_COLORS } from "../data/mockData.js";

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(8,11,20,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#f1f5f9",
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
};

const GRID_STROKE = "rgba(255,255,255,0.05)";
const TICK_STYLE = { fill: "#475569", fontSize: 11 };

export default function EDAPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <SectionTitle accent="indigo">Exploratory Data Analysis</SectionTitle>

      {/* Row 1: Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar: Images per domain */}
        <GlassCard className="p-6">
          <h3
            className="text-[10px] font-black uppercase text-slate-500 mb-6"
            style={{ letterSpacing: "0.15em" }}
          >
            Images per Domain
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={EDA_DOMAIN_DATA} barCategoryGap="35%">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={TICK_STYLE} />
              <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={52}>
                {EDA_DOMAIN_DATA.map((_, i) => (
                  <Cell key={i} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Pie: Domain distribution */}
        <GlassCard className="p-6">
          <h3
            className="text-[10px] font-black uppercase text-slate-500 mb-6"
            style={{ letterSpacing: "0.15em" }}
          >
            Domain Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={EDA_DOMAIN_DATA}
                dataKey="count"
                nameKey="name"
                cx="50%" cy="45%"
                innerRadius={64}
                outerRadius={100}
                paddingAngle={4}
              >
                {EDA_DOMAIN_DATA.map((entry) => (
                  <Cell key={entry.name} fill={DOMAIN_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#64748b",
                  paddingTop: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Row 2: Horizontal bar — top 15 classes */}
      <GlassCard className="p-6">
        <h3
          className="text-[10px] font-black uppercase text-slate-500 mb-6"
          style={{ letterSpacing: "0.15em" }}
        >
          Top 15 Classes by Image Count
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={EDA_CLASS_DATA}
            margin={{ left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_STROKE} />
            <XAxis type="number" axisLine={false} tickLine={false} tick={TICK_STYLE} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="count" fill="#06B6D4" radius={[0, 6, 6, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </motion.div>
  );
}
