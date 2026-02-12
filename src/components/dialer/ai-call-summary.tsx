import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, FileText, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";
import { toast } from "sonner";

export function AICallSummary({ className }: { className?: string }) {
  const { callStatus, currentCallPhase, sentimentScore, transcript } = useCallState();
  const [saved, setSaved] = React.useState(false);

  const isLive = callStatus === "connected";

  const summaryPoints = React.useMemo(() => {
    const points = [
      "Seller confirmed ownership of property",
      "Motivated — behind on payments 2 months",
      "Timeline: wants to close within 30 days",
    ];
    if (transcript.length > 3) {
      points.push("Open to creative financing terms");
    }
    if (currentCallPhase === "Qualification" || currentCallPhase === "Close") {
      points.push("Qualified — ready for offer presentation");
    }
    return points;
  }, [transcript.length, currentCallPhase]);

  const autoActions = [
    { label: "Deal Notes", done: true },
    { label: "Timeline", done: true },
    { label: "Sentiment", done: true },
    { label: "Probability", done: sentimentScore > 60 },
  ];

  const handleSave = () => {
    setSaved(true);
    toast.success("AI summary saved to deal notes, timeline, and CRM");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={cn("p-3.5 bg-primary/5 rounded-lg border border-primary/20", className)}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" /> AI Call Summary
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Live
          </span>
        )}
      </div>

      <div className="space-y-1.5 mb-3">
        {summaryPoints.map((point, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-foreground leading-relaxed">
            <span className="text-primary mt-0.5">•</span>
            <span>{point}</span>
          </div>
        ))}
        {isLive && (
          <div className="flex items-start gap-1.5 text-xs">
            <span className="text-muted-foreground mt-0.5 animate-pulse">•</span>
            <span className="text-muted-foreground italic">Listening for more details...</span>
          </div>
        )}
      </div>

      {/* Auto-sync status */}
      <div className="flex items-center gap-2 flex-wrap mb-2.5">
        {autoActions.map(({ label, done }) => (
          <span key={label} className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold",
            done ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
          )}>
            <CheckCircle className="h-2.5 w-2.5" />
            {label}
          </span>
        ))}
      </div>

      <button
        onClick={handleSave}
        className={cn(
          "w-full py-2 rounded-lg text-xs font-semibold transition-all",
          saved
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
        )}
      >
        {saved ? "✓ Saved to All Systems" : "Save & Sync Summary"}
      </button>
    </div>
  );
}
