const inventoryData = [
  { id: "PRD-001", name: "Wireless Mouse", category: "Electronics", stockIn: 500, stockOut: 120, currentStock: 380, status: "Normal", warehouse: "WH-A" },
  { id: "PRD-002", name: "USB-C Hub", category: "Electronics", stockIn: 300, stockOut: 95, currentStock: 185, status: "Warning", warehouse: "WH-B" },
  { id: "PRD-003", name: "LED Monitor 27\"", category: "Displays", stockIn: 200, stockOut: 180, currentStock: 20, status: "Critical", warehouse: "WH-A" },
  { id: "PRD-004", name: "Mechanical Keyboard", category: "Electronics", stockIn: 450, stockOut: 200, currentStock: 250, status: "Normal", warehouse: "WH-C" },
  { id: "PRD-005", name: "Webcam HD", category: "Accessories", stockIn: 600, stockOut: 350, currentStock: 250, status: "Normal", warehouse: "WH-B" },
  { id: "PRD-006", name: "Laptop Stand", category: "Accessories", stockIn: 150, stockOut: 140, currentStock: 10, status: "Critical", warehouse: "WH-A" },
  { id: "PRD-007", name: "Noise Cancelling Headset", category: "Audio", stockIn: 350, stockOut: 100, currentStock: 250, status: "Normal", warehouse: "WH-C" },
  { id: "PRD-008", name: "Docking Station", category: "Electronics", stockIn: 200, stockOut: 90, currentStock: 100, status: "Warning", warehouse: "WH-B" },
];

const lossDetectionData = [
  { id: 1, product: "USB-C Hub", expected: 205, actual: 185, loss: 20, level: "warning" },
  { id: 2, product: "LED Monitor 27\"", expected: 45, actual: 20, loss: 25, level: "critical" },
  { id: 3, product: "Laptop Stand", expected: 30, actual: 10, loss: 20, level: "critical" },
  { id: 4, product: "Docking Station", expected: 115, actual: 100, loss: 15, level: "warning" },
  { id: 5, product: "Wireless Mouse", expected: 385, actual: 380, loss: 5, level: "warning" },
];

const alertsData = [
  { id: 1, message: "Critical stock loss detected for LED Monitor 27\"", timestamp: "2026-03-13 14:32", level: "critical" },
  { id: 2, message: "Warning: USB-C Hub stock below expected threshold", timestamp: "2026-03-13 13:15", level: "warning" },
  { id: 3, message: "Laptop Stand inventory anomaly detected by AI", timestamp: "2026-03-13 11:45", level: "critical" },
  { id: 4, message: "Docking Station minor discrepancy flagged", timestamp: "2026-03-12 22:10", level: "warning" },
  { id: 5, message: "System scan completed — 3 anomalies found", timestamp: "2026-03-12 18:00", level: "warning" },
  { id: 6, message: "Wireless Mouse stock variance within tolerance", timestamp: "2026-03-12 09:30", level: "warning" },
];

const inventoryLevelsChart = [
  { month: "Oct", stock: 2800 },
  { month: "Nov", stock: 3100 },
  { month: "Dec", stock: 2600 },
  { month: "Jan", stock: 2900 },
  { month: "Feb", stock: 2400 },
  { month: "Mar", stock: 2100 },
];

const stockMovementChart = [
  { month: "Oct", inbound: 800, outbound: 600 },
  { month: "Nov", inbound: 950, outbound: 700 },
  { month: "Dec", inbound: 600, outbound: 850 },
  { month: "Jan", inbound: 750, outbound: 680 },
  { month: "Feb", inbound: 700, outbound: 800 },
  { month: "Mar", inbound: 680, outbound: 750 },
];

const lossDetectionChart = [
  { month: "Oct", losses: 12 },
  { month: "Nov", losses: 8 },
  { month: "Dec", losses: 22 },
  { month: "Jan", losses: 15 },
  { month: "Feb", losses: 28 },
  { month: "Mar", losses: 18 },
];

const monthlyLossTrends = [
  { month: "Oct", value: 1200 },
  { month: "Nov", value: 850 },
  { month: "Dec", value: 2100 },
  { month: "Jan", value: 1500 },
  { month: "Feb", value: 2800 },
  { month: "Mar", value: 1900 },
];

const topProductsLoss = [
  { name: "LED Monitor", loss: 25 },
  { name: "Laptop Stand", loss: 20 },
  { name: "USB-C Hub", loss: 20 },
  { name: "Docking Station", loss: 15 },
  { name: "Wireless Mouse", loss: 5 },
];

// Analytics data
const stockTurnoverData = [
  { month: "Oct", turnover: 2.1 },
  { month: "Nov", turnover: 2.4 },
  { month: "Dec", turnover: 3.1 },
  { month: "Jan", turnover: 2.6 },
  { month: "Feb", turnover: 2.9 },
  { month: "Mar", turnover: 3.3 },
];

