import { useState, useEffect } from "react";
import { alertsData } from "@/data/mockData";
import { Bell, AlertTriangle, AlertOctagon, X, CheckCheck } from "lucide-react";
import { toast } from "sonner";

const AlertsTab = () => {
  const [alerts, setAlerts] = useState(alertsData);
  const [showPopup, setShowPopup] = useState(true);

  // Popup notification on mount
  useEffect(() => {
    const criticals = alertsData.filter((a) => a.level === "critical");
    if (criticals.length > 0) {
      toast.error(`${criticals.length} critical alert(s) detected!`, {
        description: criticals[0].message,
        duration: 5000,
      });
    }
  }, []);

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.info("Alert dismissed");
  };

  const dismissAll = () => {
    setAlerts([]);
    toast.success("All alerts cleared");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          {alerts.length > 0 && (
            <span className="text-xs font-medium bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
              {alerts.length} active
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button onClick={dismissAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
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
              <button onClick={() => dismissAlert(alert.id)} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsTab;
