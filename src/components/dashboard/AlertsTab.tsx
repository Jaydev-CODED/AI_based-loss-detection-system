import { alertsData } from "@/data/mockData";
import { Bell, AlertTriangle, AlertOctagon } from "lucide-react";

const AlertsTab = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-2">
      <Bell className="w-5 h-5 text-primary" />
      <h2 className="text-lg font-bold text-foreground">Notifications</h2>
    </div>
    <div className="space-y-3">
      {alertsData.map((alert, i) => (
        <div
          key={alert.id}
          className={`glass rounded-xl p-4 flex items-start gap-4 border-l-4 hover-lift ${
            alert.level === "critical" ? "border-l-destructive" : "border-l-warning"
          }`}
          style={{ animation: `slide-up 0.4s ease-out ${i * 0.08}s forwards`, opacity: 0 }}
        >
          {alert.level === "critical" ? (
            <AlertOctagon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AlertsTab;
