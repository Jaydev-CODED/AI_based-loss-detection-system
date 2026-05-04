const express = require('express');
const cors = require('cors');
const data = require('./data');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper for simulating network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get current timestamp
const now = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

// ─────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────

app.get('/api/inventory', async (req, res) => {
  await delay();
  res.json(data.inventoryData);
});

app.post('/api/inventory', async (req, res) => {
  await delay();
  const newProduct = req.body;
  if (!newProduct.name || !newProduct.category || !newProduct.warehouse) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = `PRD-${Math.floor(100 + Math.random() * 900)}`;
  const currentStock = Number(newProduct.stockIn) - Number(newProduct.stockOut);
  let status = "Normal";
  if (currentStock <= 20) status = "Critical";
  else if (currentStock <= 100) status = "Warning";
  const product = { id, name: newProduct.name, category: newProduct.category, stockIn: Number(newProduct.stockIn), stockOut: Number(newProduct.stockOut), currentStock, status, warehouse: newProduct.warehouse };
  data.inventoryData.push(product);

  // Also create a tracking entry
  data.productTrackingData.push({
    productId: id,
    name: product.name,
    warehouse: product.warehouse,
    zone: "Pending Assignment",
    timeline: [{ date: now(), event: "Product Added", type: "added", details: `Initial stock: ${currentStock} units added to ${product.warehouse}` }]
  });

  res.status(201).json(product);
});

app.put('/api/inventory/:id', async (req, res) => {
  await delay();
  const index = data.inventoryData.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });
  const updated = { ...data.inventoryData[index], ...req.body };
  // Recalculate status
  if (updated.currentStock <= 20) updated.status = "Critical";
  else if (updated.currentStock <= 100) updated.status = "Warning";
  else updated.status = "Normal";
  data.inventoryData[index] = updated;
  res.json(updated);
});

app.delete('/api/inventory/:id', async (req, res) => {
  await delay();
  data.inventoryData = data.inventoryData.filter(p => p.id !== req.params.id);
  data.productTrackingData = data.productTrackingData.filter(p => p.productId !== req.params.id);
  res.status(204).send();
});

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

app.get('/api/orders', async (req, res) => {
  await delay();
  res.json(data.ordersData);
});

app.post('/api/orders', async (req, res) => {
  await delay();
  const { productId, quantity, warehouse, supplier, notes } = req.body;
  if (!productId || !quantity) return res.status(400).json({ error: "productId and quantity are required" });

  const productIndex = data.inventoryData.findIndex(p => p.id === productId);
  if (productIndex === -1) return res.status(404).json({ error: "Product not found in inventory" });

  const product = data.inventoryData[productIndex];
  product.stockIn += Number(quantity);
  product.currentStock += Number(quantity);
  if (product.currentStock <= 20) product.status = "Critical";
  else if (product.currentStock <= 100) product.status = "Warning";
  else product.status = "Normal";

  const orderId = `ORD-${Date.now()}`;
  const order = {
    id: orderId,
    productId,
    productName: product.name,
    quantity: Number(quantity),
    warehouse: warehouse || product.warehouse,
    supplier: supplier || "Default Supplier",
    notes: notes || "",
    status: "confirmed",
    timestamp: now()
  };
  data.ordersData.push(order);

  // Append to tracking timeline
  const trackingIndex = data.productTrackingData.findIndex(p => p.productId === productId);
  const event = { date: now(), event: "Order Placed", type: "added", details: `${quantity} units ordered (Order ${orderId}). ${notes ? 'Note: ' + notes : ''}` };
  if (trackingIndex !== -1) {
    data.productTrackingData[trackingIndex].timeline.push(event);
  } else {
    data.productTrackingData.push({ productId: product.id, name: product.name, warehouse: warehouse || product.warehouse, zone: "Pending Assignment", timeline: [event] });
  }

  // Add alert
  data.alertsData.unshift({ id: Date.now(), message: `Order ${orderId}: ${quantity} units of ${product.name} confirmed`, timestamp: now(), level: "warning" });

  res.status(201).json({ order, product });
});

