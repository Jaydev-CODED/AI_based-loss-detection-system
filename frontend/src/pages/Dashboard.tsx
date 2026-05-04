import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, PlusCircle, Brain, FileBarChart, Bell,
  Settings, ShieldCheck, LogOut, BarChart3, ShieldAlert, MapPin, Zap,
  Menu, X, ShoppingCart, ClipboardCheck
} from "lucide-react";
import DashboardTab from "@/components/dashboard/DashboardTab";
import InventoryTab from "@/components/dashboard/InventoryTab";
import AddProductTab from "@/components/dashboard/AddProductTab";
import LossDetectionTab from "@/components/dashboard/LossDetectionTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import AlertsTab from "@/components/dashboard/AlertsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import PreventionTab from "@/components/dashboard/PreventionTab";
import ProductTrackingTab from "@/components/dashboard/ProductTrackingTab";
import AdvancedFeaturesTab from "@/components/dashboard/AdvancedFeaturesTab";
import OrderTab from "@/components/dashboard/OrderTab";
import StockAuditTab from "@/components/dashboard/StockAuditTab";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "add", label: "Add Product", icon: PlusCircle },
  { id: "order", label: "Order Items", icon: ShoppingCart },
  { id: "audit", label: "Stock Audit", icon: ClipboardCheck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "loss", label: "Loss Detection", icon: Brain },
  { id: "prevention", label: "Prevention", icon: ShieldAlert },
  { id: "tracking", label: "Tracking", icon: MapPin },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "advanced", label: "Advanced AI", icon: Zap },
  { id: "settings", label: "Settings", icon: Settings },
];

const tabContent: Record<string, React.ReactNode> = {
  dashboard: <DashboardTab />,
  inventory: <InventoryTab />,
  add: <AddProductTab />,
  order: <OrderTab />,
  audit: <StockAuditTab />,
  analytics: <AnalyticsTab />,
  loss: <LossDetectionTab />,
  prevention: <PreventionTab />,
  tracking: <ProductTrackingTab />,
  reports: <ReportsTab />,
  alerts: <AlertsTab />,
  advanced: <AdvancedFeaturesTab />,
  settings: <SettingsTab />,
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const activeLabel = tabs.find((t) => t.id === activeTab)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[150px]" />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen glass-strong border-r border-border/30 transition-all duration-300 flex flex-col ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${sidebarOpen ? "w-60" : "w-16"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border/30 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0 cursor-pointer" onClick={() => navigate("/")}>
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          {sidebarOpen && <span className="font-bold text-foreground text-sm truncate">InvenGuard AI</span>}
          <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto md:hidden p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "gradient-bg text-primary-foreground glow-shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              title={!sidebarOpen ? tab.label : undefined}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/30 p-2 shrink-0 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors hidden md:flex"
          >
            <Menu className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 glass-strong border-b border-border/30 h-14 flex items-center px-4 sm:px-6 gap-3">
          <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{activeLabel}</h1>
        </header>

        {/* Content */}
        <main className="relative z-10 flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          <div key={activeTab} style={{ animation: "slide-up 0.4s ease-out" }}>
            {tabContent[activeTab]}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
