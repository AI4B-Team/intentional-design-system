import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Phone,
  X,
  Timer,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Target,
  DollarSign,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Brain,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { calculatePriorityIndex, getTierStyles, type PriorityResult } from "@/lib/priority-scoring";

// ─── Types ─────────────────────────────────────────────────
interface PowerHourContact {
  id: string;
  name: string;
  phone: string;
  address: string;
  propertyId?: string;
  priority: PriorityResult;
  lastContactDays?: number;
  status?: string;
  bestCallWindow?: string;
}

interface SessionStats {
  callsMade: number;
  conversations: number;
  dealsAdvanced: number;
  revenueInfluenced: number;
  startedAt: Date;
  noAnswerStreak: number;
  lastConversationAt: number | null;
}

// ─── Mock contacts scored by Priority Index ────────────────
function generateScoredContacts(): PowerHourContact[] {
  const contacts = [
    { id: "1", name: "Robert Davis", phone: "(512) 555-0142", address: "890 Pine Road", lastContactDays: 9, status: "contacted", bestCallWindow: "10:00 AM" },
    { id: "2", name: "Marcus Williams", phone: "(512) 555-0198", address: "321 Cedar Lane", lastContactDays: 2, status: "warm", bestCallWindow: "10:30 AM" },
    { id: "3", name: "Jennifer Lee", phone: "(512) 555-0276", address: "4444 Dahlia Drive", lastContactDays: 0, status: "appointment_set", bestCallWindow: "11:00 AM" },
    { id: "4", name: "Sarah Johnson", phone: "(512) 555-0331", address: "567 Oak Avenue", lastContactDays: 5, status: "offer_sent", bestCallWindow: "11:15 AM" },
    { id: "5", name: "Michael Chen", phone: "(512) 555-0415", address: "1919 Jasmine Court", lastContactDays: 7, status: "new", bestCallWindow: "11:45 AM" },
    { id: "6", name: "Lisa Thompson", phone: "(512) 555-0503", address: "3636 Clover Court", lastContactDays: 4, status: "contacted", bestCallWindow: "12:00 PM" },
    { id: "7", name: "James Wilson", phone: "(512) 555-0612", address: "741 Hickory Place", lastContactDays: 1, status: "warm", bestCallWindow: "12:30 PM" },
    { id: "8", name: "Maria Garcia", phone: "(512) 555-0724", address: "2929 Birch Boulevard", lastContactDays: 6, status: "contacted", bestCallWindow: "1:00 PM" },
  ];

  return contacts
    .map((c) => ({
      ...c,
      priority: calculatePriorityIndex({
        isOverdue: (c.lastContactDays || 0) > 5,
        lastContactDays: c.lastContactDays,
        status: c.status,
        motivationScore: 600 + Math.floor(Math.random() * 300),
        arv: 180000 + Math.floor(Math.random() * 120000),
        askingPrice: 120000 + Math.floor(Math.random() * 80000),
        repairEstimate: 15000 + Math.floor(Math.random() * 25000),
      }),
    }))
    .filter((c) => c.priority.score >= 60) // Only Priority Index ≥ 60
    .sort((a, b) => b.priority.score - a.priority.score);
}

// ─── AI Strategy Generator ─────────────────────────────────
function getAIStrategy(contact: PowerHourContact): { strategy: string; script: string; tone: string } {
  if (contact.lastContactDays && contact.lastContactDays > 5) {
    return {
      strategy: `Re-engage with empathy. ${contact.lastContactDays} days of silence — lead with value, not pressure. Ask about timeline changes.`,
      script: "Motivated Seller Re-Engage",
      tone: "Warm & empathetic",
    };
  }
  if (contact.priority.tier === "hot") {
    return {
      strategy: "High-intent lead. Be direct — present the offer and push for commitment. Time sensitivity is your leverage.",
      script: "Direct Close",
      tone: "Confident & direct",
    };
  }
  if (contact.status === "offer_sent") {
    return {
      strategy: "Follow up on pending offer. Ask if they've had time to review. Address any concerns proactively.",
      script: "Offer Follow-up",
      tone: "Professional & patient",
    };
  }
  return {
    strategy: "Build rapport, confirm motivation, and schedule next step. Don't oversell — listen for buying signals.",
    script: "Discovery Call",
    tone: "Conversational & curious",
  };
}

