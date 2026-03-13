import { User, Bell, Shield, Database } from "lucide-react";

const fieldClass = "w-full px-4 py-3 rounded-lg bg-muted border border-border/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow";

const SettingsTab = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    {/* Profile */}
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">User Profile</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Full Name</label>
          <input type="text" defaultValue="Admin User" className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
          <input type="email" defaultValue="admin@invenguard.ai" className={fieldClass} />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Role</label>
          <input type="text" defaultValue="System Administrator" disabled className={`${fieldClass} opacity-60`} />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Timezone</label>
          <select className={fieldClass}>
            <option>UTC+0</option>
            <option>UTC+5:30</option>
            <option>UTC-5</option>
            <option>UTC+8</option>
          </select>
        </div>
      </div>
    </div>

    {/* System */}
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Database className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
      </div>
      <div className="space-y-4">
        {[
          { icon: Bell, label: "Enable Email Notifications", desc: "Receive alerts via email" },
          { icon: Shield, label: "AI Auto-Detection", desc: "Automatically scan for anomalies" },
          { icon: Database, label: "Data Retention (90 days)", desc: "Keep historical data for analysis" },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 rounded-full bg-border peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-foreground after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>
    </div>

    <button className="w-full py-3 rounded-lg gradient-bg text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
      Save Settings
    </button>
  </div>
);

export default SettingsTab;