// Receive / confirm delivery of a placed order
app.patch('/api/orders/:id/receive', async (req, res) => {
  await delay();
  const order = data.ordersData.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status === 'received') return res.status(400).json({ error: "Order already received" });

  const { receivedQty, notes } = req.body;
  const actualQty = Number(receivedQty) || order.quantity;
  const diff = order.quantity - actualQty; // positive = shortage

  order.status = 'received';
  order.receivedAt = now();
  order.receivedQty = actualQty;

  // Add shipment received event to tracking
  const trackingIndex = data.productTrackingData.findIndex(p => p.productId === order.productId);
  const event = {
    date: now(),
    event: "Shipment Received",
    type: "shipment",
    details: `${actualQty} of ${order.quantity} units received from ${order.supplier}. ${notes ? 'Note: ' + notes : ''}${diff > 0 ? ` ⚠️ ${diff} unit shortage detected.` : ''}`
  };
  if (trackingIndex !== -1) data.productTrackingData[trackingIndex].timeline.push(event);

  // If there's a shortage, auto-create a loss detection entry
  if (diff > 0) {
    const product = data.inventoryData.find(p => p.id === order.productId);
    const newId = Math.max(0, ...data.lossDetectionData.map(l => l.id)) + 1;
    data.lossDetectionData.push({
      id: newId,
      product: order.productName,
      expected: order.quantity,
      actual: actualQty,
      loss: diff,
      level: diff >= 10 ? 'critical' : 'warning',
      source: 'delivery_shortage',
      orderId: order.id
    });
    // Adjust inventory (remove the units that didn't arrive)
    if (product) {
      product.stockIn -= diff;
      product.currentStock -= diff;
      if (product.currentStock <= 20) product.status = "Critical";
      else if (product.currentStock <= 100) product.status = "Warning";
      else product.status = "Normal";
    }
    data.alertsData.unshift({ id: Date.now(), message: `Delivery shortage for ${order.productName}: ${diff} units missing on arrival (Order ${order.id})`, timestamp: now(), level: 'critical' });
  } else {
    data.alertsData.unshift({ id: Date.now(), message: `Order ${order.id} received: ${actualQty} units of ${order.productName} delivered successfully`, timestamp: now(), level: 'warning' });
  }

  res.json({ order });
});


// ─────────────────────────────────────────────
// LOSS DETECTION
// ─────────────────────────────────────────────

app.get('/api/loss-detection', async (req, res) => {
  await delay();
  res.json({ table: data.lossDetectionData, chart: data.lossDetectionChart });
});

app.put('/api/loss-detection/:id/resolve', async (req, res) => {
  await delay();
  const id = Number(req.params.id);
  const index = data.lossDetectionData.findIndex(l => l.id === id);
  if (index === -1) return res.status(404).json({ error: "Anomaly not found" });
  const [resolved] = data.lossDetectionData.splice(index, 1);
  // Add a resolution alert
  data.alertsData.unshift({ id: Date.now(), message: `Anomaly resolved: ${resolved.product} loss of ${resolved.loss} units marked as investigated`, timestamp: now(), level: "warning" });
  res.json({ message: "Anomaly resolved", resolved });
});

