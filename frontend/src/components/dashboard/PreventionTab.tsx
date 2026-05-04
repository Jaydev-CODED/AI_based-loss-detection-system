import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Lightbulb, ArrowRight, Loader2, Check, X, Zap } from "lucide-react";
import { toast } from "sonner";

const priorityStyles: Record<string, string> = {
  critical: "bg-destructive/10 border-l-destructive",
  high: "bg-warning/10 border-l-warning",
  medium: "bg-primary/10 border-l-primary",
  low: "bg-success/10 border-l-success",
};

const priorityBadge: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-warning/20 text-warning",
  medium: "bg-primary/20 text-primary",
  low: "bg-success/20 text-success",
};

type Rec = { id: number; category: string; priority: string; title: string; description: string };
type AIRec = { icon: string; title: string; description: string; impact: string };

const PreventionTab = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['prevention'],
    queryFn: async () => {
      const res = await fetch('/api/prevention');
      return res.json();
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/prevention/${id}/apply`, { method: 'POST' });
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['prevention'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success("Prevention recommendation applied!");
    },
    onError: () => toast.error("Failed to apply recommendation")
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/prevention/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prevention'] });
      toast.info("Recommendation dismissed");
    }
  });

  const applyAIMutation = useMutation({
    mutationFn: async (index: number) => {
      const res = await fetch(`/api/ai-recommendations/${index}/apply`, { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prevention'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success("AI recommendation applied!");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { preventionRecommendations = [], aiRecommendations = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">AI Prevention Recommendations</h2>
        {preventionRecommendations.length > 0 && (
          <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {preventionRecommendations.length} active
          </span>
        )}
      </div>

      {/* Prevention Cards */}
      {preventionRecommendations.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <ShieldCheck className="w-12 h-12 text-success mx-auto mb-3 opacity-60" />
          <p className="text-muted-foreground font-medium">All clear! No active prevention recommendations.</p>
          <p className="text-muted-foreground text-sm mt-1">The AI is monitoring your warehouse continuously.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {preventionRecommendations.map((rec: Rec, i: number) => (
            <div
              key={rec.id}
              className={`glass rounded-xl p-5 border-l-4 hover-lift flex flex-col ${priorityStyles[rec.priority] || priorityStyles.low}`}
              style={{ animation: `slide-up 0.4s ease-out ${i * 0.08}s forwards`, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{rec.category}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityBadge[rec.priority] || priorityBadge.low}`}>
                  {rec.priority}
                </span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">{rec.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{rec.description}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => applyMutation.mutate(rec.id)}
                  disabled={applyMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-success/20 text-success hover:bg-success/30 text-xs font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Apply
                </button>
                <button
                  onClick={() => dismissMutation.mutate(rec.id)}
                  disabled={dismissMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted text-xs font-medium transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Recommendations Engine */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">AI Recommendation Engine</h3>
          {aiRecommendations.length > 0 && (
            <span className="text-xs font-medium bg-warning/20 text-warning px-2 py-0.5 rounded-full">
              {aiRecommendations.length} suggestions
            </span>
          )}
        </div>
        {aiRecommendations.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No AI recommendations at this time.</p>
        ) : (
          <div className="space-y-3">
            {aiRecommendations.map((rec: AIRec, i: number) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                style={{ animation: `slide-up 0.4s ease-out ${(i + 6) * 0.08}s forwards`, opacity: 0 }}
              >
                <span className="text-2xl shrink-0">{rec.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">{rec.impact}</span>
                  <button
                    onClick={() => applyAIMutation.mutate(i)}
                    disabled={applyAIMutation.isPending}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
                    title="Apply this recommendation"
                  >
                    <Zap className="w-3 h-3" /> Apply
                  </button>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreventionTab;
