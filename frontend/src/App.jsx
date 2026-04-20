import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sidebar, TopBar } from "./components/layout/Layout.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import EDAPage from "./pages/EDAPage.jsx";
import TrainingPage from "./pages/TrainingPage.jsx";
import RetrievalPage from "./pages/RetrievalPage.jsx";
import EmbeddingsPage from "./pages/EmbeddingsPage.jsx";

const PAGES = {
  overview: OverviewPage,
  eda: EDAPage,
  training: TrainingPage,
  retrieval: RetrievalPage,
  embeddings: EmbeddingsPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const PageComponent = PAGES[activeTab];

  return (
    <div style={{ display: "flex", width: "100dvw", height: "100dvh", overflow: "hidden", background: "#080B14", position: "relative" }}>
      {/* Ambient background glows */}
      <div
        style={{
          position: "absolute", top: "-15%", right: "-10%",
          width: "50%", height: "55%",
          background: "rgba(99,102,241,0.04)",
          filter: "blur(100px)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "-15%", left: "-8%",
          width: "45%", height: "50%",
          background: "rgba(6,182,212,0.04)",
          filter: "blur(100px)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <TopBar activeTab={activeTab} />

        <main
          className="custom-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px",
          }}
        >
          <AnimatePresence mode="wait">
            <PageComponent key={activeTab} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