// Manually report a stock discrepancy
app.post('/api/loss-detection', async (req, res) => {
  await delay();
  const { productId, expected, actual, notes } = req.body;
  if (!productId || expected === undefined || actual === undefined) {
    return res.status(400).json({ error: "productId, expected and actual are required" });
  }
  const product = data.inventoryData.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const loss = Number(expected) - Number(actual);
  if (loss <= 0) return res.status(400).json({ error: "Actual cannot exceed expected — use inventory edit to increase stock" });

  const newId = Math.max(0, ...data.lossDetectionData.map(l => l.id)) + 1;
  const entry = {
    id: newId,
    product: product.name,
    expected: Number(expected),
    actual: Number(actual),
    loss,
    level: loss >= 15 ? 'critical' : 'warning',
    source: 'manual_report',
    notes: notes || ''
  };
  data.lossDetectionData.push(entry);

  // Update actual inventory
  product.currentStock = Number(actual);
  if (product.currentStock <= 20) product.status = "Critical";
  else if (product.currentStock <= 100) product.status = "Warning";
  else product.status = "Normal";

  // Tracking event
  const trackingIndex = data.productTrackingData.findIndex(p => p.productId === productId);
  const event = { date: now(), event: "Loss Detected", type: "loss", details: `Manual report: ${loss} unit discrepancy detected. Expected ${expected}, found ${actual}. ${notes || ''}` };
  if (trackingIndex !== -1) data.productTrackingData[trackingIndex].timeline.push(event);

  // Alert
  data.alertsData.unshift({ id: Date.now(), message: `Manual loss report: ${product.name} — ${loss} units missing (Expected: ${expected}, Actual: ${actual})`, timestamp: now(), level: entry.level });

  res.status(201).json(entry);
});

// ─────────────────────────────────────────────
// STOCK AUDIT
// ─────────────────────────────────────────────

app.post('/api/audit', async (req, res) => {
  await delay();
  const { items } = req.body; // [{ productId, physicalCount }]
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "items array required" });

  const results = [];
  for (const item of items) {
    const product = data.inventoryData.find(p => p.id === item.productId);
    if (!product) continue;

    const expected = product.currentStock;
    const actual = Number(item.physicalCount);
    const diff = expected - actual;

    let status = 'ok';
    if (diff > 0) status = diff >= 10 ? 'loss_critical' : 'loss_warning';
    else if (diff < 0) status = 'surplus';

    if (diff > 0) {
      // Create loss entry
      const newId = Math.max(0, ...data.lossDetectionData.map(l => l.id)) + 1;
      data.lossDetectionData.push({
        id: newId,
        product: product.name,
        expected,
        actual,
        loss: diff,
        level: diff >= 10 ? 'critical' : 'warning',
        source: 'stock_audit'
      });
      // Tracking
      const tIdx = data.productTrackingData.findIndex(p => p.productId === item.productId);
      const ev = { date: now(), event: "Loss Detected", type: "loss", details: `Stock audit: ${diff} unit discrepancy. System: ${expected}, Physical: ${actual}` };
      if (tIdx !== -1) data.productTrackingData[tIdx].timeline.push(ev);
      // Alert
      data.alertsData.unshift({ id: Date.now(), message: `Stock audit loss: ${product.name} — ${diff} units unaccounted (${expected} expected, ${actual} found)`, timestamp: now(), level: diff >= 10 ? 'critical' : 'warning' });
    }

    // Update actual stock to physical count
    product.currentStock = actual;
    if (product.currentStock <= 20) product.status = "Critical";
    else if (product.currentStock <= 100) product.status = "Warning";
    else product.status = "Normal";

    results.push({ productId: item.productId, name: product.name, expected, actual, diff, status });
  }

  res.status(201).json({ results, auditedAt: now() });
});

// ─────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────

app.get('/api/alerts', async (req, res) => {
  await delay();
  res.json(data.alertsData);
});