const demandTrendsData = [
  { month: "Oct", electronics: 320, displays: 80, accessories: 200, audio: 90 },
  { month: "Nov", electronics: 380, displays: 95, accessories: 240, audio: 110 },
  { month: "Dec", electronics: 290, displays: 120, accessories: 310, audio: 85 },
  { month: "Jan", electronics: 350, displays: 70, accessories: 190, audio: 105 },
  { month: "Feb", electronics: 410, displays: 110, accessories: 280, audio: 120 },
  { month: "Mar", electronics: 370, displays: 90, accessories: 250, audio: 95 },
];

const monthlyUsageData = [
  { month: "Oct", usage: 72 },
  { month: "Nov", usage: 68 },
  { month: "Dec", usage: 81 },
  { month: "Jan", usage: 75 },
  { month: "Feb", usage: 85 },
  { month: "Mar", usage: 79 },
];

// Prevention recommendations
const preventionRecommendations = [
  { id: 1, title: "Adjust Restock Limit for LED Monitor", description: "Current restock threshold is too high. Reduce from 50 to 30 units to prevent overstock and potential shrinkage.", priority: "high", category: "Restocking" },
  { id: 2, title: "Increase Reorder Level for Webcam HD", description: "High demand trend detected. Increase reorder point from 100 to 150 units to avoid stockouts.", priority: "medium", category: "Reorder" },
  { id: 3, title: "Investigate Laptop Stand Losses", description: "Pattern suggests possible misplacement or theft in WH-A Zone 3. Recommend CCTV review and cycle count.", priority: "critical", category: "Theft Prevention" },
  { id: 4, title: "Reduce Stock for Docking Station", description: "Slow-moving product with 45% turnover rate. Consider reducing stock by 20% to minimize holding costs.", priority: "low", category: "Optimization" },
  { id: 5, title: "Abnormal Activity Alert: WH-A", description: "Unusual stock movements detected during off-hours (2AM-5AM). Review employee access logs for March 10-12.", priority: "critical", category: "Employee Activity" },
  { id: 6, title: "Set Dynamic Reorder Threshold", description: "Implement AI-based dynamic reorder points that adjust with seasonal demand patterns.", priority: "medium", category: "Automation" },
];

// Product tracking data
const productTrackingData = [
  {
    productId: "PRD-003",
    name: "LED Monitor 27\"",
    warehouse: "WH-A",
    zone: "Zone 3, Rack B-12",
    timeline: [
      { date: "2026-03-01 09:00", event: "Product Added", type: "added", details: "Initial stock: 200 units received from supplier" },
      { date: "2026-03-03 14:30", event: "Stock Movement", type: "movement", details: "50 units moved to retail distribution" },
      { date: "2026-03-06 11:15", event: "Shipment Update", type: "shipment", details: "30 units shipped to partner warehouse WH-B" },
      { date: "2026-03-08 16:45", event: "Stock Movement", type: "movement", details: "80 units allocated for online orders" },
      { date: "2026-03-10 08:20", event: "Loss Detected", type: "loss", details: "AI flagged 25 unit discrepancy — anomaly investigation initiated" },
      { date: "2026-03-12 13:00", event: "Stock Movement", type: "movement", details: "20 units moved to clearance section" },
    ],
  },
  {
    productId: "PRD-006",
    name: "Laptop Stand",
    warehouse: "WH-A",
    zone: "Zone 1, Rack A-05",
    timeline: [
      { date: "2026-02-20 10:00", event: "Product Added", type: "added", details: "Initial stock: 150 units received" },
      { date: "2026-02-25 09:30", event: "Stock Movement", type: "movement", details: "60 units shipped to regional distributor" },
      { date: "2026-03-02 15:00", event: "Shipment Update", type: "shipment", details: "40 units express shipped to e-commerce fulfillment" },
      { date: "2026-03-07 11:00", event: "Stock Movement", type: "movement", details: "30 units moved for corporate bulk order" },
      { date: "2026-03-09 22:30", event: "Loss Detected", type: "loss", details: "AI flagged 20 unit discrepancy — possible misplacement in Zone 1" },
    ],
  },
  {
    productId: "PRD-001",
    name: "Wireless Mouse",
    warehouse: "WH-A",
    zone: "Zone 2, Rack C-08",
    timeline: [
      { date: "2026-02-15 08:00", event: "Product Added", type: "added", details: "Initial stock: 500 units from manufacturer" },
      { date: "2026-02-22 14:00", event: "Stock Movement", type: "movement", details: "50 units to retail partners" },
      { date: "2026-03-01 10:30", event: "Shipment Update", type: "shipment", details: "40 units shipped to WH-C" },
      { date: "2026-03-08 16:00", event: "Stock Movement", type: "movement", details: "30 units for promotional event" },
    ],
  },
];