// ─── Fatigue Detection ─────────────────────────────────────
function detectFatigue(stats: SessionStats): { fatigued: boolean; message: string } | null {
  const minutesElapsed = (Date.now() - stats.startedAt.getTime()) / 60000;

  // No-answer streak
  if (stats.noAnswerStreak >= 4) {
    return {
      fatigued: true,
      message: "4 no-answers in a row. Want to switch to SMS outreach for a few contacts?",
    };
  }

  // Low conversion after many calls
  if (stats.callsMade >= 6 && stats.conversations === 0) {
    return {
      fatigued: true,
      message: "Conversion slowing. Want to switch strategy? Try a different script or take a 2-minute reset.",
    };
  }

  // Long session without results
  if (minutesElapsed > 40 && stats.dealsAdvanced === 0 && stats.callsMade > 3) {
    return {
      fatigued: true,
      message: "40+ minutes without a deal advance. Consider switching to higher-priority leads or adjusting your approach.",
    };
  }

  return null;
}

// ─── Timer Display ─────────────────────────────────────────
function TimerDisplay({ startedAt }: { startedAt: Date }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const remaining = Math.max(0, 60 - mins);

  return (
    <div className="flex items-center gap-2">
      <Timer className="h-4 w-4 text-primary" />
      <span className="text-sm font-mono font-bold text-foreground">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {remaining > 0 ? `${remaining}m left` : "Overtime"}
      </span>
    </div>
  );
}

// ─── Contact Card ──────────────────────────────────────────
function ContactCard({
  contact,
  isActive,
  isCompleted,
  onClick,
}: {
  contact: PowerHourContact;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const tierStyles = getTierStyles(contact.priority.tier);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-3 transition-all",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : isCompleted
            ? "border-border bg-muted/30 opacity-60"
            : "border-border hover:border-primary/30 hover:bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", tierStyles.dot)} />
          )}
          <div className="min-w-0">
            <p className={cn("text-xs font-semibold truncate", isCompleted ? "text-muted-foreground line-through" : "text-foreground")}>
              {contact.name}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{contact.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className={cn("text-[9px] border", tierStyles.bg, tierStyles.text, tierStyles.border)}>
            {contact.priority.score}
          </Badge>
          {!isCompleted && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>
      {!isCompleted && contact.bestCallWindow && (
        <p className="text-[10px] text-muted-foreground mt-1 pl-5">
          Best window: {contact.bestCallWindow}
          {contact.lastContactDays && contact.lastContactDays > 0 ? ` · ${contact.lastContactDays}d since contact` : ""}
        </p>
      )}
    </button>
  );
}

