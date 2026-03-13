import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, Brain, FileBarChart, Bell, Settings, ShieldCheck, LogOut } from "lucide-react";
import DashboardTab from "@/components/dashboard/DashboardTab";
import InventoryTab from "@/components/dashboard/InventoryTab";
import AddProductTab from "@/components/dashboard/AddProductTab";
import LossDetectionTab from "@/components/dashboard/LossDetectionTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import AlertsTab from "@/components/dashboard/AlertsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "add", label: "Add Product", icon: PlusCircle },
  { id: "loss", label: "Loss Detection", icon: Brain },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const tabContent: Record<string, React.ReactNode> = {
  dashboard: <DashboardTab />,
  inventory: <InventoryTab />,
  add: <AddProductTab />,
  loss: <LossDetectionTab />,
  reports: <ReportsTab />,
  alerts: <AlertsTab />,
  settings: <SettingsTab />,
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 glass-strong sticky top-0 border-b border-border/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground hidden sm:block">InvenGuard AI</span>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "gradient-bg text-primary-foreground glow-shadow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === tab.id
                  ? "gradient-bg text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div key={activeTab} style={{ animation: "slide-up 0.4s ease-out" }}>
          {tabContent[activeTab]}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
