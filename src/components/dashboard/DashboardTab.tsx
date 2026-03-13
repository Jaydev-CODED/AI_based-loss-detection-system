import { Package, Boxes, AlertTriangle, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { inventoryLevelsChart, stockMovementChart, lossDetectionChart } from "@/data/mockData";
import { useEffect, useState } from "react";

const AnimatedCounter = ({ target, duration = 1500 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
};

const stats = [
  { label: "Total Products", value: 8, icon: Package, color: "from-primary to-secondary" },
  { label: "Total Stock", value: 1445, icon: Boxes, color: "from-secondary to-primary" },
  { label: "Loss Events", value: 5, icon: AlertTriangle, color: "from-warning to-destructive" },
  { label: "System Status", value: "Active", icon: Activity, color: "from-success to-secondary" },
];

const chartTooltipStyle = {
  contentStyle: { background: "hsl(230 20% 12%)", border: "1px solid hsl(230 15% 20%)", borderRadius: "8px", color: "hsl(220 20% 95%)" },
};

const DashboardTab = () => (
  <div className="space-y-6">
    {/* Stat Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="glass rounded-xl p-5 hover-lift"
          style={{ animation: `slide-up 0.5s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
              <s.icon className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {typeof s.value === "number" ? <AnimatedCounter target={s.value} /> : s.value}
          </p>
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Inventory Levels</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={inventoryLevelsChart}>
            <defs>
              <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(265 80% 60%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(265 80% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
            <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
            <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
            <Tooltip {...chartTooltipStyle} />
            <Area type="monotone" dataKey="stock" stroke="hsl(265 80% 60%)" fill="url(#gradArea)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Stock Movement</h3>
        <ResponsiveContainer width="100%" height={250}>
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
      <h3 className="text-sm font-semibold text-foreground mb-4">Loss Detection Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={lossDetectionChart}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 15% 20%)" />
          <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
          <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
          <Tooltip {...chartTooltipStyle} />
          <Line type="monotone" dataKey="losses" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={{ fill: "hsl(0 72% 55%)", r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default DashboardTab;