// ─── Fatigue Alert ─────────────────────────────────────────
function FatigueAlert({ message, onDismiss, onSwitch }: { message: string; onDismiss: () => void; onSwitch: () => void }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 flex items-start gap-3">
      <Brain className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">AI Performance Check</p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{message}</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="default" className="text-xs h-7" onClick={onSwitch}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Switch Strategy
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={onDismiss}>
            Keep Going
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Session Recap ─────────────────────────────────────────
function SessionRecap({ stats, totalContacts, onClose, onSchedule }: { stats: SessionStats; totalContacts: number; onClose: () => void; onSchedule: () => void }) {
  const duration = Math.floor((Date.now() - stats.startedAt.getTime()) / 60000);
  const connectRate = stats.callsMade > 0 ? Math.round((stats.conversations / stats.callsMade) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-card border border-border rounded-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Power Hour Recap</h2>
          <p className="text-xs text-muted-foreground mt-1">{duration} minutes of focused execution</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3 text-center">
            <Phone className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.callsMade}</p>
            <p className="text-[10px] text-muted-foreground">Calls Made</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <MessageSquare className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.conversations}</p>
            <p className="text-[10px] text-muted-foreground">Conversations</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <TrendingUp className="h-4 w-4 text-amber-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.dealsAdvanced}</p>
            <p className="text-[10px] text-muted-foreground">Deals Advanced</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <DollarSign className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">${(stats.revenueInfluenced / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-muted-foreground">Revenue Influenced</p>
          </div>
        </div>

        {/* Performance summary */}
        <div className="rounded-lg border border-border p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">Session Performance</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Connect Rate</span>
            <span className="font-semibold text-foreground">{connectRate}%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Contacts Remaining</span>
            <span className="font-semibold text-foreground">{totalContacts - stats.callsMade}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Avg Revenue/Conversation</span>
            <span className="font-semibold text-foreground">
              ${stats.conversations > 0 ? Math.round(stats.revenueInfluenced / stats.conversations / 1000) : 0}K
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={onSchedule}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Next Power Hour
          </Button>
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Review Missed Opportunities
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Power Hour Page ──────────────────────────────────
export default function PowerHour() {
  const navigate = useNavigate();
  const [contacts] = useState<PowerHourContact[]>(generateScoredContacts);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [fatigueAlert, setFatigueAlert] = useState<string | null>(null);
  const [dismissedFatigue, setDismissedFatigue] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    callsMade: 0,
    conversations: 0,
    dealsAdvanced: 0,
    revenueInfluenced: 0,
    startedAt: new Date(),
    noAnswerStreak: 0,
    lastConversationAt: null,
  });

  const activeContact = contacts[activeIndex];
  const progress = contacts.length > 0 ? (completedIds.size / contacts.length) * 100 : 0;

  // Fatigue detection
  useEffect(() => {
    if (dismissedFatigue) return;
    const result = detectFatigue(stats);
    if (result?.fatigued) {
      setFatigueAlert(result.message);
    }
  }, [stats.callsMade, stats.conversations, stats.noAnswerStreak, dismissedFatigue]);

  const handleComplete = useCallback((hadConversation: boolean) => {
    setCompletedIds((prev) => new Set([...prev, activeContact.id]));
    setStats((prev) => ({
      ...prev,
      callsMade: prev.callsMade + 1,
      conversations: prev.conversations + (hadConversation ? 1 : 0),
      dealsAdvanced: prev.dealsAdvanced + (hadConversation && activeContact.priority.score >= 60 ? 1 : 0),
      revenueInfluenced: prev.revenueInfluenced + (hadConversation ? 15000 + Math.floor(Math.random() * 35000) : 0),
      noAnswerStreak: hadConversation ? 0 : prev.noAnswerStreak + 1,
      lastConversationAt: hadConversation ? Date.now() : prev.lastConversationAt,
    }));
    setFatigueAlert(null);
    setDismissedFatigue(false);

    // Auto-advance to next uncompleted
    const nextIndex = contacts.findIndex((c, i) => i > activeIndex && !completedIds.has(c.id));
    if (nextIndex >= 0) {
      setActiveIndex(nextIndex);
    } else {
      setShowRecap(true);
    }
  }, [activeContact, activeIndex, contacts, completedIds]);

  const handleSkip = useCallback(() => {
    const nextIndex = contacts.findIndex((c, i) => i > activeIndex && !completedIds.has(c.id));
    if (nextIndex >= 0) setActiveIndex(nextIndex);
  }, [activeIndex, contacts, completedIds]);

  const handleSwitchStrategy = useCallback(() => {
    setFatigueAlert(null);
    setDismissedFatigue(true);
    // Skip to next high-priority contact
    const nextHot = contacts.findIndex((c, i) => i > activeIndex && !completedIds.has(c.id) && c.priority.tier === "hot");
    if (nextHot >= 0) {
      setActiveIndex(nextHot);
    }
  }, [activeIndex, contacts, completedIds]);

  if (showRecap) {
    return (
      <SessionRecap
        stats={stats}
        totalContacts={contacts.length}
        onClose={() => navigate("/calendar")}
        onSchedule={() => navigate("/calendar")}
      />
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">No Priority Contacts</h2>
          <p className="text-sm text-muted-foreground mt-2">All contacts below the Priority Index threshold of 60. Your pipeline is clear.</p>
          <Button className="mt-4" onClick={() => navigate("/calendar")}>
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }

  const aiStrategy = activeContact ? getAIStrategy(activeContact) : null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar — minimal, focused */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Power Hour</h1>
            <p className="text-[10px] text-muted-foreground">This is what will move money today.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TimerDisplay startedAt={stats.startedAt} />

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">{completedIds.size}</span>
            <span>/ {contacts.length}</span>
          </div>

          <div className="w-32">
            <Progress value={progress} className="h-2" />
          </div>

          <Button size="sm" variant="ghost" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>

          <Button size="sm" variant="ghost" onClick={() => setShowRecap(true)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-px bg-border border-b border-border">
        {[
          { label: "Calls Made", value: stats.callsMade, icon: Phone, color: "text-primary" },
          { label: "Conversations", value: stats.conversations, icon: MessageSquare, color: "text-emerald-600" },
          { label: "Deals Advanced", value: stats.dealsAdvanced, icon: TrendingUp, color: "text-amber-600" },
          { label: "Revenue Influenced", value: `$${(stats.revenueInfluenced / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card px-4 py-2.5 flex items-center gap-2">
            <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
            <div>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Contact Queue */}
        <div className="w-[300px] border-r border-border bg-card overflow-y-auto p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Queue · Priority ≥ 60 · {contacts.length} contacts
          </p>
          {contacts.map((contact, i) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isActive={i === activeIndex}
              isCompleted={completedIds.has(contact.id)}
              onClick={() => !completedIds.has(contact.id) && setActiveIndex(i)}
            />
          ))}
        </div>

        {/* Active Call Panel */}
        <div className="flex-1 flex flex-col">
          {activeContact && !isPaused ? (
            <>
              {/* Contact Header */}
              <div className="px-8 py-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-foreground">{activeContact.name}</h2>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        getTierStyles(activeContact.priority.tier).bg,
                        getTierStyles(activeContact.priority.tier).text,
                        getTierStyles(activeContact.priority.tier).border,
                      )}>
                        {activeContact.priority.tier === "hot" ? "🔥" : ""} Priority: {activeContact.priority.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activeContact.address} · {activeContact.phone}</p>
                  </div>
                  <Button
                    size="lg"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => navigate(`/communications?channel=calls&filter=needs_action`)}
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                </div>
              </div>

              {/* AI Guidance */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                {/* Fatigue Alert */}
                {fatigueAlert && (
                  <FatigueAlert
                    message={fatigueAlert}
                    onDismiss={() => { setFatigueAlert(null); setDismissedFatigue(true); }}
                    onSwitch={handleSwitchStrategy}
                  />
                )}

                {/* AI Strategy — auto-selected */}
                {aiStrategy && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-foreground">AI Strategy</p>
                          <Badge variant="outline" className="text-[9px]">{aiStrategy.script}</Badge>
                          <Badge variant="outline" className="text-[9px] text-muted-foreground">{aiStrategy.tone}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{aiStrategy.strategy}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Breakdown */}
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs font-semibold text-foreground mb-3">Priority Score Breakdown</p>
                  <div className="space-y-2">
                    {[
                      { label: "Deal Value", value: activeContact.priority.components.dealValue, weight: "25%" },
                      { label: "Time Sensitivity", value: activeContact.priority.components.timeSensitivity, weight: "30%" },
                      { label: "Engagement Intent", value: activeContact.priority.components.engagementIntent, weight: "20%" },
                      { label: "Stage Weight", value: activeContact.priority.components.stageWeight, weight: "15%" },
                      { label: "Silence Risk", value: activeContact.priority.components.silenceRisk, weight: "10%" },
                    ].map((comp) => (
                      <div key={comp.label} className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-28 shrink-0">{comp.label}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              comp.value >= 70 ? "bg-red-500" : comp.value >= 40 ? "bg-amber-500" : "bg-muted-foreground/30",
                            )}
                            style={{ width: `${comp.value}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{comp.value}</span>
                        <span className="text-[9px] text-muted-foreground/50 w-6">{comp.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => handleComplete(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Connected — Log & Next
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleComplete(false)}
                  >
                    No Answer — Next
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Pause className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Power Hour paused</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">Ready when you are. AI is standing by.</p>
                <Button className="mt-4" onClick={() => setIsPaused(false)}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
