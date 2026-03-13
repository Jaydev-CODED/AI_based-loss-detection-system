export const inventoryData = [
  { id: "PRD-001", name: "Wireless Mouse", category: "Electronics", stockIn: 500, stockOut: 120, currentStock: 380, status: "Normal", warehouse: "WH-A" },
  { id: "PRD-002", name: "USB-C Hub", category: "Electronics", stockIn: 300, stockOut: 95, currentStock: 185, status: "Warning", warehouse: "WH-B" },
  { id: "PRD-003", name: "LED Monitor 27\"", category: "Displays", stockIn: 200, stockOut: 180, currentStock: 20, status: "Critical", warehouse: "WH-A" },
  { id: "PRD-004", name: "Mechanical Keyboard", category: "Electronics", stockIn: 450, stockOut: 200, currentStock: 250, status: "Normal", warehouse: "WH-C" },
  { id: "PRD-005", name: "Webcam HD", category: "Accessories", stockIn: 600, stockOut: 350, currentStock: 250, status: "Normal", warehouse: "WH-B" },
  { id: "PRD-006", name: "Laptop Stand", category: "Accessories", stockIn: 150, stockOut: 140, currentStock: 10, status: "Critical", warehouse: "WH-A" },
  { id: "PRD-007", name: "Noise Cancelling Headset", category: "Audio", stockIn: 350, stockOut: 100, currentStock: 250, status: "Normal", warehouse: "WH-C" },
  { id: "PRD-008", name: "Docking Station", category: "Electronics", stockIn: 200, stockOut: 90, currentStock: 100, status: "Warning", warehouse: "WH-B" },
];

export const lossDetectionData = [
  { product: "USB-C Hub", expected: 205, actual: 185, loss: 20, level: "warning" as const },
  { product: "LED Monitor 27\"", expected: 45, actual: 20, loss: 25, level: "critical" as const },
  { product: "Laptop Stand", expected: 30, actual: 10, loss: 20, level: "critical" as const },
  { product: "Docking Station", expected: 115, actual: 100, loss: 15, level: "warning" as const },
  { product: "Wireless Mouse", expected: 385, actual: 380, loss: 5, level: "warning" as const },
];

export const alertsData = [
  { id: 1, message: "Critical stock loss detected for LED Monitor 27\"", timestamp: "2026-03-13 14:32", level: "critical" as const },
  { id: 2, message: "Warning: USB-C Hub stock below expected threshold", timestamp: "2026-03-13 13:15", level: "warning" as const },
  { id: 3, message: "Laptop Stand inventory anomaly detected by AI", timestamp: "2026-03-13 11:45", level: "critical" as const },
  { id: 4, message: "Docking Station minor discrepancy flagged", timestamp: "2026-03-12 22:10", level: "warning" as const },
  { id: 5, message: "System scan completed — 3 anomalies found", timestamp: "2026-03-12 18:00", level: "warning" as const },
  { id: 6, message: "Wireless Mouse stock variance within tolerance", timestamp: "2026-03-12 09:30", level: "warning" as const },
];

export const inventoryLevelsChart = [
  { month: "Oct", stock: 2800 },
  { month: "Nov", stock: 3100 },
  { month: "Dec", stock: 2600 },
  { month: "Jan", stock: 2900 },
  { month: "Feb", stock: 2400 },
  { month: "Mar", stock: 2100 },
];

export const stockMovementChart = [
  { month: "Oct", inbound: 800, outbound: 600 },
  { month: "Nov", inbound: 950, outbound: 700 },
  { month: "Dec", inbound: 600, outbound: 850 },
  { month: "Jan", inbound: 750, outbound: 680 },
  { month: "Feb", inbound: 700, outbound: 800 },
  { month: "Mar", inbound: 680, outbound: 750 },
];

export const lossDetectionChart = [
  { month: "Oct", losses: 12 },
  { month: "Nov", losses: 8 },
  { month: "Dec", losses: 22 },
  { month: "Jan", losses: 15 },
  { month: "Feb", losses: 28 },
  { month: "Mar", losses: 18 },
];

export const monthlyLossTrends = [
  { month: "Oct", value: 1200 },
  { month: "Nov", value: 850 },
  { month: "Dec", value: 2100 },
  { month: "Jan", value: 1500 },
  { month: "Feb", value: 2800 },
  { month: "Mar", value: 1900 },
];

export const topProductsLoss = [
  { name: "LED Monitor", loss: 25 },
  { name: "Laptop Stand", loss: 20 },
  { name: "USB-C Hub", loss: 20 },
  { name: "Docking Station", loss: 15 },
  { name: "Wireless Mouse", loss: 5 },
];
