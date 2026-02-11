import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCallState } from "@/contexts/CallContext";
import { LiveCallInline } from "@/components/calling/LiveCallInline";
import { AppLayout } from "@/components/layout/AppLayout";
import { useDealSources, type DealSource } from "@/hooks/useDealSources";
import {
  Phone,
  MessageCircle,
  Mail,
  Voicemail,
  Search,
  Star,
  Sparkles,
  Send,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  Pencil,
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
  Zap,
  BarChart3,
  Wand2,
  StickyNote,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target,
  Bot,
  Eye,
  Gauge,
  Hand,
  Pause,
  SkipForward,
  RefreshCw,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ============================================================================
// OPERATING MODE
// ============================================================================
type OperatingMode = "human" | "hybrid" | "ai_agent";

const MODE_CONFIG: Record<OperatingMode, { label: string; desc: string; icon: React.ElementType; accentClass: string; bgTint: string; badgeClass: string }> = {
  human: { label: "Human", desc: "You talk, AI guides", icon: Play, accentClass: "text-emerald-600", bgTint: "bg-emerald-500/[0.03]", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  hybrid: { label: "Hybrid", desc: "AI talks with oversight", icon: Eye, accentClass: "text-violet-600", bgTint: "bg-violet-500/[0.03]", badgeClass: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  ai_agent: { label: "AI Agent", desc: "Fully autonomous", icon: Bot, accentClass: "text-blue-600", bgTint: "bg-blue-500/[0.03]", badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

const STRATEGY_STEPS = ["Empathy", "Value Framing", "Anchor at $175K", "Close on Timeline"];

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
    tag: "Motivated Seller", avatar: "MW", sentiment: "neutral",
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
    tag: "Seller", avatar: "JS", sentiment: "positive",
    lastActivity: "1 hr ago", unread: true, starred: false,
    activities: [
      { id: "a4", channel: "email", direction: "inbound", timestamp: "Today 9:15 AM", subject: "Re: Cash Offer for 123 Main St", content: "Thank you for your offer. I've reviewed the terms and I'm interested in discussing further. When would be a good time to connect?", sentiment: "positive", aiSuggestion: "🔥 HOT — Book a call NOW. Reply with available times within 15 minutes. Every hour of delay drops conversion 12%." },
    ],
  },
  {
    id: "c3", name: "Sarah Johnson", address: "456 Oak Ave",
    tag: "Agent", avatar: "SJ", sentiment: "neutral",
    lastActivity: "3 hrs ago", unread: false, starred: true,
    activities: [
      { id: "a5", channel: "sms", direction: "inbound", timestamp: "Today 7:30 AM", content: "Hi, my client received your offer and wants to counter at $285k. Let me know if you're interested.", sentiment: "neutral", aiSuggestion: "📊 Counter at $270k. Pair with flexible 30-day close to offset price gap. $285k is 8% above MAO — do not accept." },
      { id: "a6", channel: "email", direction: "inbound", timestamp: "Yesterday 4:12 PM", subject: "(No subject)", content: "Forwarding the seller's disclosure docs. Let me know if you have questions.", sentiment: "neutral" },
    ],
  },
  {
    id: "c4", name: "Lisa Chen", address: "321 Pine Dr",
    tag: "Agent", avatar: "LC", sentiment: "positive",
    lastActivity: "1 day ago", unread: false, starred: true,
    activities: [
      { id: "a7", channel: "voicemail", direction: "inbound", timestamp: "Yesterday 2:30 PM", duration: "0:45", content: "Left voicemail at 2:30pm. Client is very motivated and wants to discuss the offer ASAP.", sentiment: "positive", aiSuggestion: "🚨 URGENT — Call back immediately. Motivated seller via agent = fastest close path. Lock appointment today." },
      { id: "a8", channel: "call", direction: "outbound", timestamp: "Yesterday 3:15 PM", duration: "12:40", summary: "Discussed seller's timeline — they need to close within 45 days due to relocation. Price flexible if we can guarantee close.", sentiment: "positive" },
    ],
  },
  {
    id: "c5", name: "Mike Williams", address: "789 Elm Blvd",
    tag: "Seller", avatar: "MW2", sentiment: "neutral",
    lastActivity: "6 hrs ago", unread: false, starred: false,
    activities: [
      { id: "a9", channel: "sms", direction: "inbound", timestamp: "Today 4:22 AM", content: "I saw you mentioned a 14-day close. Is there any flexibility on that? I need at least 30 days to find a new place.", sentiment: "neutral", aiSuggestion: "✅ Grant 30-day close — costs you nothing, wins the deal. Reply now: 'Absolutely, 30 days works. Let's lock this in.'" },
    ],
  },
  {
    id: "c6", name: "Robert Davis", address: "555 Maple Ct",
    tag: "Seller", avatar: "RD", sentiment: "neutral",
    lastActivity: "2 days ago", unread: false, starred: false,
    activities: [
      { id: "a10", channel: "email", direction: "inbound", timestamp: "2 days ago", subject: "Response to Direct Mail - 555 Maple Ct", content: "Received your letter. I'm interested but have questions about the as-is condition clause. What exactly does that cover?", sentiment: "neutral", aiSuggestion: "📩 Direct mail conversion. Reply with as-is explainer + schedule walkthrough this week. Use template: 'As-Is Benefits for Sellers'." },
    ],
  },
];

const MOCK_DIALER_QUEUE = [
  { id: "d1", name: "Robert Martinez", address: "234 Elm Drive", time: "10:30 AM", type: "Follow-up", phone: "(555) 123-4567" },
  { id: "d2", name: "Jennifer Lee", address: "567 Cedar Lane", time: "11:00 AM", type: "Callback", phone: "(555) 234-5678" },
  { id: "d3", name: "David Park", address: "890 Birch St", time: "11:30 AM", type: "Cold Call", phone: "(555) 345-6789" },
  { id: "d4", name: "Angela Torres", address: "112 Walnut Way", time: "12:00 PM", type: "Follow-up", phone: "(555) 456-7890" },
  { id: "d5", name: "Tom Bradley", address: "445 Spruce Ave", time: "1:00 PM", type: "Cold Call", phone: "(555) 567-8901" },
];

const MOCK_CALL_SCRIPTS = [
  { id: "s1", name: "Motivated Seller", type: "OUTBOUND", desc: "For distressed property owners", progress: 68 },
  { id: "s2", name: "Follow-up Close", type: "OUTBOUND", desc: "Re-engage warm leads", progress: 42 },
  { id: "s3", name: "Agent Intro", type: "OUTBOUND", desc: "Pitch to listing agents", progress: 15 },
];

// ============================================================================
// VIEW SWITCHER
// ============================================================================
function ViewSwitcher({ activeView, onSwitch }: { activeView: string; onSwitch: (v: string) => void }) {
  const views = [
    { key: "activity", label: "All Activity", icon: MessageCircle },
    { key: "dialer", label: "Dialer", icon: Phone },
  ];
  return (
    <div className="flex gap-2">
      {views.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
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
    { key: "unread", label: "Unread", dotClass: "bg-emerald-500" },
    { key: "starred", label: "Starred", dotClass: "bg-amber-500" },
    { key: "needs_response", label: "Needs Attention", dotClass: "bg-violet-500" },
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
// CONTACT LIST ITEM
// ============================================================================
function ContactListItem({ contact, isActive, onClick, onCall, onSms, onCopy, condensed }: { 
  contact: Contact; isActive: boolean; onClick: () => void;
  onCall?: () => void; onSms?: () => void; onCopy?: () => void;
  condensed?: boolean;
}) {
  const lastAct = contact.activities[contact.activities.length - 1];
  const ChannelIcon = lastAct ? CHANNEL_CONFIG[lastAct.channel]?.icon : null;
  const channelColorClass = lastAct ? CHANNEL_CONFIG[lastAct.channel]?.colorClass : "";

  if (condensed) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "group flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all border-b border-border/30",
          isActive ? "bg-muted/80 border-l-[3px] border-l-primary" : "border-l-[3px] border-l-transparent hover:bg-muted/40"
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
            {contact.avatar}
          </div>
          {contact.unread && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-background" />
          )}
        </div>
        <span className={cn("text-[12px] truncate", contact.unread ? "font-bold text-foreground" : "font-medium text-foreground")}>
          {contact.name}
        </span>
        {contact.starred && <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500 flex-shrink-0 ml-auto" />}
      </div>
    );
  }

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
  operatingMode,
}: {
  contact: Contact | null;
  onCall: () => void;
  onSendMessage: () => void;
  messageInput: string;
  onMessageInputChange: (val: string) => void;
  sendChannel: string;
  onSendChannelChange: (ch: string) => void;
  operatingMode: OperatingMode;
}) {
  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<"sms" | "email">("sms");
  const [emailSubject, setEmailSubject] = useState("");
  const { isCallActive, currentCallPhase } = useCallState();

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
        <MessageCircle className="h-12 w-12 opacity-30" />
        <span className="text-sm">Select A Conversation</span>
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const openComposer = (type: "sms" | "email") => {
    setComposerType(type);
    onSendChannelChange(type);
    setComposerOpen(true);
    if (type === "email") {
      setEmailSubject(`Follow-up on ${contact.address}`);
      if (!messageInput.trim()) {
        onMessageInputChange(`Hi ${contact.name.split(" ")[0]},\n\nThank you for our recent conversation about ${contact.address}. I wanted to follow up with the details we discussed.\n\nPlease let me know if you have any questions.\n\nBest regards`);
      }
    } else {
      if (!messageInput.trim()) {
        onMessageInputChange(`Hey ${contact.name.split(" ")[0]}, just following up on our conversation about ${contact.address}. When works best to chat?`);
      }
    }
  };

  const PHASES = ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"];
  const phaseIdx = PHASES.indexOf(currentCallPhase);

  const modeConfig = MODE_CONFIG[operatingMode];

  return (
    <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", isCallActive && modeConfig.bgTint)}>
      {/* Thread Header */}
      <div className="border-b border-border flex-shrink-0">
        <div className="px-5 py-3 flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContactDetailsOpen(!contactDetailsOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors",
                contactDetailsOpen
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {contactDetailsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              Details
            </button>
            <button onClick={onCall} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              <Phone className="h-3.5 w-3.5" /> Call
            </button>
            <button
              onClick={() => openComposer("sms")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
                composerOpen && composerType === "sms" ? "border-blue-500 text-blue-600 bg-blue-500/5" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" /> SMS
            </button>
            <button
              onClick={() => openComposer("email")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors",
                composerOpen && composerType === "email" ? "border-amber-500 text-amber-600 bg-amber-500/5" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </button>

            {/* 3-dot menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-popover border border-border rounded-lg shadow-lg py-1">
                    <button
                      onClick={() => { setMenuOpen(false); toast.info("Edit contact coming soon"); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Contact
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); toast.info("Delete contact coming soon"); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Contact
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Details - Expandable */}
        {contactDetailsOpen && (
          <div className="px-5 pb-3 border-t border-border/50 pt-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Home className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Property:</span>
                <span className="font-medium text-foreground">{contact.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">City/State:</span>
                <span className="font-medium text-foreground">
                  {[contact.city, contact.state].filter(Boolean).join(", ") || "—"}
                  {contact.zip ? ` ${contact.zip}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Phone:</span>
                <button onClick={onCall} className="font-medium text-primary hover:underline cursor-pointer">{contact.phone || "—"}</button>
                {contact.phone && (
                  <button onClick={() => { navigator.clipboard.writeText(contact.phone || ""); toast.success("Phone copied"); }} className="p-0.5 hover:bg-muted rounded transition-colors">
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{contact.email || "—"}</span>
                {contact.email && (
                  <button onClick={() => { navigator.clipboard.writeText(contact.email || ""); toast.success("Email copied"); }} className="p-0.5 hover:bg-muted rounded transition-colors">
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Last Contact:</span>
                <span className="font-medium text-foreground">{contact.lastActivity}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Star className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium text-primary">{contact.tag}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Strip — visible during live calls */}
      {isCallActive && (
        <div className={cn("px-5 py-2 border-b border-border/50 flex items-center gap-3 flex-shrink-0", modeConfig.bgTint)}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strategy:</span>
          <div className="flex items-center gap-1">
            {STRATEGY_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && <span className="text-[10px] text-muted-foreground/50">→</span>}
                <span className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all",
                  i <= phaseIdx
                    ? cn(modeConfig.badgeClass, "border")
                    : "text-muted-foreground/60"
                )}>
                  {step}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

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
                  <div className="mt-2.5 p-2.5 bg-primary/8 border border-primary/25 rounded-md flex gap-2 items-start">
                    <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground leading-relaxed font-medium">{act.aiSuggestion}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SMS/Email Composer Slide-Up */}
      {composerOpen && (
        <div className="border-t border-border bg-muted/30 flex-shrink-0 animate-fade-in">
          <div className="px-5 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                {composerType === "email" ? (
                  <Mail className="h-4 w-4 text-amber-500" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-[13px] font-semibold text-foreground">
                  {composerType === "email" ? "Compose Email" : "Send SMS"}
                </span>
                <span className="text-[10px] text-muted-foreground">to {contact.name}</span>
              </div>
              <button onClick={() => setComposerOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {composerType === "email" && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-muted-foreground font-medium">Subject:</span>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
                />
              </div>
            )}

            <textarea
              value={messageInput}
              onChange={e => onMessageInputChange(e.target.value)}
              rows={composerType === "email" ? 5 : 2}
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none mb-2.5"
              placeholder={composerType === "email" ? "Compose your email..." : "Type your message..."}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toast.success("AI rewrite applied")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-primary hover:bg-primary/10 transition-all border border-primary/20"
                >
                  <Wand2 className="h-3 w-3" /> Rewrite
                </button>
                <button
                  onClick={() => onMessageInputChange(messageInput + "\n\n[Offer Range: $165,000 - $180,000]")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border"
                >
                  <BarChart3 className="h-3 w-3" /> Add Offer
                </button>
                {composerType === "email" && (
                  <button
                    onClick={() => toast.info("Attach comps PDF coming soon")}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border"
                  >
                    <Paperclip className="h-3 w-3" /> Attach
                  </button>
                )}
                <button
                  onClick={() => toast.info("Scheduled send coming soon")}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border"
                >
                  <Clock className="h-3 w-3" /> Schedule
                </button>
              </div>
              <button
                onClick={() => { onSendMessage(); setComposerOpen(false); }}
                disabled={!messageInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" /> Send {composerType === "email" ? "Email" : "SMS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Surface Input — Mode Aware */}
      {!composerOpen && (
        operatingMode === "ai_agent" && isCallActive ? (
          /* AI Agent Mode — Control Surface */
          <div className="border-t border-border flex-shrink-0 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className="text-[13px] font-bold text-foreground">AI Agent Active</span>
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toast.info("Taking over call...")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
                  <Hand className="h-3.5 w-3.5" /> Take Over
                </button>
                <button onClick={() => toast.info("Agent paused")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
                <button onClick={() => toast.info("Strategy changed")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" /> Change Strategy
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Human / Hybrid — Message Input */
          <div className="border-t border-border flex-shrink-0">
            <div className="px-5 pt-2.5 pb-1 flex items-center gap-1">
              {[
                { key: "sms", label: "SMS", icon: MessageCircle, color: "text-blue-500 bg-blue-500/10" },
                { key: "email", label: "Email", icon: Mail, color: "text-amber-500 bg-amber-500/10" },
                { key: "note", label: "Note", icon: StickyNote, color: "text-muted-foreground bg-muted" },
              ].map(ch => (
                <button
                  key={ch.key}
                  onClick={() => onSendChannelChange(ch.key)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all",
                    sendChannel === ch.key
                      ? cn(ch.color, "ring-1 ring-current/20")
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <ch.icon className="h-3 w-3" />
                  {ch.label}
                </button>
              ))}

              <div className="h-4 w-px bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (!messageInput.trim()) { toast.info("Type a message first"); return; }
                      toast.success("AI rewrite applied");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-primary hover:bg-primary/10 transition-all"
                  >
                    <Wand2 className="h-3 w-3" /> Rewrite
                  </button>
                </TooltipTrigger>
                <TooltipContent>Rewrite with AI</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onMessageInputChange(messageInput + " [Offer Range: $165K - $180K]")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <BarChart3 className="h-3 w-3" /> Offer
                  </button>
                </TooltipTrigger>
                <TooltipContent>Insert offer range</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      const directive = contact.activities[contact.activities.length - 1]?.aiSuggestion;
                      if (directive) { onMessageInputChange(directive); toast.success("AI directive loaded"); }
                      else toast.info("No active directive available");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-primary hover:bg-primary/10 transition-all"
                  >
                    <Zap className="h-3 w-3" /> Directive
                  </button>
                </TooltipTrigger>
                <TooltipContent>Follow AI directive</TooltipContent>
              </Tooltip>
            </div>

            <div className="px-5 pb-3 pt-1 flex gap-2.5 items-center">
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3.5 py-2.5 border border-border">
                <input
                  placeholder={sendChannel === "note" ? "Add internal note..." : sendChannel === "email" ? "Compose email..." : "Type a message..."}
                  value={messageInput}
                  onChange={e => onMessageInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-foreground text-[13px] placeholder:text-muted-foreground"
                />
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
        )
      )}
    </div>
  );
}
// ============================================================================
// LIVE CALL CENTER (Negotiation Command Center)
// ============================================================================
function LiveCallCenter({
  contact,
  operatingMode,
  onQuickReply,
}: {
  contact: Contact | null;
  operatingMode: OperatingMode;
  onQuickReply: (text: string) => void;
}) {
  const {
    isCallActive, callStatus, callDuration, transcript,
    sentiment, sentimentScore, currentCallPhase, aiSuggestions,
    isMuted, toggleMute, endCall,
  } = useCallState();

  const PHASES = ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"];
  const phaseIdx = PHASES.indexOf(currentCallPhase);
  const modeConfig = MODE_CONFIG[operatingMode];

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Dynamic AI status
  const getAIStatus = (): { text: string; color: string } => {
    if (callStatus === "ringing") return { text: "Connecting...", color: "text-amber-500" };
    if (transcript.length < 2) return { text: "🟢 Listening", color: "text-emerald-500" };
    if (transcript.length < 4) return { text: "🔵 Analyzing", color: "text-blue-500" };
    if (transcript.length < 6) return { text: "🟡 Objection Detected", color: "text-amber-500" };
    return { text: "🟣 Strategy Shift", color: "text-violet-500" };
  };

  const aiStatus = getAIStatus();

  if (!contact || !isCallActive) return null;

  return (
    <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", modeConfig.bgTint)}>
      {/* ── Live Call Header ── */}
      <div className={cn("px-5 py-3 border-b flex items-center justify-between flex-shrink-0",
        operatingMode === "human" ? "border-b-emerald-500/20 bg-emerald-500/[0.04]" :
        operatingMode === "hybrid" ? "border-b-violet-500/20 bg-violet-500/[0.04]" :
        "border-b-blue-500/20 bg-blue-500/[0.04]"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground",
            operatingMode === "human" ? "bg-emerald-600" : operatingMode === "hybrid" ? "bg-violet-600" : "bg-blue-600"
          )}>
            {contact.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-foreground">{contact.name}</span>
              <span className="text-xl font-mono font-bold text-foreground tracking-tight">{formatTimer(callDuration)}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className={cn("text-[11px] font-semibold", aiStatus.color)}>{aiStatus.text}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", modeConfig.badgeClass)}>
                {currentCallPhase}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">Confidence: <span className={cn("font-bold", modeConfig.accentClass)}>82%</span></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {operatingMode !== "human" && (
            <button
              onClick={() => toast.info("Taking over call...")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
            >
              <Hand className="h-3.5 w-3.5" /> Take Over
            </button>
          )}
          <button
            onClick={toggleMute}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors",
              isMuted ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Mic className="h-3.5 w-3.5" /> {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={() => toast.info("Agent paused")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pause className="h-3.5 w-3.5" /> Pause
          </button>
          <button
            onClick={endCall}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" /> End
          </button>
        </div>
      </div>

      {/* ── Stage Progress Bar ── */}
      <div className={cn("px-5 py-2.5 border-b border-border/50 flex-shrink-0", modeConfig.bgTint)}>
        <div className="flex gap-1">
          {PHASES.map((phase, i) => (
            <div key={phase} className="flex-1">
              <div className={cn(
                "h-2 rounded-full transition-all duration-500",
                i < phaseIdx ? (operatingMode === "human" ? "bg-emerald-500" : operatingMode === "hybrid" ? "bg-violet-500" : "bg-blue-500") :
                i === phaseIdx ? cn(
                  operatingMode === "human" ? "bg-emerald-500" : operatingMode === "hybrid" ? "bg-violet-500" : "bg-blue-500",
                  "animate-pulse shadow-sm",
                  operatingMode === "human" ? "shadow-emerald-500/30" : operatingMode === "hybrid" ? "shadow-violet-500/30" : "shadow-blue-500/30"
                ) :
                "bg-muted"
              )} />
              <span className={cn(
                "text-[9px] mt-1 block text-center font-medium",
                i < phaseIdx ? "text-muted-foreground" :
                i === phaseIdx ? cn(modeConfig.accentClass, "font-bold") :
                "text-muted-foreground/50"
              )}>{phase}</span>
            </div>
          ))}
        </div>
        {/* Strategy Strip */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Strategy:</span>
          {STRATEGY_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              {i > 0 && <span className="text-[9px] text-muted-foreground/40">→</span>}
              <span className={cn(
                "text-[10px] font-semibold",
                i <= Math.min(phaseIdx, STRATEGY_STEPS.length - 1) ? modeConfig.accentClass : "text-muted-foreground/50"
              )}>{step}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Live Transcript ── */}
      <div className="flex-1 min-h-0 overflow-auto px-5 py-4">
        <div className="space-y-3">
          {transcript.map(entry => {
            const isUser = entry.speaker === "user";
            const isAI = entry.speaker === "ai";
            return (
              <div key={entry.id} className="group">
                <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : isAI
                        ? cn("border", modeConfig.badgeClass)
                        : "bg-muted text-foreground"
                  )}>
                    {!isUser && (
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-60">
                        {isAI ? "AI" : contact.name.split(" ")[0]}
                      </span>
                    )}
                    {entry.text}
                  </div>
                </div>
                {/* AI Tags — subtle analysis under each prospect message */}
                {!isUser && !isAI && transcript.length > 2 && (
                  <div className="flex items-center gap-2 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">Objection: Price</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">Tone: Defensive</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">Intent: Medium</span>
                  </div>
                )}
              </div>
            );
          })}
          {callStatus === "connected" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className={cn("font-medium", aiStatus.color)}>{aiStatus.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky Suggestion Stack ── */}
      <div className={cn("border-t flex-shrink-0 px-5 py-3",
        operatingMode === "human" ? "border-t-emerald-500/20 bg-emerald-500/[0.03]" :
        operatingMode === "hybrid" ? "border-t-violet-500/20 bg-violet-500/[0.03]" :
        "border-t-blue-500/20 bg-blue-500/[0.03]"
      )}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-muted-foreground">
          <Target className="h-3 w-3" /> Say This Next
        </div>
        <div className="flex gap-2">
          {aiSuggestions.slice(0, 3).map(s => (
            <div key={s.id} className={cn(
              "flex-1 p-2.5 rounded-lg border text-xs leading-relaxed transition-all hover:shadow-sm cursor-pointer",
              s.type === "question" ? "border-blue-500/20 bg-blue-500/[0.04] hover:border-blue-500/40" :
              s.type === "response" ? cn("border-primary/20 bg-primary/[0.04] hover:border-primary/40") :
              "border-border bg-muted/50 hover:border-foreground/20"
            )}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                  s.type === "question" ? "bg-blue-500/10 text-blue-500" :
                  s.type === "response" ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                )}>{s.type}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{s.confidence}%</span>
              </div>
              <div className="text-foreground mb-2 line-clamp-2">{s.text}</div>
              <button
                onClick={() => onQuickReply(s.text)}
                className={cn(
                  "w-full py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border",
                  s.type === "coach"
                    ? "bg-muted/80 text-foreground border-border hover:bg-muted"
                    : cn(modeConfig.badgeClass, "hover:opacity-80")
                )}
              >
                {s.type === "coach" ? "Apply" : "Use"}
              </button>
            </div>
          ))}
          {aiSuggestions.length === 0 && (
            <div className="text-xs text-muted-foreground italic py-2">Generating suggestions...</div>
          )}
        </div>

        {/* AI Agent control surface */}
        {operatingMode === "ai_agent" && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="text-[12px] font-bold text-foreground">AI Agent Active</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => toast.info("Strategy changed")} className="px-2.5 py-1.5 rounded-md border border-border text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="h-3 w-3 inline mr-1" />Strategy
              </button>
              <button onClick={() => toast.info("Adjusting offer range...")} className="px-2.5 py-1.5 rounded-md border border-border text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                <BarChart3 className="h-3 w-3 inline mr-1" />Offer
              </button>
            </div>
          </div>
        )}
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
  operatingMode,
}: {
  contact: Contact | null;
  activeView: string;
  onQuickReply: (text: string) => void;
  operatingMode: OperatingMode;
}) {
  const { isCallActive, callDuration, transcript, sentiment, sentimentScore, currentCallPhase, aiSuggestions } = useCallState();

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const PHASES = ["Pattern Interrupt", "Permission", "Value Prop", "Qualification", "Close"];
  const phaseIdx = PHASES.indexOf(currentCallPhase);
  const modeConfig = MODE_CONFIG[operatingMode];

  // Dynamic AI status text
  const getAIStatusText = () => {
    if (!isCallActive) return activeView === "dialer" ? "Directing call strategy" : "Analyzing & directing actions";
    if (transcript.length < 2) return "🟢 Listening...";
    if (transcript.length < 5) return "🔵 Analyzing...";
    return "🟣 Strategy Shift Detected...";
  };

  return (
    <div className={cn(
      "w-[400px] border-l flex flex-col overflow-hidden shadow-[-2px_0_12px_-4px_hsl(var(--primary)/0.08)]",
      isCallActive ? cn("border-l-2", modeConfig.bgTint, 
        operatingMode === "human" ? "border-l-emerald-500/30" : 
        operatingMode === "hybrid" ? "border-l-violet-500/30" : "border-l-blue-500/30"
      ) : "border-primary/10 bg-gradient-to-b from-primary/[0.03] to-muted/40"
    )}>
      {/* Header */}
      <div className={cn("p-4 border-b flex items-center justify-between", 
        isCallActive ? cn("bg-gradient-to-r", 
          operatingMode === "human" ? "from-emerald-500/[0.06] border-emerald-500/10" :
          operatingMode === "hybrid" ? "from-violet-500/[0.06] border-violet-500/10" :
          "from-blue-500/[0.06] border-blue-500/10"
        ) : "border-primary/10 bg-primary/[0.04]"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
            isCallActive ? (
              operatingMode === "human" ? "bg-emerald-500/15" :
              operatingMode === "hybrid" ? "bg-violet-500/15" : "bg-blue-500/15"
            ) : "bg-primary/15"
          )}>
            <Sparkles className={cn("h-4 w-4", isCallActive ? modeConfig.accentClass : "text-primary")} />
          </div>
          <div>
            <div className="text-[13px] font-bold text-foreground tracking-tight">AI Command Center</div>
            <div className="text-[10px] text-muted-foreground">{getAIStatusText()}</div>
          </div>
        </div>
        {contact && (
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
            isCallActive ? modeConfig.badgeClass : "bg-emerald-500/10 border-emerald-500/20"
          )}>
            <span className="relative flex h-2 w-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                isCallActive ? (operatingMode === "human" ? "bg-emerald-400" : operatingMode === "hybrid" ? "bg-violet-400" : "bg-blue-400") : "bg-emerald-400"
              )} />
              <span className={cn("relative inline-flex rounded-full h-2 w-2",
                isCallActive ? (operatingMode === "human" ? "bg-emerald-500" : operatingMode === "hybrid" ? "bg-violet-500" : "bg-blue-500") : "bg-emerald-500"
              )} />
            </span>
            <span className={cn("text-[10px] font-bold tracking-wider uppercase",
              isCallActive ? modeConfig.accentClass : "text-emerald-600"
            )}>
              {isCallActive ? (operatingMode === "ai_agent" ? "AI ACTIVE" : "LIVE") : "AI Active"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!contact ? (
          <div className="text-center py-10 text-muted-foreground">
            <Sparkles className="h-8 w-8 opacity-30 mx-auto mb-3" />
            <p className="text-[13px]">Select a contact to get AI-powered insights</p>
          </div>
        ) : isCallActive ? (
          /* ============== LIVE CALL MODE — STRATEGY ONLY ============== */
          <div className="space-y-3">
            {/* Live Timer & Phase */}
            <div className={cn("p-3.5 rounded-lg border",
              operatingMode === "human" ? "border-emerald-500/20 bg-emerald-500/[0.06]" :
              operatingMode === "hybrid" ? "border-violet-500/20 bg-violet-500/[0.06]" :
              "border-blue-500/20 bg-blue-500/[0.06]"
            )}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Clock className={cn("h-3.5 w-3.5", modeConfig.accentClass)} />
                  <span className="text-xl font-mono font-bold text-foreground tracking-tight">{formatTimer(callDuration)}</span>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", modeConfig.badgeClass, "border")}>
                  {currentCallPhase}
                </span>
              </div>
              {/* Phase Progress */}
              <div className="flex gap-0.5">
                {PHASES.map((phase, i) => (
                  <div key={phase} className="flex-1">
                    <div className={cn(
                      "h-1.5 rounded-full transition-all",
                      i < phaseIdx ? (operatingMode === "human" ? "bg-emerald-500" : operatingMode === "hybrid" ? "bg-violet-500" : "bg-blue-500") :
                      i === phaseIdx ? cn(operatingMode === "human" ? "bg-emerald-500" : operatingMode === "hybrid" ? "bg-violet-500" : "bg-blue-500", "animate-pulse") :
                      "bg-muted"
                    )} />
                    <span className={cn(
                      "text-[8px] mt-0.5 block text-center leading-tight",
                      i <= phaseIdx ? cn(modeConfig.accentClass, "font-semibold") : "text-muted-foreground"
                    )}>{phase.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Sentiment */}
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Live Sentiment</span>
                <span className={cn(
                  "text-[11px] font-bold capitalize",
                  sentiment === "positive" ? "text-emerald-600" : sentiment === "negative" ? "text-red-500" : "text-amber-500"
                )}>{sentiment}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700",
                    sentiment === "positive" ? "bg-emerald-500" : sentiment === "negative" ? "bg-red-500" : "bg-amber-500"
                  )}
                  style={{ width: `${sentimentScore}%` }}
                />
              </div>
            </div>

            {/* Deal Probability */}
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Deal Probability</span>
                <div className="flex items-center gap-1.5">
                  <Gauge className={cn("h-3.5 w-3.5", modeConfig.accentClass)} />
                  <span className={cn("text-lg font-bold", modeConfig.accentClass)}>67%</span>
                </div>
              </div>
            </div>

            {/* Directive — compact during live */}
            <div className={cn("p-3.5 rounded-lg border",
              operatingMode === "human" ? "border-emerald-500/20 bg-emerald-500/[0.06]" :
              operatingMode === "hybrid" ? "border-violet-500/20 bg-violet-500/[0.06]" :
              "border-blue-500/20 bg-blue-500/[0.06]"
            )}>
              <div className={cn("text-[11px] font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5", modeConfig.accentClass)}>
                <Sparkles className="h-3 w-3" /> Directive
              </div>
              <div className="text-xs text-foreground leading-relaxed font-medium">
                {contact.activities[contact.activities.length - 1]?.aiSuggestion?.slice(0, 120) || "Awaiting data..."}
              </div>
            </div>

            {/* Take Over button for hybrid/ai modes */}
            {operatingMode !== "human" && (
              <button
                onClick={() => toast.info("Taking over call...")}
                className="w-full py-3 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Hand className="h-4 w-4" /> Take Over Call
              </button>
            )}
          </div>
        ) : (
          /* ============== PASSIVE / NO-CALL MODE ============== */
          <div className="space-y-3">
            {/* Sentiment */}
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2">Prospect Sentiment</div>
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: contact.sentiment === "positive" ? "75%" : contact.sentiment === "neutral" ? "50%" : "25%" }}
                  />
                </div>
                <span className={cn(
                  "text-xs font-semibold capitalize",
                  contact.sentiment === "positive" ? "text-emerald-600" : contact.sentiment === "negative" ? "text-red-500" : "text-amber-500"
                )}>{contact.sentiment}</span>
              </div>
            </div>

            {/* Directive */}
            <div className="p-3.5 bg-primary/[0.06] rounded-lg border border-primary/20">
              <div className="text-[11px] text-primary font-bold tracking-wider uppercase mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Directive
              </div>
              <div className="text-xs text-foreground leading-relaxed font-medium">
                {contact.activities[contact.activities.length - 1]?.aiSuggestion || "Awaiting data to generate directive."}
              </div>
            </div>

            {/* Communication Summary */}
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2.5">Communication Summary</div>
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
            </div>

            {/* Related Conversations */}
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2.5">Related Conversations</div>
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
            </div>

            {/* Quick Replies */}
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase mb-2.5">Quick Replies</div>
              {[
                `Hi ${contact.name.split(" ")[0]}, I completely understand your concerns. I want to make sure this works for you — can we chat briefly to go over the details?`,
                `Hey ${contact.name.split(" ")[0]}, just following up on our last conversation. What does your timeline look like? I'd love to find a solution that fits your schedule.`,
                `Hi ${contact.name.split(" ")[0]}, I pulled some recent sales data for your area that I think you'll find helpful. Would you like me to send it over?`,
              ].map((reply, i) => (
                <button
                  key={i}
                  onClick={() => onQuickReply(reply)}
                  className="w-full text-left px-2.5 py-2 mb-1.5 bg-muted/80 border border-border/50 rounded text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ============================================================================
// DIALER VIEW
// ============================================================================
function DialerView() {
  const callState = useCallState();
  const navigate = useNavigate();
  const [callingMode, setCallingMode] = useState("start");
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
    { key: "start", label: "Start Call", desc: "YOU TALK, AI ASSISTS WITH REAL-TIME SUGGESTIONS", icon: Play, colorClass: "bg-primary text-primary-foreground", inactiveClass: "bg-primary/5 text-foreground border-primary/20" },
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

      {/* Calling Mode */}
      <div className="p-5 bg-muted/30 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3.5">
          <div className="text-[13px] font-semibold text-foreground">Select Calling Mode</div>
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
            {callState.isDialerSessionActive ? "Session Active" : `Start Power Dial (${dialerContacts.length})`}
          </button>
        </div>
        <div className="flex gap-3">
          {modes.map(({ key, label, desc, icon: Icon, colorClass, inactiveClass, beta }) => (
            <button
              key={key}
              onClick={() => {
                setCallingMode(key);
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
      </div>

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
                          <div className="text-[11px] text-muted-foreground truncate">{item.address || item.phone}</div>
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

        {/* Right column: Scripts */}
        <div className="w-[280px] flex flex-col gap-5">
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

          {/* AI Insights */}
          <div className="p-5 bg-muted/30 rounded-xl border border-border">
            <div className="text-[13px] font-semibold text-foreground mb-3.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Insights
            </div>
            <div className="space-y-2.5">
              {[
                { icon: "🕐", text: "Best calling hours today: 10 AM - 12 PM based on your success patterns" },
                { icon: "⚡", text: "5 hot leads haven't been contacted in 3+ days. Consider prioritizing them." },
                { icon: "💡", text: "Your close rate improves 23% when you mention creative financing options" },
              ].map((insight, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-muted/50 rounded-md">
                  <span className="text-base">{insight.icon}</span>
                  <span className="text-xs text-muted-foreground">{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
  const [activeView, setActiveView] = useState("activity");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [localActivities, setLocalActivities] = useState<Record<string, Activity[]>>({});
  const [messageInput, setMessageInput] = useState("");
  const [sendChannel, setSendChannel] = useState("sms");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [operatingMode, setOperatingMode] = useState<OperatingMode>("human");

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

  const handleSelectContact = useCallback((id: string) => {
    setSelectedContactId(id);
    setMessageInput("");
  }, []);

  return (
    <AppLayout fullWidth>
      <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
        {/* Top Bar */}
        <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-5">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              Communications
            </h1>
            <ViewSwitcher activeView={activeView} onSwitch={setActiveView} />
            {callState.isCallActive && (
              <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse border",
                MODE_CONFIG[operatingMode].badgeClass
              )}>
                <span className="relative flex h-2 w-2">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    operatingMode === "human" ? "bg-emerald-400" : operatingMode === "hybrid" ? "bg-violet-400" : "bg-blue-400"
                  )} />
                  <span className={cn("relative inline-flex rounded-full h-2 w-2",
                    operatingMode === "human" ? "bg-emerald-500" : operatingMode === "hybrid" ? "bg-violet-500" : "bg-blue-500"
                  )} />
                </span>
                LIVE · {MODE_CONFIG[operatingMode].label}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Selector */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
              {(Object.entries(MODE_CONFIG) as [OperatingMode, typeof MODE_CONFIG[OperatingMode]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setOperatingMode(key);
                          toast.info(`${cfg.label} Mode — ${cfg.desc}`);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                          operatingMode === key
                            ? cn("bg-background shadow-sm border border-border", cfg.accentClass)
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{cfg.desc}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-muted border border-border">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search contacts, messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground text-[13px] w-[200px] placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {activeView === "activity" ? (
            <>
              {/* Left: Contact List */}
              <div className={cn(
                "border-r border-border flex flex-col overflow-hidden bg-background transition-all duration-200",
                leftPanelOpen 
                  ? callState.isCallActive ? "w-[220px]" : "w-[420px]"
                  : "w-0"
              )}>
                {leftPanelOpen && (
                  <>
                    {!callState.isCallActive && (
                      <div className="px-4 py-3.5 border-b border-border flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <ChannelFilters activeFilter={channelFilter} onFilter={setChannelFilter} />
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
                        <StatusFilters activeStatus={statusFilter} onFilter={setStatusFilter} />
                      </div>
                    )}
                    {callState.isCallActive && (
                      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contacts</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setLeftPanelOpen(false)}
                              className="p-1 rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Minimize</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    <div className="flex-1 overflow-auto">
                      {filteredContacts.map(contact => (
                        <ContactListItem
                          key={contact.id}
                          contact={contact}
                          isActive={selectedContactId === contact.id}
                          condensed={callState.isCallActive}
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

              {/* Expand button when collapsed */}
              {!leftPanelOpen && (
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
                <LiveCallCenter contact={selectedContact} operatingMode={operatingMode} onQuickReply={handleQuickReply} />
              ) : (
                <ConversationThread
                  contact={selectedContact}
                  onCall={handleCall}
                  onSendMessage={handleSendMessage}
                  messageInput={messageInput}
                  onMessageInputChange={setMessageInput}
                  sendChannel={sendChannel}
                  onSendChannelChange={setSendChannel}
                  operatingMode={operatingMode}
                />
              )}

              {/* Right: AI Co-Pilot */}
              <CoPilotPanel contact={selectedContact} activeView={activeView} onQuickReply={handleQuickReply} operatingMode={operatingMode} />
            </>
          ) : (
            <>
              <DialerView />
              <CoPilotPanel contact={selectedContact} activeView={activeView} onQuickReply={handleQuickReply} operatingMode={operatingMode} />
            </>
          )}
        </div>
      </div>
      </TooltipProvider>
    </AppLayout>
  );
}