// Risk scores
const riskScoreData = [
  { id: "PRD-003", name: "LED Monitor 27\"", riskScore: 92, trend: "up", factors: ["High loss rate", "Warehouse anomaly", "Low stock"] },
  { id: "PRD-006", name: "Laptop Stand", riskScore: 87, trend: "up", factors: ["Pattern match: theft", "Off-hours activity", "Repeat loss"] },
  { id: "PRD-002", name: "USB-C Hub", riskScore: 64, trend: "stable", factors: ["Moderate discrepancy", "Supply chain delay"] },
  { id: "PRD-008", name: "Docking Station", riskScore: 51, trend: "down", factors: ["Minor variance", "Slow movement"] },
  { id: "PRD-001", name: "Wireless Mouse", riskScore: 23, trend: "down", factors: ["Within tolerance"] },
  { id: "PRD-005", name: "Webcam HD", riskScore: 15, trend: "stable", factors: ["Healthy stock levels"] },
  { id: "PRD-004", name: "Mechanical Keyboard", riskScore: 12, trend: "down", factors: ["No anomalies"] },
  { id: "PRD-007", name: "Noise Cancelling Headset", riskScore: 8, trend: "stable", factors: ["Low risk"] },
];

// Predictive restocking
const predictiveRestockData = [
  { id: "PRD-003", name: "LED Monitor 27\"", currentStock: 20, dailyUsage: 6.0, daysUntilEmpty: 3, suggestedOrder: 180, urgency: "critical" },
  { id: "PRD-006", name: "Laptop Stand", currentStock: 10, dailyUsage: 4.7, daysUntilEmpty: 2, suggestedOrder: 140, urgency: "critical" },
  { id: "PRD-008", name: "Docking Station", currentStock: 100, dailyUsage: 3.0, daysUntilEmpty: 33, suggestedOrder: 90, urgency: "normal" },
  { id: "PRD-002", name: "USB-C Hub", currentStock: 185, dailyUsage: 3.2, daysUntilEmpty: 58, suggestedOrder: 0, urgency: "normal" },
  { id: "PRD-005", name: "Webcam HD", currentStock: 250, dailyUsage: 11.7, daysUntilEmpty: 21, suggestedOrder: 100, urgency: "warning" },
];

// Warehouse heatmap
const warehouseHeatmapData = [
  { zone: "A-1", warehouse: "WH-A", lossCount: 12, intensity: 0.9 },
  { zone: "A-2", warehouse: "WH-A", lossCount: 3, intensity: 0.25 },
  { zone: "A-3", warehouse: "WH-A", lossCount: 15, intensity: 1.0 },
  { zone: "A-4", warehouse: "WH-A", lossCount: 1, intensity: 0.08 },
  { zone: "B-1", warehouse: "WH-B", lossCount: 5, intensity: 0.4 },
  { zone: "B-2", warehouse: "WH-B", lossCount: 8, intensity: 0.6 },
  { zone: "B-3", warehouse: "WH-B", lossCount: 2, intensity: 0.15 },
  { zone: "B-4", warehouse: "WH-B", lossCount: 0, intensity: 0.0 },
  { zone: "C-1", warehouse: "WH-C", lossCount: 1, intensity: 0.08 },
  { zone: "C-2", warehouse: "WH-C", lossCount: 0, intensity: 0.0 },
  { zone: "C-3", warehouse: "WH-C", lossCount: 4, intensity: 0.3 },
  { zone: "C-4", warehouse: "WH-C", lossCount: 0, intensity: 0.0 },
];

// AI Recommendations
const aiRecommendations = [
  { icon: "📉", title: "Reduce Stock: Docking Station", description: "Slow-moving product with low turnover. Reduce stock by 20% to save $2,400/month in holding costs.", impact: "Save $2,400/mo" },
  { icon: "📈", title: "Increase Reorder: Webcam HD", description: "High demand trend detected. Increase reorder level from 100 to 150 to prevent stockouts.", impact: "Prevent $5K loss" },
  { icon: "🔒", title: "Security Review: WH-A Zone 3", description: "Repeated losses in this zone suggest unauthorized access. Recommend access control audit.", impact: "Reduce losses 40%" },
  { icon: "🔄", title: "Optimize Rotation: Electronics", description: "FIFO compliance is at 72%. Implementing strict rotation could reduce expiry-related losses.", impact: "Save $1,800/mo" },
  { icon: "📦", title: "Consolidate: WH-B Accessories", description: "Low-volume accessories spread across 4 zones. Consolidating would reduce picking errors by 25%.", impact: "Reduce errors 25%" },
];

// Orders
let ordersData = [];

// Settings
let settingsData = {
  profile: { fullName: "Admin User", email: "admin@invenguard.ai", role: "System Administrator", timezone: "UTC+5:30" },
  notifications: { emailAlerts: true, pushAlerts: true, criticalOnly: false },
  system: { aiAutoDetection: true, dataRetention: true, emailNotifications: true },
  thresholds: { criticalStock: 20, warningStock: 100, autoOrderEnabled: false }
};

module.exports = {
  inventoryData,
  lossDetectionData,
  alertsData,
  inventoryLevelsChart,
  stockMovementChart,
  lossDetectionChart,
  monthlyLossTrends,
  topProductsLoss,
  stockTurnoverData,
  demandTrendsData,
  monthlyUsageData,
  preventionRecommendations,
  productTrackingData,
  riskScoreData,
  predictiveRestockData,
  warehouseHeatmapData,
  aiRecommendations,
  ordersData,
  settingsData,
};
