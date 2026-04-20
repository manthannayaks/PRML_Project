// Centralized mock data — all project stats, chart data, and results
// Replace these with live API calls when FastAPI backend is ready

export const DOMAINS = ["Art", "Clipart", "Product", "Real World"];

export const DOMAIN_COLORS = {
  Art: "#6366F1",
  Clipart: "#06B6D4",
  Product: "#10B981",
  "Real World": "#F59E0B",
};

export const OVERVIEW_STATS = [
  {
    id: 1,
    label: "Mean Average Precision",
    value: 73.4,
    suffix: "%",
    trend: "↑ 12.3% vs. baseline",
    iconName: "Target",
    color: "indigo",
    description: "Cross-domain mAP (DANN best model)",
  },
  {
    id: 2,
    label: "Best Performing Backbone",
    value: "ResNet-50",
    type: "text",
    iconName: "Cpu",
    color: "cyan",
    description: "DANN + GRL Architecture",
  },
  {
    id: 3,
    label: "Office-Home Categories",
    value: 65,
    iconName: "LayoutGrid",
    color: "amber",
    description: "4 Domains · 15,588 Images",
  },
  {
    id: 4,
    label: "Adversarial Training Gain",
    value: 38.7,
    suffix: "%",
    iconName: "Zap",
    color: "green",
    description: "vs. source-only baseline",
  },
];

export const TRANSFER_MATRIX = {
  rows: DOMAINS,
  cols: DOMAINS,
  values: [
    [null, "62.4%", "78.1%", "71.5%"],
    ["58.2%", null, "75.6%", "68.9%"],
    ["79.4%", "81.2%", null, "82.5%"],
    ["72.1%", "74.5%", "80.3%", null],
  ],
};

export const EDA_DOMAIN_DATA = [
  { name: "Art", count: 2427 },
  { name: "Clipart", count: 4365 },
  { name: "Product", count: 4439 },
  { name: "Real World", count: 4357 },
];

export const EDA_CLASS_DATA = [
  { name: "Chair", count: 260 },
  { name: "Bed", count: 245 },
  { name: "Table", count: 230 },
  { name: "Backpack", count: 215 },
  { name: "Bottle", count: 205 },
  { name: "Calculator", count: 198 },
  { name: "Bike", count: 185 },
  { name: "Computer", count: 178 },
  { name: "Batteries", count: 170 },
  { name: "Alarm Clock", count: 165 },
  { name: "Drill", count: 158 },
  { name: "Fan", count: 152 },
  { name: "Eraser", count: 145 },
  { name: "Clipper", count: 138 },
  { name: "Calendar", count: 130 },
];

export const TRAINING_EPOCHS = Array.from({ length: 30 }, (_, i) => ({
  epoch: i + 1,
  trainLoss: parseFloat((2.1 * Math.exp(-i / 9) + 0.22).toFixed(4)),
  valLoss: parseFloat((2.25 * Math.exp(-i / 11) + 0.38).toFixed(4)),
  domainLoss: parseFloat((0.85 * Math.exp(-i / 14) + 0.12).toFixed(4)),
  trainAcc: parseFloat((29 + 45 * (1 - Math.exp(-i / 9))).toFixed(2)),
  valAcc: parseFloat((27 + 43 * (1 - Math.exp(-i / 11))).toFixed(2)),
}));

export const MODEL_COMPARISON = [
  {
    method: "DANN",
    backbone: "ResNet-50",
    map: 73.4,
    acc: 71.2,
    p5: 68.9,
    adapt: "GRL",
    params: "25.6M",
    status: "Best",
  },
  {
    method: "DANN",
    backbone: "VGG16-BN",
    map: 69.8,
    acc: 67.5,
    p5: 65.1,
    adapt: "GRL",
    params: "138M",
    status: "Good",
  },
  {
    method: "Source Only",
    backbone: "ResNet-50",
    map: 61.1,
    acc: 58.9,
    p5: 55.4,
    adapt: "None",
    params: "25.6M",
    status: "Baseline",
  },
  {
    method: "DANN",
    backbone: "DenseNet-121",
    map: 70.5,
    acc: 68.8,
    p5: 66.2,
    adapt: "GRL",
    params: "8M",
    status: "Good",
  },
  {
    method: "Source Only",
    backbone: "VGG16-BN",
    map: 58.3,
    acc: 56.1,
    p5: 52.7,
    adapt: "None",
    params: "138M",
    status: "Baseline",
  },
];

export const RETRIEVAL_RESULTS = [
  {
    rank: 1,
    domain: "Art",
    similarity: 0.947,
    className: "Backpack",
    correct: true,
    gradient: "from-indigo-600 via-indigo-700 to-purple-800",
  },
  {
    rank: 2,
    domain: "Clipart",
    similarity: 0.921,
    className: "Backpack",
    correct: true,
    gradient: "from-cyan-600 via-cyan-700 to-sky-800",
  },
  {
    rank: 3,
    domain: "Product",
    similarity: 0.889,
    className: "Backpack",
    correct: true,
    gradient: "from-emerald-600 via-emerald-700 to-teal-800",
  },
  {
    rank: 4,
    domain: "Real World",
    similarity: 0.856,
    className: "Chair",
    correct: false,
    gradient: "from-amber-600 via-amber-700 to-orange-800",
  },
  {
    rank: 5,
    domain: "Art",
    similarity: 0.812,
    className: "Backpack",
    correct: true,
    gradient: "from-rose-600 via-rose-700 to-pink-800",
  },
];

export const EMBEDDING_STATS = [
  { label: "Silhouette Score", value: "0.634", color: "indigo", pct: 63 },
  { label: "Davies-Bouldin Index", value: "0.821", color: "cyan", pct: 82 },
  { label: "Cluster Purity", value: "78.3%", color: "green", pct: 78 },
  { label: "Inter-domain Dist.", value: "4.21", color: "amber", pct: 55 },
];
