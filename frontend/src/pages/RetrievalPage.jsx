import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Info } from "lucide-react";
import { GlassCard, Badge, SectionTitle } from "../components/ui/index.jsx";
import { DOMAINS, DOMAIN_COLORS, RETRIEVAL_RESULTS } from "../data/mockData.js";

const DOMAIN_BADGE_COLOR = { Art: "indigo", Clipart: "cyan", Product: "green", "Real World": "amber" };

function QueryPanel({ domain, setDomain, threshold, setThreshold, onRun, loading }) {
  return (
    <GlassCard className="p-6 flex flex-col h-full space-y-6">
      <h3
        className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-2"
        style={{ letterSpacing: "0.18em" }}
      >
        <Search size={13} /> Query Configuration
      </h3>

      {/* Fake query image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/8 group cursor-default"
        style={{ background: "linear-gradient(135deg, #4338ca, #7c3aed, #1e1b4b)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
          <Target size={56} color="white" />
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge color="muted">#4821</Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge color="indigo">Art</Badge>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge color="indigo">Domain: Art</Badge>
        <Badge color="cyan">Class: Backpack</Badge>
      </div>

      {/* Domain select */}
      <div className="space-y-2">
        <label
          className="text-[9px] font-black uppercase text-slate-500"
          style={{ letterSpacing: "0.18em" }}
        >
          Target Domain Pool
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={`px-3 py-2 rounded-lg text-[10px] font-bold text-left transition-all border ${
                domain === d
                  ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                  : "border-white/8 bg-white/3 text-slate-500 hover:text-slate-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold slider */}
      <div className="space-y-2">
        <label
          className="text-[9px] font-black uppercase text-slate-500 flex justify-between"
          style={{ letterSpacing: "0.18em" }}
        >
          <span>Sim Threshold</span>
          <span className="text-cyan-400">{threshold.toFixed(2)}</span>
        </label>
        <input
          type="range" min="0.5" max="1.0" step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #6366F1 0%, #06B6D4 ${((threshold - 0.5) / 0.5) * 100}%, rgba(255,255,255,0.1) ${((threshold - 0.5) / 0.5) * 100}%)` }}
        />
      </div>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={loading}
        className="btn-gradient w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ letterSpacing: "0.08em", boxShadow: "0 0 20px rgba(99,102,241,0.25)" }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Search size={16} />
        )}
        {loading ? "Scanning Latent Space…" : "Run Retrieval"}
      </button>

      {/* Stats */}
      <div
        className="pt-4 space-y-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {[["Query Latency", "23ms"], ["Index Size", "15,588"], ["Embed Dim", "256-D"]].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-[9px] font-black text-slate-600 uppercase" style={{ letterSpacing: "0.12em" }}>{k}</span>
            <span className="text-[10px] font-bold text-slate-400">{v}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ResultCard({ result, delay }) {
  const [hovered, setHovered] = useState(false);
  const simColor =
    result.similarity > 0.9 ? "#10B981" :
    result.similarity > 0.85 ? "#F59E0B" : "#EF4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{ y: hovered ? -6 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <GlassCard
          className="p-3 flex flex-col gap-3 cursor-pointer"
          style={hovered ? { borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 12px 40px rgba(99,102,241,0.15)" } : {}}
        >
          {/* Image placeholder */}
          <div
            className={`relative w-full aspect-square rounded-xl bg-gradient-to-br ${result.gradient} overflow-hidden`}
          >
            {/* Rank badge */}
            <div
              className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-black"
              style={{ background: "rgba(0,0,0,0.45)", color: "white", letterSpacing: "0.06em" }}
            >
              #{result.rank}
            </div>
            {/* Domain badge */}
            <div className="absolute top-1.5 right-1.5">
              <Badge color={DOMAIN_BADGE_COLOR[result.domain]}>{result.domain}</Badge>
            </div>

            {/* Hover overlay */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 gap-1"
                  style={{ background: "rgba(0,0,0,0.72)" }}
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase" style={{ letterSpacing: "0.12em" }}>Feature Dist.</span>
                  <span className="text-lg font-black text-white">{(1 - result.similarity).toFixed(3)}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase" style={{ letterSpacing: "0.12em" }}>Rank</span>
                  <span className="text-sm font-black text-indigo-300">{result.rank} / 15,588</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata */}
          <div className="flex-grow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100">{result.className}</span>
              {result.correct
                ? <span className="text-[9px] font-black text-emerald-400">✓ MATCH</span>
                : <span className="text-[9px] font-black text-rose-400">✗ WRONG</span>
              }
            </div>
            <span className="text-[10px] text-slate-500">{result.domain}</span>

            {/* Similarity bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase" style={{ letterSpacing: "0.1em" }}>
                <span>Cosine Sim.</span>
                <span style={{ color: simColor }}>{result.similarity.toFixed(3)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.similarity * 100}%` }}
                  transition={{ duration: 0.6, delay: delay + 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: simColor }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

export default function RetrievalPage() {
  const [domain, setDomain] = useState("All");
  const [threshold, setThreshold] = useState(0.75);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [ran, setRan] = useState(false);

  const runRetrieval = () => {
    setLoading(true);
    setResults([]);
    setRan(false);
    setTimeout(() => {
      setResults(RETRIEVAL_RESULTS);
      setLoading(false);
      setRan(true);
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="h-full flex flex-col space-y-6"
    >
      <SectionTitle accent="cyan">Retrieval Engine</SectionTitle>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
        {/* Query panel */}
        <div className="lg:col-span-1">
          <QueryPanel
            domain={domain} setDomain={setDomain}
            threshold={threshold} setThreshold={setThreshold}
            onRun={runRetrieval} loading={loading}
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">Top-5 Retrieved Matches</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Ranked by cosine similarity in 256-D embedding space</p>
            </div>
            {ran && (
              <div className="flex gap-2 flex-wrap">
                {[["P@1", "100%", "green"], ["P@3", "66.7%", "cyan"], ["P@5", "80%", "indigo"], ["AP", "0.847", "amber"]].map(([k, v, c]) => (
                  <GlassCard key={k} className="px-3 py-2 flex flex-col items-center" style={{ minWidth: 68, borderRadius: 12 }}>
                    <span className="text-[8px] font-black uppercase text-slate-500" style={{ letterSpacing: "0.12em" }}>{k}</span>
                    <span className={`text-sm font-black text-${c}-400`}>{v}</span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Result grid */}
          <div className="flex-grow">
            {!ran && !loading && (
              <GlassCard className="h-64 flex flex-col items-center justify-center gap-4 text-slate-700" style={{ borderStyle: "dashed" }}>
                <Search size={36} className="opacity-30" />
                <p className="text-[10px] font-black uppercase" style={{ letterSpacing: "0.25em" }}>
                  Configure & Run Retrieval
                </p>
              </GlassCard>
            )}

            {loading && (
              <GlassCard className="h-64 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase text-indigo-400 animate-pulse" style={{ letterSpacing: "0.25em" }}>
                  Scanning 15,588 Embeddings…
                </p>
              </GlassCard>
            )}

            {ran && !loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                <AnimatePresence>
                  {results.map((r, i) => (
                    <ResultCard key={r.rank} result={r} delay={i * 0.08} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
