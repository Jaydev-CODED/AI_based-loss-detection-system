import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-warehouse.png";
import { ShieldCheck, BarChart3, Brain } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 glass sticky top-0 border-b border-border/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">InvenGuard AI</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm rounded-lg border border-border/50 text-foreground hover:bg-muted transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm rounded-lg gradient-bg text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8" style={{ animation: "slide-up 0.8s ease-out forwards" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
              <Brain className="w-4 h-4 text-primary" />
              Powered by Artificial Intelligence
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
              AI-Based Inventory{" "}
              <span className="gradient-text">Loss Detection</span>{" "}
              System
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Detect abnormal inventory loss patterns using advanced AI algorithms. 
              Monitor stock movements, identify anomalies, and prevent losses in real-time.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 rounded-lg gradient-bg text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-shadow"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 rounded-lg border border-border/50 text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="relative" style={{ animation: "fade-in-slow 1.2s ease-out forwards" }}>
            <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-[60px]" />
            <img
              src={heroImage}
              alt="AI warehouse analytics visualization"
              className="relative rounded-2xl border border-border/30 shadow-2xl animate-float"
            />
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          {[
            { icon: Brain, title: "AI Detection", desc: "Real-time anomaly detection using machine learning models" },
            { icon: BarChart3, title: "Analytics", desc: "Comprehensive reports and trend analysis dashboards" },
            { icon: ShieldCheck, title: "Prevention", desc: "Automated alerts and loss prevention recommendations" },
          ].map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-xl p-6 hover-lift cursor-default"
              style={{ animation: `slide-up 0.6s ease-out ${0.2 + i * 0.15}s forwards`, opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
