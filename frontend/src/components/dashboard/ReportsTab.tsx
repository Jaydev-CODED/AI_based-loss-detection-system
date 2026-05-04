import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, FileSpreadsheet, Loader2, AlertTriangle, AlertOctagon, Package, Boxes } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const chartTooltipStyle = {
  contentStyle: { background: "hsl(230 20% 12%)", border: "1px solid hsl(230 15% 20%)", borderRadius: "8px", color: "hsl(220 20% 95%)" },
};

const reportTypes = [
  { id: "inventory", label: "Inventory Summary" },
  { id: "loss", label: "Loss Detection Report" },
  { id: "analytics", label: "Analytics Report" },
];

const ReportsTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await fetch('/api/reports');
      return res.json();
    },
    // Always refetch when tab becomes visible — so new losses appear immediately
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const {
    monthlyLossTrends = [],
    topProductsLoss = [],
    stockMovementChart = [],
    inventoryData = [],
    lossDetectionData = [],
    summary = {}
  } = data || {};

  const { totalLossUnits = 0, totalAnomalies = 0, criticalCount = 0, totalInventoryValue = 0, totalProducts = 0 } = summary as any;

  const exportCSV = (type: string) => {
    let csv = "";
    if (type === "inventory") {
      csv = "Product ID,Product Name,Category,Stock In,Stock Out,Current Stock,Status,Warehouse\n";
      inventoryData.forEach((r: any) => { csv += `${r.id},${r.name},${r.category},${r.stockIn},${r.stockOut},${r.currentStock},${r.status},${r.warehouse}\n`; });
    } else if (type === "loss") {
      csv = "Product,Expected,Actual,Loss,Level,Source\n";
      lossDetectionData.forEach((r: any) => { csv += `${r.product},${r.expected},${r.actual},${r.loss},${r.level},${r.source || 'ai_detected'}\n`; });
    } else if (type === "analytics") {
      csv = "Month,Loss Value\n";
      monthlyLossTrends.forEach((r: any) => { csv += `${r.month},$${r.value}\n`; });
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${type}-report.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} CSV exported`);
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
        body: inventoryData.map((r: any) => [r.id, r.name, r.category, r.stockIn, r.stockOut, r.currentStock, r.status, r.warehouse]),
      });
    } else if (type === "loss") {
      autoTable(doc, {
        startY: 35,
        head: [["Product", "Expected", "Actual", "Loss", "Level", "Source"]],
        body: lossDetectionData.map((r: any) => [r.product, r.expected, r.actual, r.loss, r.level, r.source || 'ai_detected']),
      });
    } else if (type === "analytics") {
      autoTable(doc, {
        startY: 35,
        head: [["Month", "Loss Value ($)"]],
        body: monthlyLossTrends.map((r: any) => [r.month, `$${r.value}`]),
      });
    }

    doc.save(`${type}-report.pdf`);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} PDF exported`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: totalProducts, icon: Package, color: "from-primary to-secondary", text: "text-foreground" },
          { label: "Total Stock Units", value: totalInventoryValue.toLocaleString(), icon: Boxes, color: "from-secondary to-primary", text: "text-foreground" },
          { label: "Active Anomalies", value: totalAnomalies, icon: AlertTriangle, color: "from-warning to-destructive", text: "text-warning" },
          { label: "Units Lost (Active)", value: totalLossUnits, icon: AlertOctagon, color: "from-destructive to-warning", text: "text-destructive" },
        ].map((s, i) => (
          <div key={s.label} className="glass rounded-xl p-4 hover-lift"
            style={{ animation: `slide-up 0.4s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Export Section */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Generate &amp; Export Reports</h3>
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

      {/* Live Loss Detection Table */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-foreground">Live Loss Detection Log</h3>
          {lossDetectionData.length > 0 && (
            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
              {lossDetectionData.length} active
            </span>
          )}
        </div>
        {lossDetectionData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No active loss events — all clear.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Product", "Expected", "Actual", "Loss", "Source", "Level"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lossDetectionData.map((item: any, i: number) => (
                  <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    style={{ animation: `slide-up 0.3s ease-out ${i * 0.04}s forwards`, opacity: 0 }}>
                    <td className="px-4 py-3 text-foreground font-medium">{item.product}</td>
                    <td className="px-4 py-3 text-foreground">{item.expected}</td>
                    <td className="px-4 py-3 text-foreground">{item.actual}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${item.level === 'critical' ? 'text-destructive' : 'text-warning'}`}>
                        -{item.loss}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize text-xs">
                      {(item.source || 'ai_detected').replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 w-fit ${
                        item.level === 'critical' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                      }`}>
                        {item.level === 'critical' ? <AlertOctagon className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {item.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              <Line type="monotone" dataKey="value" name="Loss ($)" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={{ fill: "hsl(0 72% 55%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Inventory Usage (Stock Movement)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stockMovementChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="inbound" name="Inbound" fill="hsl(265 80% 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outbound" name="Outbound" fill="hsl(220 60% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products by Loss — live from lossDetectionData */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Top Products by Loss (Live)</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Updates with every loss event</span>
        </div>
        {topProductsLoss.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No loss data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, topProductsLoss.length * 50)}>
            <BarChart data={topProductsLoss} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis type="number" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(220 10% 55%)" fontSize={12} width={140} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="loss" name="Units Lost" fill="hsl(0 72% 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;
