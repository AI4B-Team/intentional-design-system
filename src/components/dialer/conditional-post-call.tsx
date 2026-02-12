import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Flame, ThermometerSun, Snowflake, CheckCircle, ArrowRight, Calendar, MessageCircle, Mail, Bell, FileText, Zap, RotateCcw } from "lucide-react";
import { useCallState } from "@/contexts/CallContext";

interface AutomationRule {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  executed: boolean;
}

type CallOutcome = "hot" | "warm" | "no_connect" | "cold";

function deriveOutcome(sentimentScore: number, callDuration: number, phase: string): CallOutcome {
  if (callDuration < 30) return "no_connect";
  if (sentimentScore >= 70 && (phase === "Qualification" || phase === "Close")) return "hot";
  if (sentimentScore >= 40) return "warm";
  return "cold";
}

function getAutomationRules(outcome: CallOutcome): AutomationRule[] {
  switch (outcome) {
    case "hot":
      return [
        { id: "r1", label: "Move to HOT", description: "Pipeline stage → Hot Lead", icon: Flame, color: "text-red-500 bg-red-500/10", executed: true },
        { id: "r2", label: "Follow-up in 24h", description: "Auto-scheduled callback tomorrow", icon: Calendar, color: "text-blue-500 bg-blue-500/10", executed: true },
        { id: "r3", label: "Draft Offer Email", description: "Offer template with ARV & comps attached", icon: Mail, color: "text-amber-500 bg-amber-500/10", executed: true },
        { id: "r4", label: "Notify Team", description: "Deal alert sent to acquisitions team", icon: Bell, color: "text-violet-500 bg-violet-500/10", executed: true },
      ];
    case "warm":
      return [
        { id: "r1", label: "Move to WARM", description: "Pipeline stage → Warm Lead", icon: ThermometerSun, color: "text-amber-500 bg-amber-500/10", executed: true },
        { id: "r2", label: "3-Touch Nurture", description: "SMS → Email → Call sequence started", icon: Zap, color: "text-blue-500 bg-blue-500/10", executed: true },
        { id: "r3", label: "Educational Follow-up", description: "Market report email queued", icon: Mail, color: "text-emerald-500 bg-emerald-500/10", executed: true },
      ];
    case "no_connect":
      return [
        { id: "r1", label: "Log No Connect", description: "Disposition → No Connect / Voicemail", icon: FileText, color: "text-muted-foreground bg-muted", executed: true },
        { id: "r2", label: "SMS Follow-up", description: "Auto-SMS sent: \"Sorry I missed you...\"", icon: MessageCircle, color: "text-violet-500 bg-violet-500/10", executed: true },
        { id: "r3", label: "Retry Tomorrow", description: "Re-queued for next day callback", icon: RotateCcw, color: "text-blue-500 bg-blue-500/10", executed: true },
      ];
    case "cold":
      return [
        { id: "r1", label: "Move to COLD", description: "Pipeline stage → Cold / Nurture", icon: Snowflake, color: "text-blue-400 bg-blue-400/10", executed: true },
        { id: "r2", label: "Long-term Drip", description: "Added to 90-day nurture campaign", icon: Mail, color: "text-muted-foreground bg-muted", executed: true },
      ];
  }
}

const OUTCOME_CONFIG: Record<CallOutcome, { label: string; color: string; bg: string; border: string }> = {
  hot: { label: "🔥 HOT — Offer Ready", color: "text-red-600", bg: "bg-red-500/5", border: "border-red-500/20" },
  warm: { label: "☀️ WARM — Nurture", color: "text-amber-600", bg: "bg-amber-500/5", border: "border-amber-500/20" },
  no_connect: { label: "📵 No Connect", color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border" },
  cold: { label: "❄️ COLD — Long-term", color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20" },
};

export function ConditionalPostCall({ className }: { className?: string }) {
  const { callStatus, sentimentScore, callDuration, currentCallPhase } = useCallState();

  if (callStatus !== "ended") return null;

  const outcome = deriveOutcome(sentimentScore, callDuration, currentCallPhase);
  const oc = OUTCOME_CONFIG[outcome];
  const rules = getAutomationRules(outcome);

  return (
    <div className={cn("p-4 rounded-xl border space-y-3", oc.bg, oc.border, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-semibold text-foreground">Conditional Automation</span>
        </div>
        <span className={cn("text-[11px] font-bold", oc.color)}>{oc.label}</span>
      </div>

      {/* Logic conditions */}
      <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Conditions Met</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
            sentiment={sentimentScore}%
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
            duration={callDuration}s
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
            phase={currentCallPhase}
          </span>
        </div>
      </div>

      {/* Actions executed */}
      <div className="space-y-1.5">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div key={rule.id} className="flex items-start gap-2.5 py-1">
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0", rule.color)}>
                {rule.executed ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">{rule.label}</div>
                <div className="text-[11px] text-muted-foreground">{rule.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold pt-1">
        <CheckCircle className="h-3 w-3" />
        {rules.length} automations executed based on call outcome
      </div>
    </div>
  );
}
