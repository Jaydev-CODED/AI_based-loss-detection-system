import { preventionRecommendations, aiRecommendations } from "@/data/mockData";
import { ShieldCheck, AlertTriangle, AlertOctagon, Lightbulb, ArrowRight } from "lucide-react";

const priorityStyles: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-l-destructive",
  high: "bg-warning/20 text-warning border-l-warning",
  medium: "bg-primary/20 text-primary border-l-primary",
  low: "bg-success/20 text-success border-l-success",
};

const priorityBadge: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-warning/20 text-warning",
  medium: "bg-primary/20 text-primary",
  low: "bg-success/20 text-success",
};

const PreventionTab = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center gap-3">
      <ShieldCheck className="w-5 h-5 text-primary" />
      <h2 className="text-lg font-bold text-foreground">AI Prevention Recommendations</h2>
    </div>

    {/* Prevention Cards */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {preventionRecommendations.map((rec, i) => (
        <div
          key={rec.id}
          className={`glass rounded-xl p-5 border-l-4 hover-lift ${priorityStyles[rec.priority]}`}
          style={{ animation: `slide-up 0.4s ease-out ${i * 0.08}s forwards`, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">{rec.category}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityBadge[rec.priority]}`}>
              {rec.priority}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm mb-2">{rec.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
        </div>
      ))}
    </div>

    {/* AI Recommendations Engine */}
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Lightbulb className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-semibold text-foreground">AI Recommendation Engine</h3>
      </div>
      <div className="space-y-3">
        {aiRecommendations.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            style={{ animation: `slide-up 0.4s ease-out ${(i + 6) * 0.08}s forwards`, opacity: 0 }}
          >
            <span className="text-2xl">{rec.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">{rec.impact}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PreventionTab;
