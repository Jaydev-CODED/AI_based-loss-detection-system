import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, AlertOctagon, CheckCircle, Loader2,
  PlusCircle, X, Package, Tag
} from "lucide-react";
import { toast } from "sonner";

type LossItem = {
  id: number; product: string; expected: number; actual: number;
  loss: number; level: string; source?: string; notes?: string; orderId?: string;
};
type Product = { id: string; name: string; currentStock: number; status: string };

const fieldClass = "w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

const sourceLabels: Record<string, string> = {
  manual_report: "Manual Report",
  delivery_shortage: "Delivery Shortage",
  stock_audit: "Stock Audit",
};

const LossDetectionTab = () => {
  const queryClient = useQueryClient();
  const [showReport, setShowReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    productId: "", expected: "", actual: "", notes: ""
  });

  const { data, isLoading } = useQuery<{ table: LossItem[] }>({
    queryKey: ['lossDetection'],
    queryFn: async () => {
      const res = await fetch('/api/loss-detection');
      return res.json();
    }
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      return res.json();
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/loss-detection/${id}/resolve`, { method: 'PUT' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lossDetection'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success("Anomaly resolved and marked as investigated");
    },
    onError: () => toast.error("Failed to resolve anomaly")
  });

  const reportMutation = useMutation({
    mutationFn: async (form: typeof reportForm) => {
      const res = await fetch('/api/loss-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          expected: Number(form.expected),
          actual: Number(form.actual),
          notes: form.notes
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lossDetection'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success("Discrepancy reported and inventory updated");
      setReportForm({ productId: "", expected: "", actual: "", notes: "" });
      setShowReport(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  // Pre-fill expected from selected product's current stock
  const selectedProduct = products.find(p => p.id === reportForm.productId);
  const handleProductSelect = (productId: string) => {
    const p = products.find(x => x.id === productId);
    setReportForm({
      ...reportForm,
      productId,
      expected: p ? String(p.currentStock) : ""
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = data?.table || [];
  const criticalCount = items.filter(i => i.level === "critical").length;
  const totalLoss = items.reduce((sum, i) => sum + i.loss, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-bold text-foreground">AI Detected Anomalies</h2>
          {items.length > 0 && (
            <span className="text-xs font-medium bg-warning/20 text-warning px-2 py-0.5 rounded-full">
              {items.length} active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowReport(!showReport)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors"
        >
          {showReport ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showReport ? "Cancel" : "Report Discrepancy"}
        </button>
      </div>

      {/* Summary strip */}
      {items.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "Total Anomalies", value: items.length, color: "text-warning", bg: "bg-warning/10" },
            { label: "Critical", value: criticalCount, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Total Units Lost", value: totalLoss, color: "text-foreground", bg: "bg-muted/30" },
          ].map(s => (
            <div key={s.label} className={`glass rounded-xl p-4 ${s.bg}`}>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report Discrepancy Form */}
      {showReport && (
        <div className="glass rounded-xl p-6 border border-destructive/30 space-y-4"
          style={{ animation: "slide-up 0.3s ease-out" }}>
          <div className="flex items-center gap-2 mb-2">
            <PlusCircle className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Report Manual Stock Discrepancy</h3>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Product *</label>
            <select
              required
              value={reportForm.productId}
              onChange={e => handleProductSelect(e.target.value)}
              className={fieldClass}
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) — System Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 text-sm">
              <Package className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">System shows <strong className="text-foreground">{selectedProduct.currentStock}</strong> units — enter what you physically counted below</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Expected / System Count *</label>
              <input
                type="number" min={0} placeholder="System stock count" className={fieldClass}
                value={reportForm.expected}
                onChange={e => setReportForm({ ...reportForm, expected: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Actual Physical Count *</label>
              <input
                type="number" min={0} placeholder="Physical count found" className={fieldClass}
                value={reportForm.actual}
                onChange={e => setReportForm({ ...reportForm, actual: e.target.value })}
              />
            </div>
          </div>

          {reportForm.expected && reportForm.actual && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
              Number(reportForm.expected) - Number(reportForm.actual) > 0
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-success/10 text-success border border-success/20"
            }`}>
              {Number(reportForm.expected) - Number(reportForm.actual) > 0 ? (
                <><AlertTriangle className="w-4 h-4 shrink-0" />
                  <strong>{Number(reportForm.expected) - Number(reportForm.actual)} units missing</strong> — will be logged as a loss event</>
              ) : (
                <><CheckCircle className="w-4 h-4 shrink-0" />
                  No loss detected — counts match or surplus</>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Notes / Reason</label>
            <textarea rows={2} placeholder="e.g. Possible theft, miscount, damaged goods..."
              className={`${fieldClass} resize-none`}
              value={reportForm.notes}
              onChange={e => setReportForm({ ...reportForm, notes: e.target.value })} />
          </div>

          <button
            onClick={() => reportMutation.mutate(reportForm)}
            disabled={reportMutation.isPending || !reportForm.productId || !reportForm.expected || !reportForm.actual}
            className="w-full py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {reportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><AlertTriangle className="w-4 h-4" /> Submit Loss Report</>}
          </button>
        </div>
      )}

      {/* Anomaly Cards */}
      {items.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 opacity-70" />
          <p className="text-foreground font-semibold">No anomalies detected</p>
          <p className="text-muted-foreground text-sm mt-1">All inventory levels are within expected thresholds.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`glass rounded-xl p-5 border-l-4 hover-lift flex flex-col ${
                item.level === "critical" ? "border-l-destructive" : "border-l-warning"
              }`}
              style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground truncate flex-1 mr-2">{item.product}</h3>
                {item.level === "critical" ? (
                  <span className="flex items-center gap-1 text-xs font-medium bg-destructive/20 text-destructive px-2 py-1 rounded-full shrink-0">
                    <AlertOctagon className="w-3 h-3" /> Critical
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium bg-warning/20 text-warning px-2 py-1 rounded-full shrink-0">
                    <AlertTriangle className="w-3 h-3" /> Warning
                  </span>
                )}
              </div>

              {item.source && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <Tag className="w-3 h-3" />
                  <span>{sourceLabels[item.source] || item.source}</span>
                  {item.orderId && <span className="font-mono">· {item.orderId}</span>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm flex-1">
                <div>
                  <p className="text-muted-foreground">Expected</p>
                  <p className="text-foreground font-semibold">{item.expected}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Actual</p>
                  <p className="text-foreground font-semibold">{item.actual}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Loss Amount</p>
                  <p className={`text-lg font-bold ${item.level === "critical" ? "text-destructive" : "text-warning"}`}>
                    -{item.loss} units
                  </p>
                </div>
              </div>

              {item.notes && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30 italic">{item.notes}</p>
              )}

              <div className="mt-4 pt-3 border-t border-border/30">
                <button
                  onClick={() => resolveMutation.mutate(item.id)}
                  disabled={resolveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-success/20 text-success hover:bg-success/30 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {resolveMutation.isPending ? "Resolving…" : "Mark as Resolved"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LossDetectionTab;
