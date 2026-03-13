import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { monthlyLossTrends, topProductsLoss, stockMovementChart } from "@/data/mockData";

const chartTooltipStyle = {
  contentStyle: { background: "hsl(230 20% 12%)", border: "1px solid hsl(230 15% 20%)", borderRadius: "8px", color: "hsl(220 20% 95%)" },
};

const ReportsTab = () => (
  <div className="space-y-6">
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
