import * as React from "react";
import { cn } from "@/lib/utils";
import { useCallState } from "@/contexts/CallContext";
import { MODE_THEME, CHANNEL_CONFIG, type CallingModeKey, type Contact } from "./comms-config";
import { CollapsiblePanel, ChannelBadge, CallNotesSection, LiveCallSummaryCollapsible } from "./comms-ui-primitives";
import { CommsActionsFeed } from "./CommsActionsFeed";
import { ScheduledCallbacks, RecentCallLog, CampaignContext } from "@/components/dialer/intelligence";
import {
  Phone, Mail, MessageCircle, Sparkles, Sparkle, Home, MapPin, Star, Hand,
  Calendar, Zap, Target,
} from "lucide-react";
import { toast } from "sonner";

interface CoPilotPanelProps {
  contact: Contact | null;
  activeView: string;
  onQuickReply: (text: string) => void;
  callingMode?: CallingModeKey;
}

export function CoPilotPanel({ contact, activeView, onQuickReply, callingMode = "start" }: CoPilotPanelProps) {
  const callState = useCallState();
  const isLiveCall = callState.isCallActive && callState.callStatus === "connected";
  const theme = MODE_THEME[callingMode];
  const isPowerHour = callState.executionMode === "power-hour";
  const isDialerView = activeView === "dialer";

  return (
    <div className={cn(
      "hidden lg:flex w-[400px] border-l-2 flex-col min-h-0 h-full overflow-hidden transition-all duration-300",
      isLiveCall
        ? cn(theme.border, theme.bg, "shadow-[-6px_0_24px_-8px_rgba(0,0,0,0.08)]")
        : "border-border-subtle bg-background shadow-[-4px_0_20px_-5px_rgba(0,0,0,0.04)]"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b flex items-center justify-between transition-colors duration-300",
        isLiveCall ? cn("border-border/50", theme.headerBg) : "border-border-subtle bg-muted/30"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-300",
            isLiveCall ? theme.badge : "bg-muted"
          )}>
            <Sparkles className={cn("h-3.5 w-3.5 transition-colors duration-300", isLiveCall ? theme.accent : "text-muted-foreground")} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-foreground">AI Command Center</div>
            {!isLiveCall && (
              <div className="text-[11px] text-muted-foreground">
                {activeView === "dialer" ? "Directing call strategy" : "Analyzing & directing"}
              </div>
            )}
          </div>
        </div>
        {contact && (
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors duration-300",
            isLiveCall
              ? cn(theme.badge, theme.border)
              : "bg-success/10 border-success/20"
          )}>
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 transition-colors", isLiveCall ? theme.dot : "bg-success/70")} />
              <span className={cn("relative inline-flex rounded-full h-2 w-2 transition-colors", isLiveCall ? theme.dot : "bg-success")} />
            </span>
            <span className={cn("text-[10px] font-bold tracking-wider uppercase transition-colors", isLiveCall ? theme.badgeText : "text-success")}>
              {isLiveCall ? theme.label : "AI ACTIVE"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isDialerView && !isLiveCall ? (
          <div className="space-y-3">
            {isPowerHour ? (
              <>
                <div className="p-3 rounded-lg border-2 border-warning/30 bg-warning/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <span className="text-xs font-bold text-warning uppercase tracking-wider">Power Hour Active</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Focus mode — stats locked to session metrics. Campaign switching disabled.</div>
                </div>
                <CollapsiblePanel title="Scheduled Callbacks" icon={<Calendar className="h-3 w-3" />} defaultOpen={true}>
                  <ScheduledCallbacks compact />
                </CollapsiblePanel>
                <CollapsiblePanel title="Session Queue" icon={<Phone className="h-3 w-3" />} defaultOpen={true}>
                  <div className="text-xs text-muted-foreground">
                    {callState.dialerQueue.length > 0
                      ? `${callState.dialerQueueIndex + 1} of ${callState.dialerQueue.length} contacts`
                      : "No queue loaded"}
                  </div>
                </CollapsiblePanel>
              </>
            ) : (
              <>
                <button
                  onClick={() => toast.info("AI selecting best lead based on urgency and deal value...")}
                  className="w-full py-3 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary font-semibold text-sm hover:bg-primary/10 hover:border-primary/30 transition-all flex flex-col items-center gap-1"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkle className="h-4 w-4" />
                    Call Next Best Lead
                  </div>
                  <span className="text-[10px] text-muted-foreground font-normal">AI-selected based on urgency and deal value</span>
                </button>
                <CollapsiblePanel title="Scheduled Callbacks" icon={<Calendar className="h-3 w-3" />} defaultOpen={true}>
                  <ScheduledCallbacks />
                </CollapsiblePanel>
                <CollapsiblePanel title="AI Directive" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true} headerClassName="text-primary">
                  <div className="text-xs text-foreground leading-relaxed font-medium">
                    You have 1 overdue callback and 2 upcoming today. Prioritize David Park — he requested a callback yesterday and hasn't been reached.
                  </div>
                </CollapsiblePanel>
                <CollapsiblePanel title="AI Insights" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true}>
                  <div className="space-y-2">
                    {[
                      { icon: "🕐", text: "Best calling hours today: 10 AM - 12 PM based on your success patterns" },
                      { icon: "⚡", text: "5 hot leads haven't been contacted in 3+ days. Consider prioritizing them." },
                      { icon: "💡", text: "Your close rate improves 23% when you mention creative financing options" },
                    ].map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2 bg-muted/40 rounded-md">
                        <span className="text-sm mt-0.5">{insight.icon}</span>
                        <span className="text-[11px] text-muted-foreground leading-relaxed">{insight.text}</span>
                      </div>
                    ))}
                  </div>
                </CollapsiblePanel>
                <CollapsiblePanel title="Pending Actions" icon={<Zap className="h-3 w-3" />} defaultOpen={true}>
                  <CommsActionsFeed compact />
                </CollapsiblePanel>
                <CollapsiblePanel title="Campaign Context" icon={<Target className="h-3 w-3" />} defaultOpen={true}>
                  <CampaignContext />
                </CollapsiblePanel>
                <CollapsiblePanel title="Recent Calls" icon={<Phone className="h-3 w-3" />} defaultOpen={true}>
                  <RecentCallLog />
                </CollapsiblePanel>
              </>
            )}
          </div>
        ) : !contact ? (
          <div className="text-center py-10 text-muted-foreground">
            <Sparkles className="h-8 w-8 opacity-30 mx-auto mb-3" />
            <p className="text-[13px]">Select a contact to get AI-powered insights</p>
          </div>
        ) : isLiveCall ? (
          <div className="space-y-3">
            <CollapsiblePanel title="Contact Details" icon={<Home className="h-3 w-3" />} defaultOpen={true}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Home className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-medium text-foreground">{contact.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">
                    {[contact.city, contact.state].filter(Boolean).join(", ") || "—"}
                    {contact.zip ? ` ${contact.zip}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">{contact.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{contact.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Star className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-primary">{contact.tag}</span>
                </div>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Live Sentiment" defaultOpen={true}>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500",
                        callState.sentiment === "positive" ? "bg-success" :
                        callState.sentiment === "negative" ? "bg-destructive" : "bg-warning"
                      )}
                      style={{ width: `${callState.sentimentScore}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-bold capitalize",
                    callState.sentiment === "positive" ? "text-success" : callState.sentiment === "negative" ? "text-destructive" : "text-warning"
                  )}>
                    {callState.sentiment}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2">Deal Probability</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: "72%" }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 block">Based on sentiment + stage + engagement</span>
                    </div>
                    <div className="text-2xl font-bold text-primary font-mono">72%</div>
                  </div>
                </div>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Directive" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true} headerClassName="text-primary">
              <div className="text-xs text-foreground leading-relaxed font-medium">
                {contact.activities[contact.activities.length - 1]?.aiSuggestion?.replace(/^[^\w]*/, '').slice(0, 120) || "Listening for patterns..."}
              </div>
            </CollapsiblePanel>

            {callingMode !== "start" && (
              <button
                onClick={() => toast.info("Taking over call...")}
                className="w-full py-3 rounded-lg border-2 border-warning/30 bg-warning/5 text-warning font-semibold text-sm hover:bg-warning/10 hover:border-warning/40 transition-all flex items-center justify-center gap-2"
              >
                <Hand className="h-4 w-4" />
                Take Over Call
              </button>
            )}

            <CallNotesSection contactName={contact.name} />
            <LiveCallSummaryCollapsible />
          </div>
        ) : (
          <div className="space-y-3">
            <CollapsiblePanel title="Contact Details" icon={<Home className="h-3 w-3" />} defaultOpen={true}>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Home className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-medium text-foreground">{contact.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">
                    {[contact.city, contact.state].filter(Boolean).join(", ") || "—"}
                    {contact.zip ? ` ${contact.zip}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">{contact.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{contact.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Star className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-primary">{contact.tag}</span>
                </div>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Prospect Sentiment" defaultOpen={true}>
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-500"
                    style={{ width: contact.sentiment === "positive" ? "75%" : contact.sentiment === "neutral" ? "50%" : "25%" }}
                  />
                </div>
                <span className={cn(
                  "text-xs font-semibold capitalize",
                  contact.sentiment === "positive" ? "text-success" : contact.sentiment === "negative" ? "text-destructive" : "text-warning"
                )}>
                  {contact.sentiment}
                </span>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Directive" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true} headerClassName="text-primary">
              <div className="text-xs text-foreground leading-relaxed font-medium">
                {contact.activities[contact.activities.length - 1]?.aiSuggestion || "Awaiting data to generate directive."}
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Communication Summary" defaultOpen={true}>
              <div className="space-y-2">
                {Object.entries(
                  contact.activities.reduce<Record<string, number>>((acc, a) => { acc[a.channel] = (acc[a.channel] || 0) + 1; return acc; }, {})
                ).map(([ch, count]) => (
                  <div key={ch} className="flex items-center justify-between text-xs">
                    <ChannelBadge channel={ch} />
                    <span className="text-muted-foreground">{count} {count === 1 ? "interaction" : "interactions"}</span>
                  </div>
                ))}
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Related Conversations" defaultOpen={false}>
              <div className="space-y-1.5">
                {[...contact.activities].reverse().slice(0, 5).map((act) => {
                  const config = CHANNEL_CONFIG[act.channel];
                  const Icon = config?.icon || MessageCircle;
                  return (
                    <div key={act.id} className="flex items-center gap-2.5 py-1.5">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", config?.bgClass)}>
                        <Icon className={cn("h-2.5 w-2.5", config?.colorClass)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-foreground truncate font-medium">
                          {act.channel === "call" ? `${act.direction === "inbound" ? "Inbound" : "Outbound"} call · ${act.duration}` :
                           act.channel === "voicemail" ? `Voicemail · ${act.duration}` :
                           act.channel === "email" ? (act.subject || "Email") :
                           (act.content?.slice(0, 40) + (act.content && act.content.length > 40 ? "..." : ""))}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">{act.timestamp.replace("Today ", "").replace("Yesterday ", "Yest ")}</span>
                    </div>
                  );
                })}
              </div>
            </CollapsiblePanel>

            <CallNotesSection contactName={contact.name} />
            <LiveCallSummaryCollapsible />
          </div>
        )}
      </div>
    </div>
  );
}
