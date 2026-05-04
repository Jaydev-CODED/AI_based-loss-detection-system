import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, AlertTriangle, AlertOctagon, X, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type AlertItem = { id: number; message: string; timestamp: string; level: string; read?: boolean };

const AlertsTab = () => {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, refetch } = useQuery<AlertItem[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alerts');
      return res.json();
    },
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.info("Alert dismissed");
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/alerts', { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success("All alerts cleared");
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/alerts/${id}/read`, { method: 'PUT' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadAlerts = alerts.filter(a => !a.read);
  const criticals = alerts.filter(a => a.level === "critical");

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
          {unreadAlerts.length > 0 && (
            <span className="text-xs font-medium bg-warning/20 text-warning px-2 py-0.5 rounded-full">
              {unreadAlerts.length} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {alerts.length > 0 && (
            <button
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Summary strip for critical alerts */}
      {criticals.length > 0 && (
        <div className="glass rounded-xl p-4 border border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{criticals.length} critical alert(s) require immediate attention</p>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No active alerts — system is healthy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`glass rounded-xl p-4 flex items-start gap-4 border-l-4 hover-lift transition-opacity ${
                alert.read ? "opacity-60" : ""
              } ${alert.level === "critical" ? "border-l-destructive" : "border-l-warning"}`}
              style={{ animation: `slide-up 0.4s ease-out ${i * 0.06}s forwards`, opacity: 0 }}
            >
              {alert.level === "critical" ? (
                <AlertOctagon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${alert.read ? "text-muted-foreground" : "text-foreground"}`}>{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!alert.read && (
                  <button
                    onClick={() => markReadMutation.mutate(alert.id)}
                    className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-xs"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => dismissMutation.mutate(alert.id)}
                  disabled={dismissMutation.isPending}
                  className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsTab;
