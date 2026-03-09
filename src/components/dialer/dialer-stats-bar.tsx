import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Users, Calendar, Clock, TrendingUp, Bot, Headphones, Target, MessageSquare, Zap, BarChart3, Lightbulb, CheckCircle } from "lucide-react";

type CallMode = 'human' | 'ai_agent' | 'listen';

interface DialerStatsBarProps {
  mode?: CallMode;
  // Human mode stats
  callsMade?: number;
  contactsReached?: number;
  appointmentsSet?: number;
  totalTalkTime?: number;
  sessionDuration?: number;
  // AI Agent mode stats
  callsExecuted?: number;
  liveConversations?: number;
  qualifiedLeads?: number;
  avgConversationLength?: number;
  successRate?: number;
  // Listen mode stats
  callsObserved?: number;
  keyMomentsFlagged?: number;
  objectionsDetected?: number;
  buyingSignals?: number;
  suggestionsUsed?: number;
}

export function DialerStatsBar({
  mode = 'human',
  callsMade = 0,
  contactsReached = 0,
  appointmentsSet = 0,
  totalTalkTime = 0,
  sessionDuration = 0,
  callsExecuted = 0,
  liveConversations = 0,
  qualifiedLeads = 0,
  avgConversationLength = 0,
  successRate = 0,
  callsObserved = 0,
  keyMomentsFlagged = 0,
  objectionsDetected = 0,
  buyingSignals = 0,
  suggestionsUsed = 0,
}: DialerStatsBarProps) {
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const reachRate = callsMade > 0 ? Math.round((contactsReached / callsMade) * 100) : 0;
  const callsPerHour = sessionDuration > 60 
    ? ((callsMade / sessionDuration) * 3600).toFixed(1) 
    : callsMade.toString();

  const getModeIcon = () => {
    switch (mode) {
      case 'ai_agent':
        return <Bot className="h-3 w-3" />;
      case 'listen':
        return <Headphones className="h-3 w-3" />;
      default:
        return <Phone className="h-3 w-3" />;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'ai_agent':
        return 'AI Agent';
      case 'listen':
        return 'Listen Mode';
      default:
        return 'Human Call';
    }
  };

  const getStats = () => {
    switch (mode) {
      case 'ai_agent':
        return [
          {
            label: "Calls Executed",
            value: callsExecuted.toString(),
            icon: Zap,
            color: "text-info",
          },
          {
            label: "Live Conversations",
            value: liveConversations.toString(),
            icon: MessageSquare,
            color: "text-success",
          },
          {
            label: "Qualified Leads",
            value: qualifiedLeads.toString(),
            icon: Target,
            color: "text-warning",
          },
          {
            label: "Avg Conversation",
            value: formatTime(avgConversationLength),
            icon: Clock,
            color: "text-accent-foreground",
          },
          {
            label: "Success Rate",
            value: `${successRate}%`,
            icon: CheckCircle,
            color: "text-primary",
          },
        ];
      case 'listen':
        return [
          {
            label: "Calls Observed",
            value: callsObserved.toString(),
            icon: Headphones,
            color: "text-info",
          },
          {
            label: "Key Moments",
            value: keyMomentsFlagged.toString(),
            icon: Lightbulb,
            color: "text-success",
          },
          {
            label: "Objections",
            value: objectionsDetected.toString(),
            icon: MessageSquare,
            color: "text-warning",
          },
          {
            label: "Buying Signals",
            value: buyingSignals.toString(),
            icon: TrendingUp,
            color: "text-accent-foreground",
          },
          {
            label: "Suggestions Used",
            value: suggestionsUsed.toString(),
            icon: BarChart3,
            color: "text-primary",
          },
        ];
      default: // human mode
        return [
          {
            label: "Calls Made",
            value: callsMade.toString(),
            icon: Phone,
            color: "text-info",
          },
          {
            label: "Contacts Reached",
            value: `${contactsReached} (${reachRate}%)`,
            icon: Users,
            color: "text-success",
          },
          {
            label: "Qualified Leads",
            value: appointmentsSet.toString(),
            icon: Calendar,
            color: "text-warning",
          },
          {
            label: "Talk Time",
            value: formatTime(totalTalkTime),
            icon: Clock,
            color: "text-accent-foreground",
          },
          {
            label: "Calls/Hour",
            value: callsPerHour,
            icon: TrendingUp,
            color: "text-primary",
          },
        ];
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-4 bg-background-secondary rounded-medium border border-border-subtle">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-full bg-white shadow-sm", stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</p>
              <p className="text-lg font-semibold text-foreground tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-tiny text-muted-foreground">
        {getModeIcon()}
        <span>Mode: {getModeLabel()}</span>
      </div>
    </div>
  );
}