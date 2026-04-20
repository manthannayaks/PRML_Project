import { useState } from "react";
import {
  Brain,
  LayoutDashboard,
  BarChart2,
  TrendingUp,
  Search,
  Layers,
  Share2,
  Cpu,
  Database,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "eda", label: "EDA Explorer", Icon: BarChart2 },
  { id: "training", label: "Training Logs", Icon: TrendingUp },
  { id: "retrieval", label: "Retrieval Engine", Icon: Search },
  { id: "embeddings", label: "Embeddings / t-SNE", Icon: Layers },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
export function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full"
      style={{
        background: "rgba(8,11,20,0.9)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="p-7 pb-10">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #6366F1, #06B6D4)",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            <Brain size={22} color="white" />
          </div>
          <div>
            <h1
              className="text-lg font-black tracking-tighter leading-none gradient-text"
              style={{ letterSpacing: "-0.03em" }}
            >
              CDIR Lab
            </h1>
            <p
              className="text-[9px] font-black uppercase mt-0.5"
              style={{ letterSpacing: "0.18em", color: "#475569" }}
            >
              PRML Research
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-grow px-4 space-y-1">
        <p
          className="text-[9px] font-black uppercase px-3 mb-3"
          style={{ letterSpacing: "0.2em", color: "#334155" }}
        >
          Navigation
        </p>
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`nav-item w-full text-left ${activeTab === id ? "active" : ""}`}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Badge */}
      <div className="p-5">
        <div
          className="glass p-4 space-y-3"
          style={{ borderRadius: "12px" }}
        >
          <div className="flex items-center gap-2">
            <Database size={13} className="text-slate-500" />
            <span
              className="text-[9px] font-black uppercase"
              style={{ letterSpacing: "0.15em", color: "#475569" }}
            >
              Dataset
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">
              Office-Home
            </p>
            <p className="text-[9px] text-slate-600 mt-0.5">
              65 Classes · 4 Domains · 15,588 img
            </p>
          </div>
          <div className="flex gap-1.5">
            {["#6366F1", "#06B6D4", "#10B981", "#F59E0B"].map((c) => (
              <div
                key={c}
                className="h-1 rounded-full flex-1"
                style={{ background: c, opacity: 0.7 }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  overview: "Research Overview",
  eda: "Exploratory Data Analysis",
  training: "Training Metrics",
  retrieval: "Retrieval Engine",
  embeddings: "Embedding Visualizer",
};

export function TopBar({ activeTab }) {
  return (
    <header
      className="h-16 flex-shrink-0 flex items-center justify-between px-8"
      style={{
        background: "rgba(8,11,20,0.7)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center gap-4">
        <h2
          className="text-xs font-black uppercase text-slate-200"
          style={{ letterSpacing: "0.15em" }}
        >
          {PAGE_TITLES[activeTab]}
        </h2>
        <div
          className="w-px h-4"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-emerald-500 pulse-green"
            style={{ boxShadow: "0 0 8px #10B981" }}
          />
          <span
            className="text-[10px] font-black text-emerald-500 uppercase"
            style={{ letterSpacing: "0.15em" }}
          >
            DANN · ResNet-50 · Ready
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
          style={{ background: "rgba(255,255,255,0.03)" }}
          title="Share"
        >
          <Share2 size={17} />
        </button>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-indigo-400"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <Cpu size={13} />
          <span>GPU Active</span>
        </div>
      </div>
    </header>
  );
}
