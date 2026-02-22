import * as React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCallState, type ExecutionMode } from "@/contexts/CallContext";
import { LiveCallInline } from "@/components/calling/LiveCallInline";
import { DailyGoalsTracker } from "@/components/dialer/daily-goals-tracker";
import { PostCallActions } from "@/components/dialer/post-call-actions";
import { CampaignBadge } from "@/components/dialer/campaign-badge";
import { DialerIntelligenceBar, ScheduledCallbacks, RecentCallLog, CampaignContext } from "@/components/dialer/intelligence";
import { AppLayout } from "@/components/layout/AppLayout";
import { useDealSources, useUpdateDealSource, useDeleteDealSource, type DealSource } from "@/hooks/useDealSources";
import {
  Phone,
  MessageCircle,
  Mail,
  Voicemail,
  Search,
  Star,
  Sparkles,
  Sparkle,
  Send,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Play, 
  Mic,
  ArrowDownLeft,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  Plus,
  Download,
  Trash2,
  FolderOpen,
  UserPlus,
  X,
  FileText,
  MapPin,
  Home,
  Calendar,
  Copy,
  MoreVertical,
  Pencil,
  Hand,
  Bot,
  Zap,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================================================
// CALLING MODE THEME CONFIG
// ============================================================================
export type CallingModeKey = "start" | "voice" | "listen";

const MODE_THEME: Record<CallingModeKey, {
  label: string;
  accent: string;        // text color
  bg: string;            // bg tint
  border: string;        // border color
  badge: string;         // badge bg
  badgeText: string;     // badge text
  dot: string;           // dot/pulse color
  headerBg: string;      // header background
}> = {
  start: {
    label: "LIVE: Human",
    accent: "text-emerald-600",
    bg: "bg-emerald-500/[0.03]",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/10",
    badgeText: "text-emerald-600",
    dot: "bg-emerald-500",
    headerBg: "bg-emerald-500/[0.04]",
  },
  voice: {
    label: "LIVE: AI Agent",
    accent: "text-blue-600",
    bg: "bg-blue-500/[0.03]",
    border: "border-blue-500/20",
    badge: "bg-blue-500/10",
    badgeText: "text-blue-600",
    dot: "bg-blue-500",
    headerBg: "bg-blue-500/[0.04]",
  },
  listen: {
    label: "LIVE: Hybrid",
    accent: "text-violet-600",
    bg: "bg-violet-500/[0.03]",
    border: "border-violet-500/20",
    badge: "bg-violet-500/10",
    badgeText: "text-violet-600",
    dot: "bg-violet-500",
    headerBg: "bg-violet-500/[0.04]",
  },
};

// ============================================================================
// EXECUTION MODE THEME CONFIG
// ============================================================================
const EXECUTION_MODE_THEME: Record<ExecutionMode, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
}> = {
  manual: { label: "Manual", icon: Play, bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
  "power-hour": { label: "Power Hour", icon: Zap, bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
  campaign: { label: "Campaign", icon: Target, bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/20" },
  team: { label: "Team", icon: Users, bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
};

// ============================================================================
// CHANNEL CONFIG
// ============================================================================
const CHANNEL_CONFIG: Record<string, { icon: React.ElementType; label: string; colorClass: string; bgClass: string }> = {
  call: { icon: Phone, label: "Call", colorClass: "text-violet-500", bgClass: "bg-violet-500/10" },
  sms: { icon: MessageCircle, label: "SMS", colorClass: "text-blue-500", bgClass: "bg-blue-500/10" },
  email: { icon: Mail, label: "Email", colorClass: "text-amber-500", bgClass: "bg-amber-500/10" },
  voicemail: { icon: Voicemail, label: "Voicemail", colorClass: "text-red-500", bgClass: "bg-red-500/10" },
};

function ChannelBadge({ channel }: { channel: string }) {
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

// Notes & Summary section for the Strategy Panel
function CallNotesSection({ contactName }: { contactName: string }) {
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

// Reusable collapsible panel for right-panel sections
function CollapsiblePanel({
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

// Collapsible AI Call Summary — collapsed by default
function LiveCallSummaryCollapsible() {
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

function DirectionBadge({ direction }: { direction: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", direction === "inbound" ? "text-emerald-600" : "text-muted-foreground")}>
      {direction === "inbound" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
      {direction === "inbound" ? "In" : "Out"}
    </span>
  );
}

// ============================================================================
// TYPES & MOCK DATA
// ============================================================================
interface Activity {
  id: string;
  channel: string;
  direction: string;
  timestamp: string;
  duration?: string;
  summary?: string;
  content?: string;
  subject?: string;
  sentiment?: string;
  aiSuggestion?: string;
}

interface Contact {
  id: string;
  name: string;
  address: string;
  tag: string;
  avatar: string;
  sentiment: string;
  lastActivity: string;
  unread: boolean;
  starred: boolean;
  activities: Activity[];
  // DB-linked fields from deal_sources
  dbId?: string; // deal_sources.id for linking
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: string;
  contactType?: string;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c1", name: "Marcus Williams", address: "1847 Maple Street",
    phone: "(813) 555-0147", email: "marcus.williams@gmail.com", city: "Tampa", state: "FL", zip: "33602",
    tag: "Motivated Seller", avatar: "MW", sentiment: "neutral", contactType: "seller",
    lastActivity: "2 min ago", unread: true, starred: true,
    activities: [
      { id: "a0v", channel: "voicemail", direction: "inbound", timestamp: "Yesterday 4:15 PM", duration: "1:12", content: "Hi, this is Marcus Williams calling about 1847 Maple Street. I got your letter and I'm interested in hearing what you'd offer. The house needs work and I'm looking to move quickly. Please call me back at your earliest convenience. Thanks.", sentiment: "positive", aiSuggestion: "⚡ HIGH INTENT — Call back now. Lead with empathy on property condition, emphasize your ability to close in 14 days. Do not wait past 1 hour." },
      { id: "a0e", channel: "email", direction: "outbound", timestamp: "Yesterday 5:30 PM", subject: "Re: Your Property at 1847 Maple Street", content: "Hi Marcus, thanks for reaching out about your property. I'd love to learn more about your situation and timeline. I specialize in buying homes as-is, so no repairs needed on your end. Would tomorrow morning work for a quick call?", sentiment: "positive", aiSuggestion: "✓ 75-min response time. Trust score rising. Maintain this cadence." },
      { id: "a0ei", channel: "email", direction: "inbound", timestamp: "Today 8:15 AM", subject: "Re: Your Property at 1847 Maple Street", content: "Morning works. I'm free between 10-11. Just so you know, I've had two other investors reach out but nobody's given me a straight answer yet. I appreciate you being upfront.", sentiment: "neutral", aiSuggestion: "⚠ Competitor pressure + frustration with vagueness. Present a clear offer range on the 10 AM call. Be the first investor to give him real numbers." },
      { id: "a1", channel: "call", direction: "outbound", timestamp: "Today 10:32 AM", duration: "5:19", summary: "Cold call — seller confirmed interest but frustrated with timeline. Property been sitting 8 months. Foundation issues and roof needs replacement. Seller relocating for work in 60 days. Open to creative terms if price is right. ARV estimated $285k, repairs ~$45k.", sentiment: "neutral", aiSuggestion: "🎯 ACTION: Send offer range ($165k–$180k cash or subject-to) by tomorrow 9 AM. 60-day relocation deadline = your leverage. Pitch seller financing to maximize structure." },
      { id: "a2", channel: "sms", direction: "outbound", timestamp: "Today 10:45 AM", content: "Hey Marcus, great chatting. As discussed, I'll have some numbers for you by tomorrow. Talk soon!", sentiment: "positive" },
      { id: "a3", channel: "sms", direction: "inbound", timestamp: "Today 11:02 AM", content: "Sounds good. Just don't lowball me like the last guy. I know what the place is worth.", sentiment: "negative", aiSuggestion: "⚠ Price sensitivity triggered. Do NOT lead with a low cash number. Show your math: ARV $285k → repairs $45k → your offer $180k. Transparency wins this seller." },
      { id: "a3v", channel: "voicemail", direction: "outbound", timestamp: "Today 2:30 PM", duration: "0:38", content: "Left voicemail: Hey Marcus, it's me following up. I've run the numbers and I think we can put together something that works for both of us. Give me a call back when you get a chance — I'll walk you through everything.", sentiment: "positive", aiSuggestion: "📋 4 channels touched in 24hrs — strong cadence. NEXT: Send follow-up SMS at 10 AM tomorrow with specific offer range ($165k–$180k). Create urgency." },
    ],
  },
  {
    id: "c2", name: "John Smith", address: "123 Main St",
    phone: "(727) 555-0238", email: "john.smith@outlook.com", city: "St. Petersburg", state: "FL", zip: "33701",
    tag: "Seller", avatar: "JS", sentiment: "positive", contactType: "seller",
    lastActivity: "1 hr ago", unread: true, starred: false,
    activities: [
      { id: "a4", channel: "email", direction: "inbound", timestamp: "Today 9:15 AM", subject: "Re: Cash Offer for 123 Main St", content: "Thank you for your offer. I've reviewed the terms and I'm interested in discussing further. When would be a good time to connect?", sentiment: "positive", aiSuggestion: "🔥 HOT — Book a call NOW. Reply with available times within 15 minutes. Every hour of delay drops conversion 12%." },
    ],
  },
  {
    id: "c3", name: "Sarah Johnson", address: "456 Oak Ave",
    phone: "(813) 555-0391", email: "sarah.johnson@kw.com", city: "Tampa", state: "FL", zip: "33609",
    tag: "Agent", avatar: "SJ", sentiment: "neutral", contactType: "agent",
    lastActivity: "3 hrs ago", unread: false, starred: true,
    activities: [
      { id: "a5", channel: "sms", direction: "inbound", timestamp: "Today 7:30 AM", content: "Hi, my client received your offer and wants to counter at $285k. Let me know if you're interested.", sentiment: "neutral", aiSuggestion: "📊 Counter at $270k. Pair with flexible 30-day close to offset price gap. $285k is 8% above MAO — do not accept." },
      { id: "a6", channel: "email", direction: "inbound", timestamp: "Yesterday 4:12 PM", subject: "(No subject)", content: "Forwarding the seller's disclosure docs. Let me know if you have questions.", sentiment: "neutral" },
    ],
  },
  {
    id: "c4", name: "Lisa Chen", address: "321 Pine Dr",
    phone: "(941) 555-0462", email: "lisa.chen@compass.com", city: "Sarasota", state: "FL", zip: "34236",
    tag: "Agent", avatar: "LC", sentiment: "positive", contactType: "agent",
    lastActivity: "1 day ago", unread: false, starred: true,
    activities: [
      { id: "a7", channel: "voicemail", direction: "inbound", timestamp: "Yesterday 2:30 PM", duration: "0:45", content: "Left voicemail at 2:30pm. Client is very motivated and wants to discuss the offer ASAP.", sentiment: "positive", aiSuggestion: "🚨 URGENT — Call back immediately. Motivated seller via agent = fastest close path. Lock appointment today." },
      { id: "a8", channel: "call", direction: "outbound", timestamp: "Yesterday 3:15 PM", duration: "12:40", summary: "Discussed seller's timeline — they need to close within 45 days due to relocation. Price flexible if we can guarantee close.", sentiment: "positive" },
    ],
  },
  {
    id: "c5", name: "Mike Williams", address: "789 Elm Blvd",
    phone: "(352) 555-0573", email: "mike.w@yahoo.com", city: "Ocala", state: "FL", zip: "34471",
    tag: "Seller", avatar: "MW2", sentiment: "neutral", contactType: "seller",
    lastActivity: "6 hrs ago", unread: false, starred: false,
    activities: [
      { id: "a9", channel: "sms", direction: "inbound", timestamp: "Today 4:22 AM", content: "I saw you mentioned a 14-day close. Is there any flexibility on that? I need at least 30 days to find a new place.", sentiment: "neutral", aiSuggestion: "✅ Grant 30-day close — costs you nothing, wins the deal. Reply now: 'Absolutely, 30 days works. Let's lock this in.'" },
    ],
  },
  {
    id: "c6", name: "Robert Davis", address: "555 Maple Ct",
    phone: "(407) 555-0684", email: "rdavis88@gmail.com", city: "Orlando", state: "FL", zip: "32801",
    tag: "Seller", avatar: "RD", sentiment: "neutral", contactType: "seller",
    lastActivity: "2 days ago", unread: false, starred: false,
    activities: [
      { id: "a10", channel: "email", direction: "inbound", timestamp: "2 days ago", subject: "Response to Direct Mail - 555 Maple Ct", content: "Received your letter. I'm interested but have questions about the as-is condition clause. What exactly does that cover?", sentiment: "neutral", aiSuggestion: "📩 Direct mail conversion. Reply with as-is explainer + schedule walkthrough this week. Use template: 'As-Is Benefits for Sellers'." },
    ],
  },
];

const MOCK_DIALER_QUEUE = [
  { id: "d1", name: "Robert Martinez", address: "234 Elm Drive", time: "10:30 AM", type: "Follow-up", phone: "(555) 123-4567", campaign: "Q1 Tampa Absentee Sellers" },
  { id: "d2", name: "Jennifer Lee", address: "567 Cedar Lane", time: "11:00 AM", type: "Callback", phone: "(555) 234-5678", campaign: "Q1 Tampa Absentee Sellers" },
  { id: "d3", name: "David Park", address: "890 Birch St", time: "11:30 AM", type: "Cold Call", phone: "(555) 345-6789", campaign: "Expired Listings Feb" },
  { id: "d4", name: "Angela Torres", address: "112 Walnut Way", time: "12:00 PM", type: "Follow-up", phone: "(555) 456-7890", campaign: "Expired Listings Feb" },
  { id: "d5", name: "Tom Bradley", address: "445 Spruce Ave", time: "1:00 PM", type: "Cold Call", phone: "(555) 567-8901", campaign: "Pre-Foreclosure Outreach" },
];

const MOCK_CALL_SCRIPTS = [
  { id: "s1", name: "Follow-Up", type: "OUTBOUND", desc: "Re-engage warm leads", progress: 68 },
  { id: "s2", name: "Follow-Up Close", type: "OUTBOUND", desc: "Second touch negotiation", progress: 42 },
  { id: "s3", name: "Agent Intro", type: "OUTBOUND", desc: "Pitch to listing agents", progress: 15 },
];

// ============================================================================
// VIEW SWITCHER
// ============================================================================
function ViewSwitcher({ activeView, onSwitch }: { activeView: string; onSwitch: (v: string) => void }) {
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
function ChannelFilters({ activeFilter, onFilter }: { activeFilter: string; onFilter: (f: string) => void }) {
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
function StatusFilters({ activeStatus, onFilter }: { activeStatus: string; onFilter: (s: string) => void }) {
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
// CHANNEL-SPECIFIC TOOLSET
// ============================================================================
function ChannelToolset({ channel }: { channel: string }) {
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

// ============================================================================
// CONTACT LIST ITEM
// ============================================================================
function ContactListItem({ contact, isActive, onClick, onCall, onSms, onCopy }: { 
  contact: Contact; isActive: boolean; onClick: () => void;
  onCall?: () => void; onSms?: () => void; onCopy?: () => void;
}) {
  const lastAct = contact.activities[contact.activities.length - 1];
  const ChannelIcon = lastAct ? CHANNEL_CONFIG[lastAct.channel]?.icon : null;
  const channelColorClass = lastAct ? CHANNEL_CONFIG[lastAct.channel]?.colorClass : "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-border/50 relative",
        isActive ? "bg-muted/80 border-l-[3px] border-l-primary" : "border-l-[3px] border-l-transparent hover:bg-muted/40"
      )}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-[13px] font-bold text-primary-foreground">
          {contact.avatar}
        </div>
        {contact.unread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-[13px] truncate", contact.unread ? "font-bold text-foreground" : "font-medium text-foreground")}>
            {contact.name}
          </span>
          {/* Hover actions - far right */}
          <TooltipProvider delayDuration={0}>
            <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); onCall?.(); }}
                    className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Call</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); onSms?.(); }}
                    className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>SMS</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={e => { e.stopPropagation(); onCopy?.(); }}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Copy Phone</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          {/* Timestamp (hidden on hover) */}
          <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0 group-hover:hidden">
            {contact.lastActivity}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
          <span>{contact.address}</span>
          {contact.starred && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 truncate">
          {ChannelIcon && <ChannelIcon className={cn("h-3 w-3 flex-shrink-0", channelColorClass)} />}
          <span className="truncate">{lastAct?.content || lastAct?.summary || lastAct?.subject || "Call ended"}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONVERSATION THREAD
// ============================================================================
function ConversationThread({
  contact,
  onCall,
  onSendMessage,
  messageInput,
  onMessageInputChange,
  sendChannel,
  onSendChannelChange,
  autoSelectedReason,
  onDismissAutoSelect,
  onEditContact,
  onDeleteContact,
  onSwitchToDialer,
  onStartPowerHour,
}: {
  contact: Contact | null;
  onCall: () => void;
  onSendMessage: () => void;
  messageInput: string;
  onMessageInputChange: (val: string) => void;
  sendChannel: string;
  onSendChannelChange: (ch: string) => void;
  autoSelectedReason?: string | null;
  onDismissAutoSelect?: () => void;
  onEditContact?: () => void;
  onDeleteContact?: () => void;
  onSwitchToDialer?: () => void;
  onStartPowerHour?: () => void;
}) {
  const callState = useCallState();
  const [contactDetailsOpen, setContactDetailsOpen] = useState(true);
  const composeInputRef = React.useRef<HTMLInputElement>(null);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-6 text-muted-foreground px-8">
        {/* First-Time Welcome State */}
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">Welcome to Communications</h2>
            <p className="text-sm text-muted-foreground">This is where deals move forward. Messages, calls, and AI guidance work together here.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Inbox Tile */}
            <div className="p-5 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer" onClick={() => { /* already on inbox view */ }}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Inbox</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Review messages, missed calls, and voicemails. AI highlights what needs action.</p>
              <span className="text-xs font-semibold text-primary group-hover:underline">View Inbox →</span>
            </div>
            
              {/* Dialer Tile */}
            <div className="p-5 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer" onClick={() => onSwitchToDialer?.()}>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <Phone className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Dialer</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Make live calls with real-time AI coaching.</p>
              <span className="text-xs font-semibold text-primary group-hover:underline">Start Dialing →</span>
            </div>
            
            {/* Power Hour Tile */}
            <div className="p-5 rounded-xl border border-border bg-background hover:border-amber-500/30 hover:shadow-sm transition-all group cursor-pointer" onClick={() => onStartPowerHour?.()}>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Power Hour</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">60 minutes of focused calling. No distractions. Just execution.</p>
              <span className="text-xs font-semibold text-amber-600 group-hover:underline">Start Power Hour →</span>
            </div>
          </div>
          
          {/* AI Guidance Banner */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/15 bg-primary/[0.03]">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Not sure where to start? AI will guide you to the highest-impact action.</p>
            </div>
            <button
              onClick={() => toast.info("AI analyzing your pipeline for the best next action...")}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Show Me What to Do
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Thread Header - Fixed */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
            {contact.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-foreground">{contact.name}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{contact.lastActivity}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCall}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
                  callState.isCallActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
                )}
              >
                <Phone className="h-3.5 w-3.5" /> Call Now
              </button>
            </TooltipTrigger>
            <TooltipContent>Call with real-time AI coaching</TooltipContent>
          </Tooltip>
          <button
            onClick={() => { onSendChannelChange("sms"); toast.info("Channel set to SMS"); setTimeout(() => composeInputRef.current?.focus(), 100); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
              sendChannel === "sms"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" /> SMS
          </button>
          <button
            onClick={() => { onSendChannelChange("email"); toast.info("Channel set to Email"); setTimeout(() => composeInputRef.current?.focus(), 100); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
              sendChannel === "email"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
            )}
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditContact}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteContact} className="text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* AI Readiness Nudge */}
      {(() => {
        const lastAct = contact.activities[contact.activities.length - 1];
        const hasReplyKeyword = lastAct?.content && /\b(call|talk|when can you|discuss)\b/i.test(lastAct.content);
        const isInbound = lastAct?.direction === "inbound";
        const isHardReady = hasReplyKeyword && isInbound;
        const isSoftReady = isInbound && !hasReplyKeyword;
        
        if (isHardReady) {
          return (
            <div className="mx-5 mt-3 flex items-center gap-3 p-3.5 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">This contact is ready for a live conversation.</p>
                <p className="text-[11px] text-muted-foreground">Calling now increases conversion likelihood.</p>
              </div>
              <button
                onClick={onCall}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <Phone className="h-3 w-3" /> Call Now
              </button>
            </div>
          );
        }
        
        if (isSoftReady) {
          return (
            <div className="mx-5 mt-3 flex items-center gap-3 p-3 rounded-xl border border-primary/15 bg-primary/[0.03]">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground flex-1">You have warm leads ready to call. Want to switch to Dialer mode?</p>
              <button
                onClick={onCall}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors whitespace-nowrap"
              >
                Start Dialing
              </button>
              <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                Not Now
              </button>
            </div>
          );
        }
        
        return null;
      })()}

      {/* Activity Timeline */}
      <div className="flex-1 min-h-0 overflow-auto p-5">
        {[...contact.activities].reverse().map((act, i) => {
          const config = CHANNEL_CONFIG[act.channel];
          const Icon = config?.icon || MessageCircle;
          return (
            <div key={act.id} className="flex gap-3.5 mb-5">
              <div className="flex flex-col items-center w-8 flex-shrink-0">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config?.bgClass)}>
                  <Icon className={cn("h-3.5 w-3.5", config?.colorClass)} />
                </div>
                {i < contact.activities.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1" />
                )}
              </div>
              <div className="flex-1 bg-muted/50 rounded-lg p-3.5 border border-border/50">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <ChannelBadge channel={act.channel} />
                  <DirectionBadge direction={act.direction} />
                  {act.duration && (
                    <span className="text-[11px] text-muted-foreground font-mono">{act.duration}</span>
                  )}
                  <span className="text-[11px] text-muted-foreground ml-auto">{act.timestamp}</span>
                </div>
                {act.subject && (
                  <div className="text-[13px] font-semibold text-foreground mb-1.5">{act.subject}</div>
                )}
                <div className="text-[13px] text-muted-foreground leading-relaxed">
                  {act.content || act.summary}
                </div>
                {act.aiSuggestion && (
                   <div className="mt-2.5 p-3 bg-emerald-50/60 border border-emerald-100 border-l-[3px] border-l-emerald-400 rounded-md flex gap-2 items-start">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground leading-relaxed font-medium">{act.aiSuggestion}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Command Surface */}
      <div className="border-t border-border flex-shrink-0">
        {/* Power tools row */}
        <div className="px-5 py-2 flex items-center gap-2 border-b border-border/50">
          <button
            onClick={() => {
              const lastAi = [...contact.activities].reverse().find(a => a.aiSuggestion);
              if (lastAi?.aiSuggestion) {
                const actionText = lastAi.aiSuggestion.replace(/^[^\w]*/, '').slice(0, 100);
                onMessageInputChange(actionText);
                toast.info("AI directive loaded");
              } else {
                toast.info("No active directive");
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-primary bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="h-3 w-3" /> Follow Directive
          </button>
          <button
            onClick={() => {
              onMessageInputChange("Based on comparable sales in the area, I'm looking at an offer range of $165k–$180k. Let me walk you through the numbers.");
              toast.info("Offer range template inserted");
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50 transition-colors"
          >
            <FileText className="h-3 w-3" /> Insert Offer
          </button>
          <button
            onClick={() => {
              if (messageInput.trim()) {
                toast.info("Rewriting with AI...");
                setTimeout(() => {
                  onMessageInputChange(messageInput.trim() + " — I'd love to discuss this further and find a solution that works for your timeline.");
                  toast.success("Message enhanced");
                }, 800);
              } else {
                toast.info("Type a message first");
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50 transition-colors"
          >
            <Sparkles className="h-3 w-3" /> Rewrite
          </button>
        </div>
        {/* Input row */}
        <div className="px-5 py-3.5 flex gap-2.5 items-center">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3.5 py-2.5 border border-border">
            <input
              ref={composeInputRef}
              placeholder={sendChannel === "email" ? "Compose email..." : "Type a message..."}
              value={messageInput}
              onChange={e => onMessageInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-foreground text-[13px] placeholder:text-muted-foreground"
            />
            <button
              onClick={() => {
                const channels = ["sms", "email"];
                const idx = channels.indexOf(sendChannel);
                onSendChannelChange(channels[(idx + 1) % channels.length]);
              }}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors",
                sendChannel === "sms" ? "bg-blue-500/10 text-blue-500" :
                sendChannel === "email" ? "bg-amber-500/10 text-amber-500" :
                "bg-muted text-muted-foreground"
              )}
            >
              {sendChannel ? sendChannel.toUpperCase() : "SMS"}
            </button>
          </div>
          <button
            onClick={onSendMessage}
            disabled={!messageInput.trim()}
            className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AI CO-PILOT PANEL
// ============================================================================
function CoPilotPanel({
  contact,
  activeView,
  onQuickReply,
  callingMode = "start",
}: {
  contact: Contact | null;
  activeView: string;
  onQuickReply: (text: string) => void;
  callingMode?: CallingModeKey;
}) {
  const callState = useCallState();
  const isLiveCall = callState.isCallActive && callState.callStatus === "connected";
  const theme = MODE_THEME[callingMode];
  const isPowerHour = callState.executionMode === "power-hour";
  const isDialerView = activeView === "dialer";

  return (
    <div className={cn(
      "w-[400px] border-l-2 flex flex-col overflow-hidden transition-all duration-300",
      isLiveCall
        ? cn(theme.border, theme.bg, "shadow-[-6px_0_24px_-8px_rgba(0,0,0,0.08)]")
        : "border-primary/15 bg-background shadow-[-4px_0_20px_-5px_hsl(var(--primary)/0.06)]"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b flex items-center justify-between transition-colors duration-300",
        isLiveCall ? cn("border-border/50", theme.headerBg) : "border-primary/10 bg-primary/[0.02]"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-300",
            isLiveCall ? theme.badge : "bg-primary/10"
          )}>
            <Sparkles className={cn("h-3.5 w-3.5 transition-colors duration-300", isLiveCall ? theme.accent : "text-primary")} />
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
              : "bg-emerald-500/10 border-emerald-500/20"
          )}>
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 transition-colors", isLiveCall ? theme.dot : "bg-emerald-400")} />
              <span className={cn("relative inline-flex rounded-full h-2 w-2 transition-colors", isLiveCall ? theme.dot : "bg-emerald-500")} />
            </span>
            <span className={cn("text-[10px] font-bold tracking-wider uppercase transition-colors", isLiveCall ? theme.badgeText : "text-emerald-600")}>
              {isLiveCall ? theme.label : "AI ACTIVE"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* ===== DIALER VIEW (No contact needed) — Intelligence Stack ===== */}
        {isDialerView && !isLiveCall ? (
          <div className="space-y-3">
            {/* Power Hour Override: Simplified stack */}
            {isPowerHour ? (
              <>
                <div className="p-3 rounded-lg border-2 border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Power Hour Active</span>
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
                {/* Call Next Best Lead CTA */}
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
                {/* Scheduled Callbacks — First-Class */}
                <CollapsiblePanel title="Scheduled Callbacks" icon={<Calendar className="h-3 w-3" />} defaultOpen={true}>
                  <ScheduledCallbacks />
                </CollapsiblePanel>

                {/* AI Directive */}
                <CollapsiblePanel title="AI Directive" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true} headerClassName="text-primary">
                  <div className="text-xs text-foreground leading-relaxed font-medium">
                    You have 1 overdue callback and 2 upcoming today. Prioritize David Park — he requested a callback yesterday and hasn't been reached.
                  </div>
                </CollapsiblePanel>

                {/* AI Insights */}
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

                {/* Campaign Context */}
                <CollapsiblePanel title="Campaign Context" icon={<Target className="h-3 w-3" />} defaultOpen={true}>
                  <CampaignContext />
                </CollapsiblePanel>

                {/* Recent Call Log (Last 5) */}
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
          /* ===== LIVE MODE — Focused & Urgent ===== */
          <div className="space-y-3">
            {/* 1. Contact Details — Always Top */}
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

            {/* 2. Live Sentiment + Deal Probability */}
            <CollapsiblePanel title="Live Sentiment" defaultOpen={true}>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500",
                        callState.sentiment === "positive" ? "bg-emerald-500" :
                        callState.sentiment === "negative" ? "bg-red-500" : "bg-amber-500"
                      )}
                      style={{ width: `${callState.sentimentScore}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-bold capitalize",
                    callState.sentiment === "positive" ? "text-emerald-600" : callState.sentiment === "negative" ? "text-red-500" : "text-amber-500"
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

            {/* 3. Directive */}
            <CollapsiblePanel title="Directive" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true} headerClassName="text-primary">
              <div className="text-xs text-foreground leading-relaxed font-medium">
                {contact.activities[contact.activities.length - 1]?.aiSuggestion?.replace(/^[^\w]*/, '').slice(0, 120) || "Listening for patterns..."}
              </div>
            </CollapsiblePanel>

            {/* 4. Take Over Call (only when AI Agent or Hybrid active) */}
            {callingMode !== "start" && (
              <button
                onClick={() => toast.info("Taking over call...")}
                className="w-full py-3 rounded-lg border-2 border-amber-300 bg-amber-50/80 text-amber-700 font-semibold text-sm hover:bg-amber-100 hover:border-amber-400 transition-all flex items-center justify-center gap-2"
              >
                <Hand className="h-4 w-4" />
                Take Over Call
              </button>
            )}

            {/* 5. Call Notes (auto-filled + editable) */}
            <CallNotesSection contactName={contact.name} />

            {/* 6. AI Call Summary (collapsed by default) */}
            <LiveCallSummaryCollapsible />
          </div>
        ) : (
          /* ===== STATIC MODE (NOT ON CALL) ===== */
          <div className="space-y-3">
            {/* 1. Contact Details */}
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

            {/* 2. Prospect Sentiment */}
            <CollapsiblePanel title="Prospect Sentiment" defaultOpen={true}>
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: contact.sentiment === "positive" ? "75%" : contact.sentiment === "neutral" ? "50%" : "25%" }}
                  />
                </div>
                <span className={cn(
                  "text-xs font-semibold capitalize",
                  contact.sentiment === "positive" ? "text-emerald-600" : contact.sentiment === "negative" ? "text-red-500" : "text-amber-500"
                )}>
                  {contact.sentiment}
                </span>
              </div>
            </CollapsiblePanel>

            {/* 3. Directive */}
            <CollapsiblePanel title="Directive" icon={<Sparkles className="h-3 w-3" />} defaultOpen={true} headerClassName="text-primary">
              <div className="text-xs text-foreground leading-relaxed font-medium">
                {contact.activities[contact.activities.length - 1]?.aiSuggestion || "Awaiting data to generate directive."}
              </div>
            </CollapsiblePanel>

            {/* 4. Communication Summary */}
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

            {/* 5. Related Conversations */}
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

            {/* 6. Notes */}
            <CallNotesSection contactName={contact.name} />

            {/* 7. AI Summary (collapsed) */}
            <LiveCallSummaryCollapsible />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DIALER VIEW
// ============================================================================
function DialerView({ callingMode, setCallingMode, focusMode = false, isPowerHour = false, onToggleFocus }: { callingMode: CallingModeKey; setCallingMode: (m: CallingModeKey) => void; focusMode?: boolean; isPowerHour?: boolean; onToggleFocus?: () => void }) {
  const callState = useCallState();
  const navigate = useNavigate();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [dialerContacts, setDialerContacts] = useState(MOCK_DIALER_QUEUE);
  const [calledContactIds, setCalledContactIds] = useState<Set<string>>(new Set());
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const modes = [
    { key: "start", label: "Call Now", desc: "CALL WITH REAL-TIME AI COACHING", icon: Play, colorClass: "bg-primary text-primary-foreground", inactiveClass: "bg-primary/5 text-foreground border-primary/20" },
    { key: "voice", label: "Voice Agent", desc: "AI HANDLES THE CALL AUTONOMOUSLY", icon: Mic, colorClass: "bg-violet-500 text-white", inactiveClass: "bg-violet-500/5 text-foreground border-violet-500/20", beta: true },
    { key: "listen", label: "Listen Mode", desc: "CAPTURE EXTERNAL CALLS (ZOOM, MEET, ETC.)", icon: Phone, colorClass: "bg-blue-500 text-white", inactiveClass: "bg-blue-500/5 text-foreground border-blue-500/20" },
  ];

  const handleCallFromQueue = (item: typeof MOCK_DIALER_QUEUE[0]) => {
    if (callingMode === "voice") {
      toast.info(`AI Voice Agent calling ${item.name}...`, { duration: 3000 });
      setCalledContactIds(prev => new Set(prev).add(item.id));
      return;
    }
    if (callingMode === "listen") {
      toast.info(`Listen Mode active — monitoring call to ${item.name}`, { duration: 3000 });
      setCalledContactIds(prev => new Set(prev).add(item.id));
      return;
    }
    setCalledContactIds(prev => new Set(prev).add(item.id));
    callState.startCall({
      id: item.id,
      name: item.name,
      phone: item.phone,
      address: item.address,
      campaignName: item.campaign || undefined,
    }, "dialer");
  };

  const handleStartPowerDial = () => {
    if (callingMode === "voice") {
      toast.success(`AI Voice Agent session starting with ${dialerContacts.length} contacts...`);
      setCalledContactIds(new Set(dialerContacts.map(c => c.id)));
      return;
    }
    if (callingMode === "listen") {
      toast.info("Listen Mode activated — ready to capture external calls");
      return;
    }
    const queueContacts = dialerContacts.map(item => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      address: item.address,
    }));
    callState.setDialerQueue(queueContacts);
    if (selectedScriptId) {
      const script = MOCK_CALL_SCRIPTS.find(s => s.id === selectedScriptId);
      if (script) {
        callState.setSelectedScript({
          id: script.id,
          name: script.name,
          type: script.type,
          phases: ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"],
        });
      }
    }
    callState.startDialerSession();
    // Auto-enter focus mode when dialing starts
    if (!focusMode && onToggleFocus) onToggleFocus();
  };

  const handleSelectScript = (scriptId: string) => {
    setSelectedScriptId(prev => prev === scriptId ? null : scriptId);
    const script = MOCK_CALL_SCRIPTS.find(s => s.id === scriptId);
    if (script) {
      toast.info(`Script selected: ${script.name}`);
    }
  };

  // CSV parsing
  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row");
      return;
    }
    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
    const nameIdx = header.findIndex(h => h.includes("name"));
    const phoneIdx = header.findIndex(h => h.includes("phone") || h.includes("number"));
    const addressIdx = header.findIndex(h => h.includes("address"));

    if (phoneIdx === -1) {
      toast.error("CSV must contain a 'phone' or 'number' column");
      return;
    }

    const newContacts: typeof MOCK_DIALER_QUEUE = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
      const phone = cols[phoneIdx];
      if (!phone) continue;
      newContacts.push({
        id: `csv_${Date.now()}_${i}`,
        name: nameIdx >= 0 ? cols[nameIdx] || "Unknown" : "Unknown",
        phone,
        address: addressIdx >= 0 ? cols[addressIdx] || "" : "",
        time: "",
        type: "Imported",
        campaign: "",
      });
    }

    if (newContacts.length === 0) {
      toast.error("No valid contacts found in CSV");
      return;
    }

    setDialerContacts(prev => [...prev, ...newContacts]);
    toast.success(`${newContacts.length} contacts imported`);
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files are supported");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("File must be under 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) parseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleManualAdd = () => {
    if (!manualPhone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    const newContact = {
      id: `manual_${Date.now()}`,
      name: manualName.trim() || "Unknown",
      phone: manualPhone.trim(),
      address: manualAddress.trim(),
      time: "",
      type: "Manual" as const,
      campaign: "",
    };
    setDialerContacts(prev => [...prev, newContact]);
    setManualName("");
    setManualPhone("");
    setManualAddress("");
    setShowManualEntry(false);
    toast.success(`${newContact.name} added to dialing list`);
  };

  const handleRemoveContact = (id: string) => {
    setDialerContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleClearList = () => {
    setDialerContacts([]);
    toast.info("Dialing list cleared");
  };

  const downloadTemplate = () => {
    const csv = "name,phone,address\nJohn Doe,(555) 123-4567,123 Main St\nJane Smith,(555) 987-6543,456 Oak Ave\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dialer_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const showAutoAdvance = callState.isDialerSessionActive && callState.autoAdvanceCountdown !== null;

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-5">
      {/* Focus Mode / Power Hour Header Banner */}
      {(focusMode || isPowerHour) && (
        <div className={cn(
          "flex items-center justify-between px-4 py-2.5 rounded-lg border",
          isPowerHour
            ? "bg-amber-500/5 border-amber-500/20"
            : "bg-primary/5 border-primary/20"
        )}>
          <div className="flex items-center gap-2.5">
            {isPowerHour ? (
              <>
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Power Hour</span>
                <span className="text-[11px] text-muted-foreground">· Locked in. One queue. One goal.</span>
              </>
            ) : (
              <>
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Focus Mode</span>
                <span className="text-[11px] text-muted-foreground">· Distractions hidden. Ctrl+Shift+F to toggle.</span>
              </>
            )}
          </div>
          {!isPowerHour && (
            <button
              onClick={onToggleFocus}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Exit Focus
            </button>
          )}
        </div>
      )}

      {/* Dialer Intelligence Bar — hidden in Power Hour */}
      {!isPowerHour && <DialerIntelligenceBar />}

      {/* Daily Goals Tracker — always visible */}
      <DailyGoalsTracker />

      {/* Post-Call Automation Actions */}
      <PostCallActions />

      {/* Auto-advance banner */}
      {showAutoAdvance && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
          <p className="text-sm text-foreground">
            Auto-dialing next contact in <span className="font-bold text-primary">{callState.autoAdvanceCountdown}s</span>
          </p>
          <div className="flex gap-2">
            <button onClick={callState.cancelAutoAdvance} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Pause
            </button>
            <button onClick={callState.advanceDialerQueue} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              Skip to Next
            </button>
          </div>
        </div>
      )}

      {/* Calling Mode — hidden in Power Hour, compact in Focus */}
      {!isPowerHour && (
        <div className="p-5 bg-muted/30 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-[13px] font-semibold text-foreground">Select Calling Mode</div>
            <div className="flex items-center gap-2">
              {!focusMode && (
                <button
                  onClick={onToggleFocus}
                  className="px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-1.5"
                >
                  <Target className="h-3 w-3" /> Focus Session
                </button>
              )}
              <div className="flex flex-col items-end gap-0.5">
                <button
                  onClick={handleStartPowerDial}
                  disabled={callState.isCallActive || dialerContacts.length === 0}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold transition-colors",
                    callState.isCallActive || dialerContacts.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {callState.isDialerSessionActive ? "Resume Dialer" : "Start Dialing"}
                </button>
                <span className="text-[10px] text-muted-foreground">
                  {callState.isDialerSessionActive ? "Continue where you left off" : "AI-optimized calling sequence"}
                </span>
              </div>
            </div>
          </div>
          {!focusMode && (
            <div className="flex gap-3">
              {modes.map(({ key, label, desc, icon: Icon, colorClass, inactiveClass, beta }) => (
                <button
                  key={key}
                  onClick={() => {
                    setCallingMode(key as CallingModeKey);
                    if (key === "voice") toast.info("Voice Agent mode — AI will handle calls autonomously");
                    if (key === "listen") toast.info("Listen Mode — captures external calls from Zoom, Meet, etc.");
                  }}
                  className={cn(
                    "flex-1 p-6 rounded-lg text-center transition-all relative border-2",
                    callingMode === key
                      ? cn(colorClass, "border-transparent shadow-sm")
                      : cn(inactiveClass, "hover:opacity-80")
                  )}
                >
                  {beta && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-bold tracking-wider">BETA</span>
                  )}
                  <Icon className="h-6 w-6 mx-auto mb-2.5" />
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-[10px] mt-1 opacity-70 tracking-wide">{desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-5">
        {/* Left column: Dialing List + Import */}
        <div className="flex-1 flex flex-col gap-5">
          {/* My Dialing List */}
          <div className="p-5 bg-muted/30 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-3.5">
              <div className="text-[13px] font-semibold text-foreground">
                My Dialing List
                <span className="ml-2 text-xs text-muted-foreground font-normal">({dialerContacts.length} contacts)</span>
              </div>
              <div className="flex items-center gap-2">
                {dialerContacts.length > 0 && (
                  <button
                    onClick={handleClearList}
                    className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            {dialerContacts.length === 0 ? (
              /* Empty state with import */
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <div className="text-sm font-semibold text-foreground mb-1">Import Numbers</div>
                <div className="text-xs text-muted-foreground mb-1">Drag & drop a CSV file</div>
                <button onClick={downloadTemplate} className="text-xs text-primary font-medium hover:underline mb-4">
                  Download template
                </button>
                <div className="flex flex-col gap-2 max-w-[280px] mx-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" /> Choose A File
                  </button>
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Enter Manually
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground mt-3">Up to 1MB or 1,000 rows · CSV file only</div>
              </div>
            ) : (
              /* Contact list */
              <div>
                {/* Import actions row */}
                <div className="flex gap-2 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-3 w-3" /> Import CSV
                  </button>
                  <button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <UserPlus className="h-3 w-3" /> Add Contact
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors ml-auto"
                  >
                    <Download className="h-3 w-3" /> Template
                  </button>
                </div>

                {/* Manual entry form */}
                {showManualEntry && (
                  <div className="p-3.5 mb-3 bg-muted/50 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground">Add Contact</span>
                      <button onClick={() => setShowManualEntry(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      placeholder="Name"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                    />
                    <input
                      placeholder="Phone number *"
                      value={manualPhone}
                      onChange={e => setManualPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                    />
                    <input
                      placeholder="Address (optional)"
                      value={manualAddress}
                      onChange={e => setManualAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={handleManualAdd}
                      className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Add to List
                    </button>
                  </div>
                )}

                {/* Drag-drop zone (subtle) */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-2 mb-3 text-center transition-all text-[11px] text-muted-foreground",
                    isDragging ? "border-primary bg-primary/5" : "border-transparent hover:border-border"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {isDragging ? "Drop CSV here" : "Drag CSV here to add more contacts"}
                </div>

                {/* Contact rows */}
                <div className="max-h-[300px] overflow-auto">
                  {dialerContacts.map((item, i) => {
                    const isCurrentInQueue = callState.isDialerSessionActive && callState.dialerQueue[callState.dialerQueueIndex]?.id === item.id;
                    const isCalledInQueue = (callState.isDialerSessionActive && i < callState.dialerQueueIndex) || calledContactIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 py-3",
                          i < dialerContacts.length - 1 && "border-b border-border/50",
                          isCurrentInQueue && "bg-primary/5 -mx-2 px-2 rounded-lg",
                          isCalledInQueue && !isCurrentInQueue && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-md flex items-center justify-center text-[11px] font-semibold",
                          isCurrentInQueue ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {item.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-foreground truncate">{item.name}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground truncate">{item.address || item.phone}</span>
                            {item.campaign && <CampaignBadge campaignName={item.campaign} />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                            item.type === "Follow-up" ? "bg-emerald-500/10 text-emerald-600" :
                            item.type === "Callback" ? "bg-violet-500/10 text-violet-500" :
                            item.type === "Imported" ? "bg-amber-500/10 text-amber-500" :
                            item.type === "Manual" ? "bg-primary/10 text-primary" :
                            "bg-blue-500/10 text-blue-500"
                          )}>
                            {isCalledInQueue ? "Called" : item.type}
                          </span>
                          <button
                            onClick={() => handleCallFromQueue(item)}
                            disabled={callState.isCallActive}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1.5 rounded border text-[11px] font-medium transition-colors",
                              callState.isCallActive
                                ? "border-border text-muted-foreground/50 cursor-not-allowed"
                                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                            )}
                          >
                            <Phone className="h-3 w-3" /> Call
                          </button>
                          {!callState.isDialerSessionActive && (
                            <button
                              onClick={() => handleRemoveContact(item.id)}
                              className="p-1 text-muted-foreground/50 hover:text-destructive transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Scripts — hidden in Focus/Power Hour */}
        {!focusMode && !isPowerHour && <div className="w-[280px] flex flex-col gap-5">
          <div className="p-5 bg-muted/30 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-3.5">
              <div className="text-[13px] font-semibold text-foreground">Call Scripts</div>
              <button onClick={() => navigate("/dialer/scripts")} className="text-xs text-primary cursor-pointer font-medium hover:underline">Manage</button>
            </div>
            {MOCK_CALL_SCRIPTS.map((script) => (
              <div
                key={script.id}
                className={cn(
                  "p-3.5 rounded-lg mb-2.5 border cursor-pointer transition-all",
                  selectedScriptId === script.id
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/50 border-border/50 hover:border-primary/30"
                )}
                onClick={() => handleSelectScript(script.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                      {script.name}
                      {selectedScriptId === script.id && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold">SELECTED</span>
                      )}
                    </div>
                    <div className="text-[10px] font-semibold text-muted-foreground tracking-wider mt-0.5">{script.type}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{script.desc}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate("/dialer/scripts"); }} className="p-1 hover:bg-muted rounded transition-colors">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${script.progress}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-primary font-mono">{script.progress}%</span>
                </div>
              </div>
            ))}
          </div>

        </div>}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMMUNICATIONS HUB
// ============================================================================
export default function Communications() {
  const callState = useCallState();
  const navigate = useNavigate();
  const { data: dbContacts = [], isLoading: isLoadingContacts } = useDealSources();
  const updateMutation = useUpdateDealSource();
  const deleteMutation = useDeleteDealSource();
  const [activeView, setActiveView] = useState("activity");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [localActivities, setLocalActivities] = useState<Record<string, Activity[]>>({});
  const [messageInput, setMessageInput] = useState("");
  const [sendChannel, setSendChannel] = useState("");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [autoSelectedReason, setAutoSelectedReason] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [powerHourConfirmOpen, setPowerHourConfirmOpen] = useState(false);
  const [readinessNudgeDismissed, setReadinessNudgeDismissed] = useState(false);
  const [callingMode, setCallingMode] = useState<CallingModeKey>("start");
  const [focusMode, setFocusMode] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const userInteractedRef = React.useRef(false);
  const modeTheme = MODE_THEME[callingMode];
  const executionModeTheme = EXECUTION_MODE_THEME[callState.executionMode];
  const isPowerHour = callState.executionMode === "power-hour";

  // Handle URL params (e.g., ?view=dialer&mode=power-hour)
  useEffect(() => {
    const view = searchParams.get("view");
    const mode = searchParams.get("mode") as ExecutionMode | null;
    let dirty = false;

    if (view === "dialer") {
      setActiveView("dialer");
      searchParams.delete("view");
      dirty = true;
    }

    if (mode && ["manual", "power-hour", "campaign", "team"].includes(mode)) {
      callState.setExecutionMode(mode);
      if (mode === "power-hour") {
        setActiveView("dialer");
        setFocusMode(true);
      }
      searchParams.delete("mode");
      dirty = true;
    }

    if (dirty) {
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // Power Hour always implies focus mode
  useEffect(() => {
    if (isPowerHour) setFocusMode(true);
  }, [isPowerHour]);

  // Keyboard shortcut: Ctrl+Shift+F for Focus Mode toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F" && activeView === "dialer") {
        e.preventDefault();
        setFocusMode(f => !f);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeView]);

  // Convert deal_sources to Contact format, merging with mock activities for demo
  const contacts: Contact[] = useMemo(() => {
    if (dbContacts.length === 0) return INITIAL_CONTACTS;

    return dbContacts.map((ds, i) => {
      const initials = ds.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      
      // Use mock activities from INITIAL_CONTACTS for demo purposes (cycling through them)
      const mockContact = INITIAL_CONTACTS[i % INITIAL_CONTACTS.length];
      const activities = localActivities[ds.id] || mockContact?.activities || [];

      return {
        id: ds.id,
        dbId: ds.id,
        name: ds.name,
        address: ds.address || "No address",
        tag: ds.type ? ds.type.charAt(0).toUpperCase() + ds.type.slice(1) : "Contact",
        avatar: initials,
        sentiment: "neutral",
        lastActivity: ds.last_contact_date 
          ? new Date(ds.last_contact_date).toLocaleDateString() 
          : ds.updated_at 
            ? new Date(ds.updated_at).toLocaleDateString()
            : "—",
        unread: false,
        starred: false,
        activities,
        phone: ds.phone || undefined,
        email: ds.email || undefined,
        city: ds.city || undefined,
        state: ds.state || undefined,
        zip: ds.zip || undefined,
        company: ds.company || undefined,
        contactType: ds.type,
      };
    });
  }, [dbContacts, localActivities]);

  const selectedContact = useMemo(() => contacts.find(c => c.id === selectedContactId) || null, [contacts, selectedContactId]);

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (channelFilter !== "all") {
      result = result.filter(c => c.activities.some(a => a.channel === channelFilter));
    }
    if (statusFilter === "unread") result = result.filter(c => c.unread);
    if (statusFilter === "starred") result = result.filter(c => c.starred);
    if (statusFilter === "needs_response") {
      result = result.filter(c => {
        const last = c.activities[c.activities.length - 1];
        return last && last.direction === "inbound";
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }
    return result;
  }, [contacts, channelFilter, statusFilter, searchQuery]);

  // Auto-select the most relevant conversation on load
  const autoSelectedRef = React.useRef(false);
  useEffect(() => {
    // Don't auto-select if: user already interacted, already selected, no contacts, or user filtered/searched
    if (autoSelectedRef.current || selectedContactId || contacts.length === 0 || userInteractedRef.current) return;

    let picked: Contact | null = null;
    let reason = "";

    // Priority 1: Needs Attention (last activity is inbound)
    const needsAttention = contacts.find(c => {
      const last = c.activities[c.activities.length - 1];
      return last && last.direction === "inbound";
    });
    if (needsAttention) {
      picked = needsAttention;
      reason = "Needs attention";
    }

    // Priority 2: Unread
    if (!picked) {
      const unread = contacts.find(c => c.unread);
      if (unread) {
        picked = unread;
        reason = "Unread conversation";
      }
    }

    // Priority 3: Most recent interaction (first in list)
    if (!picked && contacts.length > 0) {
      picked = contacts[0];
      reason = "Most recent conversation";
    }

    if (picked) {
      autoSelectedRef.current = true;
      setSelectedContactId(picked.id);
      setAutoSelectedReason(reason);
    }
  }, [contacts, selectedContactId]);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedContactId) return;

    const now = new Date();
    const timeStr = `Today ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    const newActivity: Activity = {
      id: `a_${Date.now()}`,
      channel: sendChannel,
      direction: "outbound",
      timestamp: timeStr,
      content: messageInput.trim(),
      sentiment: "neutral",
    };

    setLocalActivities(prev => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || selectedContact?.activities || []), newActivity],
    }));

    toast.success(`${sendChannel.toUpperCase()} sent to ${selectedContact?.name}`);
    setMessageInput("");
  }, [messageInput, selectedContactId, sendChannel, selectedContact?.name]);

  const handleCall = useCallback(() => {
    if (!selectedContact) return;
    setLeftPanelOpen(false);
    callState.startCall({
      id: selectedContact.id,
      name: selectedContact.name,
      phone: selectedContact.phone || "No phone",
      address: selectedContact.address,
    }, "inline");
  }, [selectedContact, callState]);

  const handleDialerCall = useCallback((name: string, phone: string) => {
    toast.info(`Calling ${name} at ${phone}...`, { duration: 3000 });
  }, []);

  const handleQuickReply = useCallback((text: string) => {
    setMessageInput(text);
    toast.info("Quick reply loaded — press Enter to send");
  }, []);

  const handleEditContact = useCallback(() => {
    if (!selectedContact?.dbId) {
      toast.error("This contact cannot be edited (no database link)");
      return;
    }
    navigate(`/contacts/${selectedContact.dbId}`);
  }, [selectedContact, navigate]);

  const handleDeleteContact = useCallback(() => {
    if (!selectedContact?.dbId) {
      toast.error("This contact cannot be deleted (no database link)");
      return;
    }
    setDeleteConfirmOpen(true);
  }, [selectedContact]);

  const confirmDeleteContact = useCallback(() => {
    if (!selectedContact?.dbId) return;
    deleteMutation.mutate(selectedContact.dbId, {
      onSuccess: () => {
        toast.success(`${selectedContact.name} deleted`);
        setSelectedContactId(null);
        setDeleteConfirmOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete contact");
        setDeleteConfirmOpen(false);
      },
    });
  }, [selectedContact, deleteMutation]);

  const handleSelectContact = useCallback((id: string) => {
    userInteractedRef.current = true;
    setSelectedContactId(id);
    setAutoSelectedReason(null);
    setMessageInput("");
  }, []);

  // Mark user interaction when they use filters or search
  const handleChannelFilter = useCallback((filter: string) => {
    userInteractedRef.current = true;
    setChannelFilter(filter);
    setAutoSelectedReason(null);
  }, []);

  const handleStatusFilter = useCallback((filter: string) => {
    userInteractedRef.current = true;
    setStatusFilter(filter);
    setAutoSelectedReason(null);
  }, []);

  const handleSearchChange = useCallback((q: string) => {
    if (q) userInteractedRef.current = true;
    setSearchQuery(q);
    setAutoSelectedReason(null);
  }, []);

  const handleDismissAutoSelect = useCallback(() => {
    setAutoSelectedReason(null);
    setSelectedContactId(null);
  }, []);

  return (
    <AppLayout fullWidth>
      <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
        {/* Top Bar */}
        <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-5">
            <h1 className="text-2xl font-bold text-foreground">
              Communications
            </h1>
            <ViewSwitcher activeView={activeView} onSwitch={setActiveView} />
            {/* Execution Mode Badge */}
            {callState.executionMode !== "manual" && (
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border",
                executionModeTheme.bg, executionModeTheme.text, executionModeTheme.border,
              )}>
                <executionModeTheme.icon className="h-3 w-3" />
                {executionModeTheme.label}
                <button
                  onClick={() => callState.setExecutionMode("manual")}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {callState.isCallActive && (
              <div className="flex items-center gap-3">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse", modeTheme.badge)}>
                  <span className={cn("relative flex h-2 w-2")}>
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", modeTheme.dot)} />
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", modeTheme.dot)} />
                  </span>
                  <span className={modeTheme.badgeText}>{modeTheme.label}</span>
                </div>
                <span className="text-lg font-mono font-bold text-foreground tabular-nums">
                  {String(Math.floor(callState.callDuration / 60)).padStart(2, "0")}:{String(callState.callDuration % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Buttons */}
            {(Object.entries(MODE_THEME) as [CallingModeKey, typeof MODE_THEME[CallingModeKey]][]).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  setCallingMode(key);
                  if (key === "voice") toast.info("AI Agent mode — AI handles calls autonomously");
                  if (key === "listen") toast.info("Hybrid mode — AI assists during your calls");
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  callingMode === key
                    ? cn(theme.badge, theme.border, theme.badgeText)
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {key === "start" && <Play className="h-3 w-3" />}
                {key === "listen" && <Sparkles className="h-3 w-3" />}
                {key === "voice" && <Bot className="h-3 w-3" />}
                {key === "start" ? "Human" : key === "listen" ? "Hybrid" : "AI Agent"}
              </button>
            ))}

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-muted border border-border">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search contacts, messages..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground text-[13px] w-[200px] placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {activeView === "activity" ? (
            <>
              {/* Left: Contact List — compact mode during calls */}
              {callState.isCallActive && callState.displayMode === "inline" ? (
                <div className="border-r border-border flex flex-col overflow-hidden bg-background w-[56px] transition-all duration-300">
                  <div className="flex-1 overflow-auto py-1.5">
                    {filteredContacts.map(contact => (
                      <Tooltip key={contact.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleSelectContact(contact.id)}
                            className={cn(
                              "relative w-full flex items-center justify-center py-2 transition-all",
                              selectedContactId === contact.id
                                ? "bg-primary/10"
                                : "hover:bg-muted/60"
                            )}
                          >
                            <div className={cn(
                              "relative w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all",
                              selectedContactId === contact.id
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {contact.avatar}
                            </div>
                            {contact.unread && (
                              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                            )}
                            {contact.starred && (
                              <Star className="absolute bottom-1 right-1.5 h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          <div className="font-semibold">{contact.name}</div>
                          <div className="text-muted-foreground">{contact.address}</div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "border-r border-border flex flex-col overflow-hidden bg-background transition-all duration-200",
                  leftPanelOpen ? "w-[420px]" : "w-0"
                )}>
                  {leftPanelOpen && (
                    <>
                      <div className="px-4 py-3.5 border-b border-border flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <ChannelFilters activeFilter={channelFilter} onFilter={handleChannelFilter} />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setLeftPanelOpen(false)}
                                className="p-1 rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Minimize Panel</TooltipContent>
                          </Tooltip>
                        </div>
                        <StatusFilters activeStatus={statusFilter} onFilter={handleStatusFilter} />
                      </div>
                      <ChannelToolset channel={channelFilter} />
                      <div className="flex-1 overflow-auto">
                        {filteredContacts.map(contact => (
                          <ContactListItem
                            key={contact.id}
                            contact={contact}
                            isActive={selectedContactId === contact.id}
                            onClick={() => handleSelectContact(contact.id)}
                            onCall={() => {
                              handleSelectContact(contact.id);
                              callState.startCall({
                                id: contact.id,
                                name: contact.name,
                                phone: contact.phone || "No phone",
                                address: contact.address,
                              }, "inline");
                            }}
                            onSms={() => {
                              handleSelectContact(contact.id);
                              setSendChannel("sms");
                              toast.info(`SMS to ${contact.name} — type your message`);
                            }}
                            onCopy={() => {
                              navigator.clipboard.writeText(contact.phone || "");
                              toast.success(`Phone number copied for ${contact.name}`);
                            }}
                          />
                        ))}
                        {filteredContacts.length === 0 && (
                          <div className="py-10 px-5 text-center text-muted-foreground text-[13px]">
                            No conversations match your filters
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Expand button when collapsed (not during call — compact panel shows instead) */}
              {!leftPanelOpen && !(callState.isCallActive && callState.displayMode === "inline") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setLeftPanelOpen(true)}
                      className="flex items-center justify-center w-6 border-r border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Expand Panel</TooltipContent>
                </Tooltip>
              )}

              {/* Center: Thread or Live Call */}
              {callState.isCallActive && callState.displayMode === "inline" ? (
                <LiveCallInline
                  callingMode={callingMode}
                  onSmsClick={() => { setSendChannel("sms"); toast.info("Channel set to SMS"); }}
                  onEmailClick={() => { setSendChannel("email"); toast.info("Channel set to Email"); }}
                  onMoreClick={() => {
                    if (selectedContact?.dbId) navigate(`/contacts/${selectedContact.dbId}`);
                    else toast.error("No linked contact to edit");
                  }}
                />
              ) : (
                <ConversationThread
                  contact={selectedContact}
                  onCall={handleCall}
                  onSendMessage={handleSendMessage}
                  messageInput={messageInput}
                  onMessageInputChange={setMessageInput}
                  sendChannel={sendChannel}
                  onSendChannelChange={setSendChannel}
                  autoSelectedReason={autoSelectedReason}
                  onDismissAutoSelect={handleDismissAutoSelect}
                  onEditContact={handleEditContact}
                  onDeleteContact={handleDeleteContact}
                  onSwitchToDialer={() => setActiveView("dialer")}
                  onStartPowerHour={() => setPowerHourConfirmOpen(true)}
                />
              )}

              {/* Right: AI Co-Pilot */}
              <CoPilotPanel contact={selectedContact} activeView={activeView} onQuickReply={handleQuickReply} callingMode={callingMode} />
            </>
          ) : (
            <>
              <DialerView callingMode={callingMode} setCallingMode={setCallingMode} focusMode={focusMode} isPowerHour={isPowerHour} onToggleFocus={() => setFocusMode(f => !f)} />
              <CoPilotPanel contact={selectedContact} activeView={activeView} onQuickReply={handleQuickReply} callingMode={callingMode} />
            </>
          )}
        </div>
      </div>
      </TooltipProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedContact?.name}? This will permanently remove them from your contacts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContact} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Power Hour Confirmation Modal */}
      <AlertDialog open={powerHourConfirmOpen} onOpenChange={setPowerHourConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Power Hour Mode
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              This will pause notifications and guide you through high-priority calls only.
              <br />
              <span className="font-medium text-foreground mt-2 block">Ready to focus?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                callState.setExecutionMode("power-hour");
                setActiveView("dialer");
                setFocusMode(true);
                setPowerHourConfirmOpen(false);
                toast.success("Power Hour activated — 60 minutes of focused calling");
              }}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Start Power Hour
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
