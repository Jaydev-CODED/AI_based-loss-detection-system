import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, TrendingUp, TrendingDown, Minus, PackageCheck, MapPin, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const trendIcons = { up: TrendingUp, down: TrendingDown, stable: Minus };
const trendColors = { up: "text-destructive", down: "text-success", stable: "text-muted-foreground" };

const getRiskColor = (score: number) => {
  if (score >= 80) return "bg-destructive";
  if (score >= 50) return "bg-warning";
  if (score >= 25) return "bg-primary";
  return "bg-success";
};

const getHeatColor = (intensity: number) => {
  if (intensity >= 0.8) return "bg-destructive/80 text-destructive-foreground";
  if (intensity >= 0.5) return "bg-warning/60 text-warning-foreground";
  if (intensity >= 0.2) return "bg-primary/40 text-primary-foreground";
  if (intensity > 0) return "bg-success/30 text-success-foreground";
  return "bg-muted/30 text-muted-foreground";
};

const urgencyBadge: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  warning: "bg-warning/20 text-warning",
  normal: "bg-success/20 text-success",
};

type RiskScoreItem = { id: string; name: string; riskScore: number; trend: 'up' | 'down' | 'stable'; factors: string[] };
type PredictiveRestockItem = { id: string; name: string; currentStock: number; dailyUsage: number; daysUntilEmpty: number; suggestedOrder: number; urgency: string };
type HeatmapItem = { warehouse: string; zone: string; intensity: number; lossCount: number };

const AdvancedFeaturesTab = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['advanced'],
    queryFn: async () => {
      const res = await fetch('/api/advanced');
      return res.json();
    }
  });

  const [selectedWarehouse, setSelectedWarehouse] = useState("WH-A");
  const [orderingId, setOrderingId] = useState<string | null>(null);

  const quickOrderMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await fetch('/api/advanced/quick-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (!res.ok) throw new Error('Quick order failed');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advanced'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`Quick order placed: ${data.order.quantity} units of ${data.product.name}`);
      setOrderingId(null);
    },
    onError: () => {
      toast.error("Failed to place quick order");
      setOrderingId(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { riskScoreData = [], predictiveRestockData = [], warehouseHeatmapData = [] } = data || {};
  const zones = warehouseHeatmapData.filter((z: HeatmapItem) => z.warehouse === selectedWarehouse);

  const handleQuickOrder = (item: PredictiveRestockItem) => {
    if (item.suggestedOrder <= 0) return;
    setOrderingId(item.id);
    quickOrderMutation.mutate({ productId: item.id, quantity: item.suggestedOrder });
  };

  return (
    <div className="space-y-6">
      {/* AI Risk Scores */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">AI Risk Scores</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {riskScoreData.map((item: RiskScoreItem, i: number) => {
            const TrendIcon = trendIcons[item.trend] || Minus;
            return (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                style={{ animation: `slide-up 0.4s ease-out ${i * 0.06}s forwards`, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <TrendIcon className={`w-4 h-4 shrink-0 ${trendColors[item.trend] || trendColors.stable}`} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-foreground">{item.riskScore}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${getRiskColor(item.riskScore)}`} style={{ width: `${item.riskScore}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.factors.map((f: string) => (
                    <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{f}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Predictive Restocking */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <PackageCheck className="w-5 h-5 text-success" />
          <h3 className="text-lg font-semibold text-foreground">Predictive Restocking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Product", "Current Stock", "Daily Usage", "Days Until Empty", "Suggested Order", "Urgency", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictiveRestockData.map((item: PredictiveRestockItem, i: number) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors" style={{ animation: `slide-up 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                  <td className="px-4 py-3 text-foreground font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-foreground">{item.currentStock}</td>
                  <td className="px-4 py-3 text-foreground">{item.dailyUsage}/day</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${item.daysUntilEmpty <= 7 ? "text-destructive" : item.daysUntilEmpty <= 21 ? "text-warning" : "text-foreground"}`}>
                      {item.daysUntilEmpty} days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground font-semibold">{item.suggestedOrder > 0 ? `${item.suggestedOrder} units` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${urgencyBadge[item.urgency] || urgencyBadge.normal}`}>{item.urgency}</span>
                  </td>
                  <td className="px-4 py-3">
                    {item.suggestedOrder > 0 ? (
                      <button
                        onClick={() => handleQuickOrder(item)}
                        disabled={quickOrderMutation.isPending && orderingId === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {quickOrderMutation.isPending && orderingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-3.5 h-3.5" />
                        )}
                        Quick Order
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warehouse Heatmap */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Smart Warehouse Heatmap</h3>
          </div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option>WH-A</option>
            <option>WH-B</option>
            <option>WH-C</option>
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {zones.map((zone: HeatmapItem, i: number) => (
            <div
              key={zone.zone}
              className={`rounded-xl p-6 text-center transition-all hover:scale-105 cursor-pointer ${getHeatColor(zone.intensity)}`}
              style={{ animation: `slide-up 0.3s ease-out ${i * 0.08}s forwards`, opacity: 0 }}
              title={`${zone.lossCount} loss events in zone ${zone.zone}`}
            >
              <p className="text-lg font-bold">{zone.zone}</p>
              <p className="text-sm mt-1">{zone.lossCount} losses</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>Loss Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30" /> None
            <div className="w-4 h-4 rounded bg-success/30" /> Low
            <div className="w-4 h-4 rounded bg-primary/40" /> Medium
            <div className="w-4 h-4 rounded bg-warning/60" /> High
            <div className="w-4 h-4 rounded bg-destructive/80" /> Critical
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesTab;