app.put('/api/alerts/:id/read', async (req, res) => {
  await delay();
  const id = Number(req.params.id);
  const alert = data.alertsData.find(a => a.id === id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  alert.read = true;
  res.json(alert);
});

app.delete('/api/alerts/:id', async (req, res) => {
  await delay();
  data.alertsData = data.alertsData.filter(a => a.id !== Number(req.params.id));
  res.status(204).send();
});

app.delete('/api/alerts', async (req, res) => {
  await delay();
  data.alertsData = [];
  res.status(204).send();
});

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

app.get('/api/dashboard', async (req, res) => {
  await delay();
  const totalProducts = data.inventoryData.length;
  const totalStock = data.inventoryData.reduce((sum, p) => sum + p.currentStock, 0);
  const lossEvents = data.lossDetectionData.length;
  const criticalCount = data.inventoryData.filter(p => p.status === "Critical").length;
  res.json({
    stats: { totalProducts, totalStock, lossEvents, criticalCount },
    inventoryLevels: data.inventoryLevelsChart,
    stockMovement: data.stockMovementChart,
    lossDetection: data.lossDetectionChart
  });
});

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

app.get('/api/analytics', async (req, res) => {
  await delay();
  res.json({ stockTurnover: data.stockTurnoverData, demandTrends: data.demandTrendsData, monthlyUsage: data.monthlyUsageData, monthlyLossTrends: data.monthlyLossTrends });
});

// ─────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────

app.get('/api/reports', async (req, res) => {
  await delay();

  // Dynamically compute topProductsLoss from live lossDetectionData
  const lossMap = {};
  data.lossDetectionData.forEach((l) => {
    lossMap[l.product] = (lossMap[l.product] || 0) + l.loss;
  });
  const topProductsLoss = Object.entries(lossMap)
    .map(([name, loss]) => ({ name, loss }))
    .sort((a, b) => b.loss - a.loss);

  // Dynamically compute live summary stats for the reports page
  const totalLossUnits = data.lossDetectionData.reduce((sum, l) => sum + l.loss, 0);
  const criticalCount = data.lossDetectionData.filter((l) => l.level === 'critical').length;
  const totalInventoryValue = data.inventoryData.reduce((sum, p) => sum + p.currentStock, 0);

  res.json({
    monthlyLossTrends: data.monthlyLossTrends,
    topProductsLoss,
    stockMovementChart: data.stockMovementChart,
    inventoryData: data.inventoryData,
    lossDetectionData: data.lossDetectionData,
    // Live summary stats
    summary: {
      totalLossUnits,
      totalAnomalies: data.lossDetectionData.length,
      criticalCount,
      totalInventoryValue,
      totalProducts: data.inventoryData.length
    }
  });
});


// ─────────────────────────────────────────────
// PREVENTION
// ─────────────────────────────────────────────

app.get('/api/prevention', async (req, res) => {
  await delay();
  res.json({ preventionRecommendations: data.preventionRecommendations, aiRecommendations: data.aiRecommendations });
});

app.post('/api/prevention/:id/apply', async (req, res) => {
  await delay();
  const id = Number(req.params.id);
  const index = data.preventionRecommendations.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: "Recommendation not found" });
  const [applied] = data.preventionRecommendations.splice(index, 1);
  data.alertsData.unshift({ id: Date.now(), message: `Prevention action applied: "${applied.title}"`, timestamp: now(), level: "warning" });
  res.json({ message: "Recommendation applied", applied });
});

app.delete('/api/prevention/:id', async (req, res) => {
  await delay();
  const id = Number(req.params.id);
  data.preventionRecommendations = data.preventionRecommendations.filter(r => r.id !== id);
  res.status(204).send();
});

app.post('/api/ai-recommendations/:index/apply', async (req, res) => {
  await delay();
  const idx = Number(req.params.index);
  if (idx < 0 || idx >= data.aiRecommendations.length) return res.status(404).json({ error: "Not found" });
  const [applied] = data.aiRecommendations.splice(idx, 1);
  data.alertsData.unshift({ id: Date.now(), message: `AI Recommendation applied: "${applied.title}"`, timestamp: now(), level: "warning" });
  res.json({ message: "Applied", applied });
});

// ─────────────────────────────────────────────
// TRACKING
// ─────────────────────────────────────────────

app.get('/api/tracking', async (req, res) => {
  await delay();
  res.json(data.productTrackingData);
});

app.post('/api/tracking/:productId/event', async (req, res) => {
  await delay();
  const { productId } = req.params;
  const { event, type, details } = req.body;
  const index = data.productTrackingData.findIndex(p => p.productId === productId);
  if (index === -1) return res.status(404).json({ error: "Product tracking not found" });
  const newEvent = { date: now(), event, type, details };
  data.productTrackingData[index].timeline.push(newEvent);
  res.status(201).json(newEvent);
});

// ─────────────────────────────────────────────
// ADVANCED (AI Risk, Predictive, Heatmap)
// ─────────────────────────────────────────────

