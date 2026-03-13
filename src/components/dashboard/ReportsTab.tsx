import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { monthlyLossTrends, topProductsLoss, stockMovementChart, inventoryData, lossDetectionData } from "@/data/mockData";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const chartTooltipStyle = {
  contentStyle: { background: "hsl(230 20% 12%)", border: "1px solid hsl(230 15% 20%)", borderRadius: "8px", color: "hsl(220 20% 95%)" },
};

const exportCSV = (type: string) => {
  let csv = "";
  if (type === "inventory") {
    csv = "Product ID,Product Name,Category,Stock In,Stock Out,Current Stock,Status,Warehouse\n";
    inventoryData.forEach((r) => { csv += `${r.id},${r.name},${r.category},${r.stockIn},${r.stockOut},${r.currentStock},${r.status},${r.warehouse}\n`; });
  } else if (type === "loss") {
    csv = "Product,Expected,Actual,Loss,Level\n";
    lossDetectionData.forEach((r) => { csv += `${r.product},${r.expected},${r.actual},${r.loss},${r.level}\n`; });
  } else if (type === "analytics") {
    csv = "Month,Loss Value\n";
    monthlyLossTrends.forEach((r) => { csv += `${r.month},$${r.value}\n`; });
  }
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${type}-report.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success(`${type} CSV exported`);
};

const exportPDF = (type: string) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`InvenGuard AI — ${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  if (type === "inventory") {
    autoTable(doc, {
      startY: 35,
      head: [["ID", "Name", "Category", "In", "Out", "Stock", "Status", "WH"]],
      body: inventoryData.map((r) => [r.id, r.name, r.category, r.stockIn, r.stockOut, r.currentStock, r.status, r.warehouse]),
    });
  } else if (type === "loss") {
    autoTable(doc, {
      startY: 35,
      head: [["Product", "Expected", "Actual", "Loss", "Level"]],
      body: lossDetectionData.map((r) => [r.product, r.expected, r.actual, r.loss, r.level]),
    });
  } else if (type === "analytics") {
    autoTable(doc, {
      startY: 35,
      head: [["Month", "Loss Value ($)"]],
      body: monthlyLossTrends.map((r) => [r.month, `$${r.value}`]),
    });
  }

  doc.save(`${type}-report.pdf`);
  toast.success(`${type} PDF exported`);
};

const reportTypes = [
  { id: "inventory", label: "Inventory Summary" },
  { id: "loss", label: "Loss Detection Report" },
  { id: "analytics", label: "Analytics Report" },
];

const ReportsTab = () => (
  <div className="space-y-6">
    {/* Export Section */}
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Generate & Export Reports</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {reportTypes.map((r) => (
          <div key={r.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
            <p className="text-sm font-medium text-foreground">{r.label}</p>
            <div className="flex gap-2">
              <button onClick={() => exportPDF(r.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-medium transition-colors">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={() => exportCSV(r.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-success/10 text-success hover:bg-success/20 text-xs font-medium transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Charts */}
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Loss Trends ($)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyLossTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
            <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
            <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
            <Tooltip {...chartTooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={{ fill: "hsl(0 72% 55%)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Inventory Usage</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stockMovementChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
            <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
            <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="inbound" fill="hsl(265 80% 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outbound" fill="hsl(220 60% 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Top Products by Loss</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={topProductsLoss} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
          <XAxis type="number" stroke="hsl(220 10% 55%)" fontSize={12} />
          <YAxis dataKey="name" type="category" stroke="hsl(220 10% 55%)" fontSize={12} width={120} />
          <Tooltip {...chartTooltipStyle} />
          <Bar dataKey="loss" fill="hsl(0 72% 55%)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ReportsTab;
