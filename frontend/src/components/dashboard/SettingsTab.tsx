import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Bell, Shield, Database, Save, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const fieldClass = "w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

type SettingsData = {
  profile: { fullName: string; email: string; role: string; timezone: string };
  notifications: { emailAlerts: boolean; pushAlerts: boolean; criticalOnly: boolean };
  system: { aiAutoDetection: boolean; dataRetention: boolean; emailNotifications: boolean };
  thresholds: { criticalStock: number; warningStock: number; autoOrderEnabled: boolean };
};

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-10 h-5 rounded-full bg-border peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-foreground after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
  </label>
);

const SettingsTab = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      return res.json();
    }
  });

  const [localSettings, setLocalSettings] = useState<SettingsData | null>(null);
  const effective = localSettings || settings;

  const saveMutation = useMutation({
    mutationFn: async (payload: SettingsData) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setLocalSettings(null);
      toast.success("Settings saved successfully!");
    },
    onError: () => toast.error("Failed to save settings")
  });

  const updateProfile = (key: string, value: string) => {
    if (!effective) return;
    setLocalSettings({ ...effective, profile: { ...effective.profile, [key]: value } });
  };

  const updateNotification = (key: string, value: boolean) => {
    if (!effective) return;
    setLocalSettings({ ...effective, notifications: { ...effective.notifications, [key]: value } });
  };

  const updateSystem = (key: string, value: boolean) => {
    if (!effective) return;
    setLocalSettings({ ...effective, system: { ...effective.system, [key]: value } });
  };

  const updateThreshold = (key: string, value: number | boolean) => {
    if (!effective) return;
    setLocalSettings({ ...effective, thresholds: { ...effective.thresholds, [key]: value } });
  };

  if (isLoading || !effective) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isDirty = localSettings !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {isDirty && (
        <div className="glass rounded-xl p-3 border border-warning/30 bg-warning/5 flex items-center gap-2 text-sm text-warning">
          <Shield className="w-4 h-4 shrink-0" />
          You have unsaved changes. Click "Save Settings" to apply them.
        </div>
      )}

      {/* Profile */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">User Profile</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Full Name</label>
            <input type="text" value={effective.profile.fullName} onChange={e => updateProfile('fullName', e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
            <input type="email" value={effective.profile.email} onChange={e => updateProfile('email', e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Role</label>
            <input type="text" value={effective.profile.role} disabled className={`${fieldClass} opacity-60 cursor-not-allowed`} />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Timezone</label>
            <select value={effective.profile.timezone} onChange={e => updateProfile('timezone', e.target.value)} className={fieldClass}>
              <option>UTC+0</option>
              <option>UTC+5:30</option>
              <option>UTC-5</option>
              <option>UTC+8</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Bell className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'emailAlerts', label: "Email Alerts", desc: "Receive alert notifications via email" },
            { key: 'pushAlerts', label: "Push Notifications", desc: "Browser push notifications for real-time alerts" },
            { key: 'criticalOnly', label: "Critical Alerts Only", desc: "Only receive notifications for critical-level events" },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
              <Toggle checked={effective.notifications[s.key as keyof typeof effective.notifications] as boolean} onChange={v => updateNotification(s.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* System Configuration */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Database className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: "Enable Email Notifications", desc: "Receive alerts via email" },
            { key: 'aiAutoDetection', label: "AI Auto-Detection", desc: "Automatically scan for anomalies every 30 minutes" },
            { key: 'dataRetention', label: "Data Retention (90 days)", desc: "Keep historical data for analysis" },
          ].map(s => (
            <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
              <Toggle checked={effective.system[s.key as keyof typeof effective.system] as boolean} onChange={v => updateSystem(s.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Alert Thresholds</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Critical Stock Level</label>
            <input
              type="number"
              min={0}
              value={effective.thresholds.criticalStock}
              onChange={e => updateThreshold('criticalStock', Number(e.target.value))}
              className={fieldClass}
            />
            <p className="text-xs text-muted-foreground mt-1">Items at or below this level are marked Critical</p>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Warning Stock Level</label>
            <input
              type="number"
              min={0}
              value={effective.thresholds.warningStock}
              onChange={e => updateThreshold('warningStock', Number(e.target.value))}
              className={fieldClass}
            />
            <p className="text-xs text-muted-foreground mt-1">Items at or below this level are marked Warning</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground font-medium">AI Auto-Order</p>
              <p className="text-xs text-muted-foreground">Automatically place orders when stock hits critical level</p>
            </div>
          </div>
          <Toggle checked={effective.thresholds.autoOrderEnabled} onChange={v => updateThreshold('autoOrderEnabled', v)} />
        </div>
      </div>

      <button
        onClick={() => effective && saveMutation.mutate(effective)}
        disabled={saveMutation.isPending || !isDirty}
        className="w-full py-3 rounded-lg gradient-bg text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : saveMutation.isSuccess && !isDirty ? (
          <><CheckCircle className="w-5 h-5" /> Saved!</>
        ) : (
          <><Save className="w-5 h-5" /> Save Settings</>
        )}
      </button>
    </div>
  );
};

export default SettingsTab;
