import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CHANNEL_CONFIG } from "./comms-config";
import {
  Phone, MessageCircle, Mail, Voicemail, Search, Star, Sparkles,
  Send, ChevronDown, ArrowDownLeft, ArrowUpRight,
  FileText, Calendar, Bot,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ============================================================================
// CHANNEL BADGE
// ============================================================================
export function ChannelBadge({ channel }: { channel: string }) {
  const config = CHANNEL_CONFIG[channel];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold", config.bgClass, config.colorClass)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ============================================================================
// DIRECTION BADGE
// ============================================================================
export function DirectionBadge({ direction }: { direction: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", direction === "inbound" ? "text-emerald-600" : "text-muted-foreground")}>
      {direction === "inbound" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
      {direction === "inbound" ? "In" : "Out"}
    </span>
  );
}

// ============================================================================
// CALL NOTES SECTION
// ============================================================================
export function CallNotesSection({ contactName }: { contactName: string }) {
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Notes saved");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
      <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2.5 flex items-center gap-1.5">
        <FileText className="h-3 w-3" /> Call Notes
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="No Notes Yet"
        className="w-full min-h-[80px] max-h-[160px] resize-y rounded-md border border-border bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">
          {notes.length > 0 ? `${notes.length} chars` : ""}
        </span>
        <button
          onClick={handleSave}
          disabled={notes.length === 0}
          className={cn(
            "px-3 py-1 rounded text-[11px] font-semibold transition-all",
            saved
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : notes.length > 0
                ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                : "bg-muted text-muted-foreground/50 border border-border/50 cursor-not-allowed"
          )}
        >
          {saved ? "✓ Saved" : "Save Notes"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COLLAPSIBLE PANEL
// ============================================================================
export function CollapsiblePanel({
  title,
  icon,
  defaultOpen = true,
  iconClassName,
  headerClassName,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  iconClassName?: string;
  headerClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground hover:bg-muted/30 transition-colors",
          headerClassName
        )}
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="px-3.5 pb-3">{children}</div>}
    </div>
  );
}

// ============================================================================
// LIVE CALL SUMMARY COLLAPSIBLE
// ============================================================================
export function LiveCallSummaryCollapsible() {
  return (
    <CollapsiblePanel title="AI Call Summary" icon={<Sparkles className="h-3 w-3" />} defaultOpen={false}>
      <div className="text-xs text-foreground leading-relaxed space-y-1.5">
        <div className="flex items-start gap-1.5">
          <span className="text-primary mt-0.5">•</span>
          <span>Seller confirmed ownership of property</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-primary mt-0.5">•</span>
          <span>Motivated — behind on payments 2 months</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-primary mt-0.5">•</span>
          <span>Timeline: wants to close within 30 days</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-muted-foreground mt-0.5 animate-pulse">•</span>
          <span className="text-muted-foreground italic">Listening for more details...</span>
        </div>
      </div>
    </CollapsiblePanel>
  );
}

// ============================================================================
// VIEW SWITCHER
// ============================================================================
export function ViewSwitcher({ activeView, onSwitch }: { activeView: string; onSwitch: (v: string) => void }) {
  const views = [
    { key: "activity", label: "All Activity", icon: MessageCircle, tooltip: "Review messages, missed calls, and voicemails" },
    { key: "dialer", label: "Dialer", icon: Phone, tooltip: "Start live calls with AI guidance" },
  ];
  return (
    <div className="flex gap-2">
      {views.map(({ key, label, icon: Icon, tooltip }) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onSwitch(key)}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all border",
                activeView === key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

// ============================================================================
// CHANNEL FILTERS
// ============================================================================
export function ChannelFilters({ activeFilter, onFilter }: { activeFilter: string; onFilter: (f: string) => void }) {
  const filters = [
    { key: "all", label: "All" },
    { key: "call", label: "Calls", icon: Phone, colorClass: "text-violet-500", bgClass: "bg-violet-500/10 border-violet-500/30" },
    { key: "sms", label: "SMS", icon: MessageCircle, colorClass: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-500/30" },
    { key: "email", label: "Email", icon: Mail, colorClass: "text-amber-500", bgClass: "bg-amber-500/10 border-amber-500/30" },
    { key: "voicemail", label: "Voicemail", icon: Voicemail, colorClass: "text-red-500", bgClass: "bg-red-500/10 border-red-500/30" },
  ];
  return (
    <div className="flex gap-1.5">
      {filters.map(({ key, label, icon: Icon, colorClass, bgClass }) => (
        <button
          key={key}
          onClick={() => onFilter(key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
            activeFilter === key
              ? (bgClass || "bg-primary/10 border-primary/30 text-primary")
              : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {Icon && <Icon className="h-3 w-3" />}
          {label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// STATUS FILTERS
// ============================================================================
export function StatusFilters({ activeStatus, onFilter }: { activeStatus: string; onFilter: (s: string) => void }) {
  const statuses = [
    { key: "all", label: "All" },
    { key: "unread", label: "New", dotClass: "bg-emerald-500" },
    { key: "starred", label: "Starred", dotClass: "bg-amber-500" },
    { key: "needs_response", label: "Needs Action", dotClass: "bg-violet-500" },
  ];
  return (
    <div className="flex gap-1.5">
      {statuses.map(({ key, label, dotClass }) => (
        <button
          key={key}
          onClick={() => onFilter(key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            activeStatus === key
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {dotClass && <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />}
          {label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// CHANNEL TOOLSET
// ============================================================================
export function ChannelToolset({ channel }: { channel: string }) {
  if (channel === "all") return null;

  if (channel === "call") {
    return (
      <div className="px-4 py-2 border-b border-border bg-violet-50/50 dark:bg-violet-500/5 flex flex-wrap gap-1.5">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-colors">
          <Phone className="h-3 w-3" /> Missed
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-colors">
          <ArrowDownLeft className="h-3 w-3" /> Inbound
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-colors">
          <ArrowUpRight className="h-3 w-3" /> Outbound
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/25 transition-colors">
          <Calendar className="h-3 w-3" /> Follow-Ups
        </button>
      </div>
    );
  }

  if (channel === "sms") {
    return (
      <div className="px-4 py-2 border-b border-border bg-blue-50/50 dark:bg-blue-500/5 flex flex-wrap gap-1.5">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/25 transition-colors">
          <FileText className="h-3 w-3" /> Templates
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/25 transition-colors">
          <Sparkles className="h-3 w-3" /> Drip
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/25 transition-colors">
          <Send className="h-3 w-3" /> Broadcast
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/25 transition-colors">
          <Bot className="h-3 w-3" /> Auto-Reply
        </button>
      </div>
    );
  }

  if (channel === "email") {
    return (
      <div className="px-4 py-2 border-b border-border bg-amber-50/50 dark:bg-amber-500/5 flex flex-wrap gap-1.5">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/25 transition-colors">
          <FileText className="h-3 w-3" /> Templates
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/25 transition-colors">
          <Sparkles className="h-3 w-3" /> Compose
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/25 transition-colors">
          <Send className="h-3 w-3" /> Campaigns
        </button>
      </div>
    );
  }

  if (channel === "voicemail") {
    return (
      <div className="px-4 py-2 border-b border-border bg-red-50/50 dark:bg-red-500/5 flex flex-wrap gap-1.5">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25 transition-colors">
          <FileText className="h-3 w-3" /> Transcribe
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25 transition-colors">
          <Sparkles className="h-3 w-3" /> Summary
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25 transition-colors">
          <Phone className="h-3 w-3" /> Callback
        </button>
      </div>
    );
  }

  return null;
}
