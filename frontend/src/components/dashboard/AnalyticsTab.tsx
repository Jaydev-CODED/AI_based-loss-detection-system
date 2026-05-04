import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, BarChart3, PieChart, Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const AnimatedCounter = ({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (1500 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(decimals > 0 ? parseFloat(start.toFixed(decimals)) : Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
};

const chartTooltipStyle = {
  contentStyle: { background: "hsl(230 20% 12%)", border: "1px solid hsl(230 15% 20%)", borderRadius: "8px", color: "hsl(220 20% 95%)" },
};

const analyticsStats = [
  { label: "Avg. Turnover Rate", value: 2.7, suffix: "x", icon: TrendingUp, decimals: 1 },
  { label: "Inventory Usage", value: 79, suffix: "%", icon: BarChart3 },
  { label: "Total Loss Value", value: 10350, suffix: "", icon: PieChart },
  { label: "Active Monitors", value: 24, suffix: "", icon: Activity },
];

const AnalyticsTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { monthlyUsage, stockTurnover, demandTrends, monthlyLossTrends } = data || {};

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsStats.map((s, i) => (
          <div key={s.label} className="glass rounded-xl p-5 hover-lift" style={{ animation: `slide-up 0.5s ease-out ${i * 0.1}s forwards`, opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {s.label === "Total Loss Value" && "$"}
              <AnimatedCounter target={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Inventory Usage (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyUsage}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(265 80% 60%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(265 80% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="usage" stroke="hsl(265 80% 60%)" fill="url(#usageGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Stock Turnover Rate</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stockTurnover}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip {...chartTooltipStyle} />
              <Line type="monotone" dataKey="turnover" stroke="hsl(145 65% 42%)" strokeWidth={2} dot={{ fill: "hsl(145 65% 42%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Product Demand Trends by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={demandTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ color: "hsl(220 10% 55%)", fontSize: "12px" }} />
              <Bar dataKey="electronics" fill="hsl(265 80% 60%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="displays" fill="hsl(220 60% 50%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="accessories" fill="hsl(145 65% 42%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="audio" fill="hsl(45 95% 55%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Loss Trends Over Time ($)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyLossTrends}>
              <defs>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0 72% 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(0 72% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="hsl(0 72% 55%)" fill="url(#lossGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
