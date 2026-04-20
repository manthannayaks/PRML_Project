// API service layer — swap mock data calls here for live FastAPI endpoints
// Base URL comes from Vite proxy config (vite.config.js → '/api' → localhost:8000)

const BASE_URL = "/api";

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Return null so callers can fall back to mock data
    return null;
  }
}

// ── Endpoints to implement in FastAPI ──────────────────────────────────────
// GET /api/overview       → { mAP, bestBackbone, numClasses, gainPct }
// GET /api/eda            → { domainCounts, classCounts }
// GET /api/training       → { epochs: [{trainLoss, valLoss, ...}] }
// GET /api/models         → [{ method, backbone, map, acc, ... }]
// GET /api/retrieval      → [{ rank, domain, similarity, className, correct }]
// GET /api/embeddings     → [{ x, y, domain }]
// ──────────────────────────────────────────────────────────────────────────

export const api = {
  getOverview: () => safeFetch(`${BASE_URL}/overview`),
  getEDA: () => safeFetch(`${BASE_URL}/eda`),
  getTraining: () => safeFetch(`${BASE_URL}/training`),
  getModels: () => safeFetch(`${BASE_URL}/models`),
  getRetrieval: (domain, threshold) =>
    safeFetch(`${BASE_URL}/retrieval?domain=${domain}&threshold=${threshold}`),
  getEmbeddings: (adapted) =>
    safeFetch(`${BASE_URL}/embeddings?adapted=${adapted}`),
};
