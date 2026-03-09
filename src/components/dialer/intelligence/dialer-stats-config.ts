import { Phone, Users, MessageSquare, Clock, Calendar, TrendingUp, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TodayStat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface GoalStat {
  label: string;
  current: number;
  target: number;
}

export interface Insight {
  emoji: string;
  text: string;
}

export const todayStats: TodayStat[] = [
  { label: "Calls Made", value: "12", icon: Phone, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Contacts Reached", value: "3", icon: Users, color: "text-success", bgColor: "bg-success/10" },
  { label: "Connect Rate", value: "25%", icon: MessageSquare, color: "text-info", bgColor: "bg-info/10" },
  { label: "Total Talk Time", value: "38:24", icon: Clock, color: "text-accent-foreground", bgColor: "bg-accent/30" },
  { label: "Avg Talk Time", value: "3:12", icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
  { label: "Appointments Set", value: "1", icon: Calendar, color: "text-success", bgColor: "bg-success/10" },
  { label: "Deals Advanced", value: "2", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Calls/Hour", value: "8.5", icon: Zap, color: "text-warning", bgColor: "bg-warning/10" },
];

export const goalStats: GoalStat[] = [
  { label: "Calls", current: 12, target: 50 },
  { label: "Connections", current: 3, target: 15 },
  { label: "Appointments", current: 1, target: 5 },
  { label: "Offers", current: 0, target: 3 },
];

export const insights: Insight[] = [
  { emoji: "🕐", text: "Peak connection window: 10 AM–12 PM (42% connect rate)" },
  { emoji: "📞", text: "Follow-up calls convert 3.2x better than cold calls" },
  { emoji: "⏱️", text: "Calls over 3 min have 68% higher appointment rate" },
];
