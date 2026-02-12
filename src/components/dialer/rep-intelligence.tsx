import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain, Shield, Heart, Target, MessageSquare, TrendingUp, BarChart3, Users, Bot, User, Handshake, DollarSign } from "lucide-react";

// ============ REP INTELLIGENCE SCORE ============
interface RepScore {
  objectionHandling: number;
  empathy: number;
  closeEfficiency: number;
  talkRatio: number;
  momentumRecovery: number;
}

function ScoreBar({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-3 w-3 flex-shrink-0", color)} />
      <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color.replace("text-", "bg-"))} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold font-mono text-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

export function RepIntelligenceScore({ className }: { className?: string }) {
  const scores: RepScore = {
    objectionHandling: 78,
    empathy: 85,
    closeEfficiency: 62,
    talkRatio: 45,
    momentumRecovery: 71,
  };

  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  return (
    <div className={cn("p-4 bg-background rounded-lg border border-border space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-[12px] font-semibold text-foreground">Rep Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Overall</span>
          <span className={cn(
            "text-lg font-bold font-mono",
            overall >= 75 ? "text-emerald-600" : overall >= 50 ? "text-amber-500" : "text-red-500"
          )}>{overall}</span>
        </div>
      </div>

      <div className="space-y-2">
        <ScoreBar label="Objection Handling" value={scores.objectionHandling} icon={Shield} color="text-blue-500" />
        <ScoreBar label="Empathy" value={scores.empathy} icon={Heart} color="text-rose-500" />
        <ScoreBar label="Close Efficiency" value={scores.closeEfficiency} icon={Target} color="text-emerald-500" />
        <ScoreBar label="Talk Ratio" value={scores.talkRatio} icon={MessageSquare} color="text-violet-500" />
        <ScoreBar label="Momentum Recovery" value={scores.momentumRecovery} icon={TrendingUp} color="text-amber-500" />
      </div>
    </div>
  );
}

// ============ SCRIPT PERFORMANCE ============
interface ScriptStat {
  name: string;
  uses: number;
  closeRate: number;
  avgDuration: string;
}

export function ScriptPerformance({ className }: { className?: string }) {
  const scripts: ScriptStat[] = [
    { name: "Empathy Open", uses: 142, closeRate: 34, avgDuration: "4:21" },
    { name: "Direct Value", uses: 98, closeRate: 28, avgDuration: "3:45" },
    { name: "Problem-Solver", uses: 67, closeRate: 41, avgDuration: "5:12" },
  ];

  const bestReframe = { text: "I hear you — what if we could solve that timeline issue?", successRate: 67 };

  return (
    <div className={cn("p-4 bg-background rounded-lg border border-border space-y-3", className)}>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span className="text-[12px] font-semibold text-foreground">Script Performance</span>
      </div>

      <div className="space-y-2">
        {scripts.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <span className={cn(
              "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold",
              i === 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
            )}>{i + 1}</span>
            <span className="flex-1 font-medium text-foreground">{s.name}</span>
            <span className="text-muted-foreground">{s.uses} uses</span>
            <span className={cn(
              "font-bold tabular-nums",
              s.closeRate >= 35 ? "text-emerald-600" : s.closeRate >= 25 ? "text-amber-500" : "text-muted-foreground"
            )}>{s.closeRate}%</span>
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
        <div className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">Best Reframe</div>
        <p className="text-[11px] text-foreground italic">"{bestReframe.text}"</p>
        <span className="text-[10px] text-emerald-600 font-bold">{bestReframe.successRate}% success rate</span>
      </div>
    </div>
  );
}

// ============ MODE COMPARISON ============
export function ModeComparison({ className }: { className?: string }) {
  const modes = [
    { icon: User, label: "Human", calls: 156, connects: 42, appts: 8, close: "5.1%", color: "text-emerald-600" },
    { icon: Handshake, label: "Hybrid", calls: 89, connects: 31, appts: 7, close: "7.9%", color: "text-violet-600" },
    { icon: Bot, label: "AI Agent", calls: 312, connects: 94, appts: 12, close: "3.8%", color: "text-blue-600" },
  ];

  return (
    <div className={cn("p-4 bg-background rounded-lg border border-border space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-[12px] font-semibold text-foreground">Mode Comparison</span>
      </div>

      <div className="space-y-2">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center gap-2 text-xs">
              <Icon className={cn("h-3.5 w-3.5", m.color)} />
              <span className="w-14 font-semibold text-foreground">{m.label}</span>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-muted-foreground">{m.calls} <span className="text-[9px]">calls</span></span>
                <span className="text-muted-foreground">{m.connects} <span className="text-[9px]">connects</span></span>
                <span className="text-muted-foreground">{m.appts} <span className="text-[9px]">appts</span></span>
              </div>
              <span className={cn("font-bold tabular-nums", m.color)}>{m.close}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ PREDICTIVE REVENUE ============
export function PredictiveRevenue({ className }: { className?: string }) {
  const pipeline = [
    { stage: "Hot Leads", count: 4, avgDeal: 22000, probability: 75 },
    { stage: "Warm Leads", count: 12, avgDeal: 18000, probability: 35 },
    { stage: "Under Contract", count: 2, avgDeal: 28000, probability: 90 },
  ];

  const expected30 = pipeline.reduce((sum, p) => sum + (p.count * p.avgDeal * p.probability / 100), 0);
  const expected90 = expected30 * 2.8;

  return (
    <div className={cn("p-4 bg-background rounded-lg border border-border space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          <span className="text-[12px] font-semibold text-foreground">Predictive Revenue</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-center">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Next 30 Days</div>
          <div className="text-xl font-bold text-emerald-600 font-mono">${(expected30 / 1000).toFixed(0)}k</div>
        </div>
        <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10 text-center">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Next 90 Days</div>
          <div className="text-xl font-bold text-primary font-mono">${(expected90 / 1000).toFixed(0)}k</div>
        </div>
      </div>

      <div className="space-y-1.5">
        {pipeline.map(p => (
          <div key={p.stage} className="flex items-center gap-2 text-xs">
            <span className="flex-1 text-muted-foreground">{p.stage}</span>
            <span className="font-medium text-foreground">{p.count} deals</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium text-foreground">${(p.avgDeal / 1000).toFixed(0)}k</span>
            <span className="text-muted-foreground">@</span>
            <span className="font-bold text-primary">{p.probability}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
