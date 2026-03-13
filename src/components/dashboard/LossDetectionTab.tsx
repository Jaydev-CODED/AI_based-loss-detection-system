import { lossDetectionData } from "@/data/mockData";
import { AlertTriangle, AlertOctagon } from "lucide-react";

const LossDetectionTab = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-2">
      <AlertTriangle className="w-5 h-5 text-warning" />
      <h2 className="text-lg font-bold text-foreground">AI Detected Anomalies</h2>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {lossDetectionData.map((item, i) => (
        <div
          key={item.product}
          className={`glass rounded-xl p-5 border-l-4 hover-lift ${
            item.level === "critical" ? "border-l-destructive" : "border-l-warning"
          }`}
          style={{ animation: `slide-up 0.4s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{item.product}</h3>
            {item.level === "critical" ? (
              <span className="flex items-center gap-1 text-xs font-medium bg-destructive/20 text-destructive px-2 py-1 rounded-full">
                <AlertOctagon className="w-3 h-3" /> Critical
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium bg-warning/20 text-warning px-2 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" /> Warning
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Expected</p>
              <p className="text-foreground font-semibold">{item.expected}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Actual</p>
              <p className="text-foreground font-semibold">{item.actual}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Loss Amount</p>
              <p className={`text-lg font-bold ${item.level === "critical" ? "text-destructive" : "text-warning"}`}>
                -{item.loss} units
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LossDetectionTab;
