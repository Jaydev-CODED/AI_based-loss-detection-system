import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck, Package, Loader2, AlertTriangle, CheckCircle,
  TrendingDown, TrendingUp, Minus, Info, Play
} from "lucide-react";
import { toast } from "sonner";

type Product = { id: string; name: string; category: string; currentStock: number; warehouse: string; status: string };
type AuditResult = {
  productId: string; name: string; expected: number; actual: number; diff: number; status: string;
};

const fieldClass = "w-full px-4 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

const diffStatus = {
  ok: { label: "Matches", color: "text-success", bg: "bg-success/10", icon: CheckCircle },
  loss_warning: { label: "Loss", color: "text-warning", bg: "bg-warning/10", icon: TrendingDown },
  loss_critical: { label: "Critical Loss", color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
  surplus: { label: "Surplus", color: "text-primary", bg: "bg-primary/10", icon: TrendingUp },
};

const StockAuditTab = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      return res.json();
    }
  });

  const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>({});
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [auditResults, setAuditResults] = useState<AuditResult[] | null>(null);

  const auditMutation = useMutation({
    mutationFn: async (items: { productId: string; physicalCount: number }[]) => {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: (data) => {
      setAuditResults(data.results);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['lossDetection'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      const losses = data.results.filter((r: AuditResult) => r.diff > 0).length;
      if (losses > 0) {
        toast.error(`Audit complete: ${losses} discrepancy${losses > 1 ? 'ies' : ''} detected and logged`);
      } else {
        toast.success("Audit complete: All counts match system records!");
      }
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const filteredProducts = products.filter(p =>
    warehouseFilter === "All" || p.warehouse === warehouseFilter
  );

  const handleCountChange = (productId: string, value: string) => {
    setPhysicalCounts(prev => ({ ...prev, [productId]: value }));
  };

  const handleRunAudit = () => {
    const items = filteredProducts
      .filter(p => physicalCounts[p.id] !== undefined && physicalCounts[p.id] !== "")
      .map(p => ({ productId: p.id, physicalCount: Number(physicalCounts[p.id]) }));

    if (items.length === 0) {
      toast.error("Enter physical counts for at least one product before running audit");
      return;
    }
    setAuditResults(null);
    auditMutation.mutate(items);
  };

  const fillAllWithSystem = () => {
    const filled: Record<string, string> = {};
    filteredProducts.forEach(p => { filled[p.id] = String(p.currentStock); });
    setPhysicalCounts(prev => ({ ...prev, ...filled }));
    toast.info("Pre-filled with system counts — update any discrepancies");
  };

  const filledCount = filteredProducts.filter(p => physicalCounts[p.id] !== undefined && physicalCounts[p.id] !== "").length;

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Stock Audit</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Enter physical counts to compare with system
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={warehouseFilter}
            onChange={e => setWarehouseFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm focus:outline-none"
          >
            <option>All</option>
            <option>WH-A</option>
            <option>WH-B</option>
            <option>WH-C</option>
          </select>
          <button
            onClick={fillAllWithSystem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-xs font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5" /> Pre-fill System
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="text-muted-foreground">
          <strong className="text-foreground">How it works:</strong> Enter the physical count you found during a warehouse walkthrough.
          Any difference between the system count and physical count will be automatically logged as a Loss Detection event,
          the inventory will be updated, and alerts will be generated.
        </div>
      </div>

      {/* Product Table */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            {filteredProducts.length} products
            {filledCount > 0 && <span className="text-muted-foreground font-normal"> · {filledCount} counts entered</span>}
          </h3>
          <button
            onClick={handleRunAudit}
            disabled={auditMutation.isPending || filledCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {auditMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Audit ({filledCount} items)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Product", "Category", "Warehouse", "System Stock", "Status", "Physical Count", "Variance"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, i) => {
                const countStr = physicalCounts[product.id];
                const count = countStr !== undefined && countStr !== "" ? Number(countStr) : null;
                const variance = count !== null ? product.currentStock - count : null;
                const resultRow = auditResults?.find(r => r.productId === product.id);
                const statusDef = resultRow ? diffStatus[resultRow.status as keyof typeof diffStatus] : null;

                return (
                  <tr key={product.id}
                    className={`border-b border-border/30 transition-colors ${resultRow ? (resultRow.diff > 0 ? "bg-destructive/5" : resultRow.diff < 0 ? "bg-primary/5" : "bg-success/5") : "hover:bg-muted/30"}`}
                    style={{ animation: `slide-up 0.3s ease-out ${i * 0.03}s forwards`, opacity: 0 }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-foreground font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.warehouse}</td>
                    <td className="px-4 py-3 text-foreground font-semibold">{product.currentStock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.status === "Critical" ? "bg-destructive/20 text-destructive" :
                        product.status === "Warning" ? "bg-warning/20 text-warning" :
                        "bg-success/20 text-success"
                      }`}>{product.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        placeholder={String(product.currentStock)}
                        value={physicalCounts[product.id] ?? ""}
                        onChange={e => handleCountChange(product.id, e.target.value)}
                        disabled={auditMutation.isPending}
                        className="w-28 px-3 py-1.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {resultRow ? (
                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${statusDef?.bg} ${statusDef?.color}`}>
                          {statusDef && <statusDef.icon className="w-3 h-3" />}
                          {resultRow.diff !== 0 ? `${resultRow.diff > 0 ? "-" : "+"}${Math.abs(resultRow.diff)}` : "0"}
                          {" "}{statusDef?.label}
                        </div>
                      ) : count !== null && variance !== null ? (
                        <span className={`text-sm font-semibold ${variance > 0 ? "text-destructive" : variance < 0 ? "text-primary" : "text-success"}`}>
                          {variance === 0 ? "Match" : variance > 0 ? `-${variance}` : `+${Math.abs(variance)}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <Minus className="w-3 h-3" /> Not counted
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Results Summary */}
      {auditResults && (
        <div className="glass rounded-xl p-6 space-y-4" style={{ animation: "slide-up 0.4s ease-out" }}>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Audit Results</h3>
          </div>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { label: "Items Audited", value: auditResults.length, color: "text-foreground" },
              { label: "Matches", value: auditResults.filter(r => r.status === "ok").length, color: "text-success" },
              { label: "Losses Detected", value: auditResults.filter(r => r.diff > 0).length, color: "text-destructive" },
              { label: "Total Units Lost", value: auditResults.filter(r => r.diff > 0).reduce((s, r) => s + r.diff, 0), color: "text-warning" },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {auditResults.filter(r => r.diff > 0).length > 0 && (
            <p className="text-sm text-muted-foreground">
              Loss events have been logged in <strong className="text-foreground">Loss Detection</strong> and inventory has been updated to match physical counts.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StockAuditTab;