app.get('/api/advanced', async (req, res) => {
  await delay();

  // Dynamically update predictive restock from live inventory
  const updatedPredictive = data.predictiveRestockData.map(item => {
    const product = data.inventoryData.find(p => p.id === item.id);
    if (!product) return item;
    const currentStock = product.currentStock;
    const daysUntilEmpty = item.dailyUsage > 0 ? Math.floor(currentStock / item.dailyUsage) : 999;
    const urgency = currentStock <= 20 ? 'critical' : currentStock <= 100 ? 'warning' : 'normal';
    return { ...item, currentStock, daysUntilEmpty, urgency };
  });

  // Dynamically update risk scores based on live loss data
  const updatedRisk = data.riskScoreData.map(item => {
    const lossCount = data.lossDetectionData.filter(l => l.product === item.name).length;
    const liveFactor = lossCount > 0 ? `${lossCount} active loss event(s)` : null;
    const factors = liveFactor ? [liveFactor, ...item.factors.filter((f) => f !== liveFactor)] : item.factors;
    const scoreBoost = lossCount * 5;
    const riskScore = Math.min(100, item.riskScore + scoreBoost);
    const trend = scoreBoost > 0 ? 'up' : item.trend;
    return { ...item, riskScore, trend, factors };
  });

  res.json({
    riskScoreData: updatedRisk,
    predictiveRestockData: updatedPredictive,
    warehouseHeatmapData: data.warehouseHeatmapData
  });
});

// AI Scan — analyzes all inventory for anomalies and updates risk scores
app.post('/api/advanced/scan', async (req, res) => {
  await delay(1200); // simulate AI processing time

  const findings = [];
  const newAlerts = [];

  data.inventoryData.forEach(product => {
    const riskItem = data.riskScoreData.find(r => r.id === product.id);
    const lossEvents = data.lossDetectionData.filter(l => l.product === product.name);
    let scoreChange = 0;
    const issues = [];

    // Check critical stock
    if (product.status === 'Critical') {
      scoreChange += 15;
      issues.push('Critical stock level');
    }
    // Check existing loss events
    if (lossEvents.length > 0) {
      scoreChange += lossEvents.length * 8;
      issues.push(`${lossEvents.length} unresolved loss event(s)`);
    }
    // Check high stockOut ratio
    if (product.stockOut > 0 && product.stockIn > 0) {
      const outRatio = product.stockOut / product.stockIn;
      if (outRatio > 0.85) {
        scoreChange += 10;
        issues.push('High outflow ratio');
      }
    }

    if (riskItem) {
      const oldScore = riskItem.riskScore;
      riskItem.riskScore = Math.min(100, Math.max(0, oldScore + scoreChange));
      if (scoreChange > 0) {
        riskItem.trend = 'up';
        riskItem.factors = [...new Set([...issues, ...riskItem.factors])].slice(0, 5);
      } else if (scoreChange < 0) {
        riskItem.trend = 'down';
      }
    }

    if (issues.length > 0) {
      findings.push({ product: product.name, id: product.id, issues, scoreChange });
      if (scoreChange >= 15) {
        newAlerts.push({
          id: Date.now() + Math.random(),
          message: `AI Scan: ${product.name} risk elevated — ${issues[0]}`,
          timestamp: now(),
          level: scoreChange >= 25 ? 'critical' : 'warning'
        });
      }
    }
  });

  newAlerts.forEach(a => data.alertsData.unshift(a));

  res.json({
    scannedAt: now(),
    productsScanned: data.inventoryData.length,
    findings,
    newAlerts: newAlerts.length
  });
});

// Supply Chain Analysis — computed from orders data
app.get('/api/advanced/supply-chain', async (req, res) => {
  await delay();

  const received = data.ordersData.filter(o => o.status === 'received');
  const confirmed = data.ordersData.filter(o => o.status === 'confirmed');
  const total = data.ordersData.length;

  const deliverySuccessRate = total > 0 ? Math.round((received.length / total) * 100) : 100;

  // Shortage analysis
  const shortageOrders = received.filter(o => o.receivedQty !== undefined && o.receivedQty < o.quantity);
  const totalShortage = shortageOrders.reduce((s, o) => s + (o.quantity - (o.receivedQty || o.quantity)), 0);

  // Supplier breakdown
  const supplierMap = {};
  data.ordersData.forEach(o => {
    const sup = o.supplier || 'Unknown';
    if (!supplierMap[sup]) supplierMap[sup] = { name: sup, total: 0, received: 0, shortage: 0 };
    supplierMap[sup].total++;
    if (o.status === 'received') {
      supplierMap[sup].received++;
      if (o.receivedQty !== undefined && o.receivedQty < o.quantity) {
        supplierMap[sup].shortage += o.quantity - o.receivedQty;
      }
    }
  });
  const suppliers = Object.values(supplierMap);

  // Product order frequency
  const productOrderFreq = {};
  data.ordersData.forEach(o => {
    productOrderFreq[o.productName] = (productOrderFreq[o.productName] || 0) + 1;
  });
  const topOrderedProducts = Object.entries(productOrderFreq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    total,
    pending: confirmed.length,
    received: received.length,
    deliverySuccessRate,
    shortageOrders: shortageOrders.length,
    totalShortageUnits: totalShortage,
    suppliers,
    topOrderedProducts
  });
});

// Anomaly timeline — all loss events from tracking data chronologically
app.get('/api/advanced/anomaly-timeline', async (req, res) => {
  await delay();

  const events = [];
  data.productTrackingData.forEach(product => {
    product.timeline
      .filter(e => e.type === 'loss')
      .forEach(e => {
        events.push({
          productId: product.productId,
          productName: product.name,
          warehouse: product.warehouse,
          date: e.date,
          details: e.details
        });
      });
  });

  // Sort by date descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(events);
});



// Quick-order from predictive restock
app.post('/api/advanced/quick-order', async (req, res) => {
  await delay();
  const { productId, quantity } = req.body;
  const productIndex = data.inventoryData.findIndex(p => p.id === productId);
  if (productIndex === -1) return res.status(404).json({ error: "Product not found" });
  const product = data.inventoryData[productIndex];
  product.stockIn += Number(quantity);
  product.currentStock += Number(quantity);
  if (product.currentStock <= 20) product.status = "Critical";
  else if (product.currentStock <= 100) product.status = "Warning";
  else product.status = "Normal";

  // Update predictive restock data
  const restockIndex = data.predictiveRestockData.findIndex(p => p.id === productId);
  if (restockIndex !== -1) {
    data.predictiveRestockData[restockIndex].currentStock = product.currentStock;
    data.predictiveRestockData[restockIndex].daysUntilEmpty = Math.floor(product.currentStock / data.predictiveRestockData[restockIndex].dailyUsage);
    data.predictiveRestockData[restockIndex].urgency = product.currentStock <= 20 ? "critical" : product.currentStock <= 100 ? "warning" : "normal";
  }

  const orderId = `ORD-${Date.now()}`;
  const order = { id: orderId, productId, productName: product.name, quantity: Number(quantity), warehouse: product.warehouse, supplier: "AI Auto-Order", notes: "Placed via predictive restock", status: "confirmed", timestamp: now() };
  data.ordersData.push(order);

  const trackingIndex = data.productTrackingData.findIndex(p => p.productId === productId);
  const event = { date: now(), event: "Order Placed", type: "added", details: `AI Auto-Restock: ${quantity} units ordered (${orderId})` };
  if (trackingIndex !== -1) data.productTrackingData[trackingIndex].timeline.push(event);

  data.alertsData.unshift({ id: Date.now(), message: `AI Quick Order: ${quantity} units of ${product.name} ordered automatically`, timestamp: now(), level: "warning" });
  res.status(201).json({ order, product });
});

// ─────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  await delay();
  res.json(data.settingsData);
});

app.put('/api/settings', async (req, res) => {
  await delay();
  data.settingsData = { ...data.settingsData, ...req.body };
  res.json(data.settingsData);
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
