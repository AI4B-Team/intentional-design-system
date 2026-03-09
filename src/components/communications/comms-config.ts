import { Phone, MessageCircle, Mail, Voicemail, Play, Mic, Zap, Target, Users } from "lucide-react";
import type { ExecutionMode } from "@/contexts/CallContext";

// ============================================================================
// CALLING MODE THEME CONFIG
// ============================================================================
export type CallingModeKey = "start" | "voice" | "listen";

export const MODE_THEME: Record<CallingModeKey, {
  label: string;
  accent: string;
  bg: string;
  border: string;
  badge: string;
  badgeText: string;
  dot: string;
  headerBg: string;
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
export const EXECUTION_MODE_THEME: Record<ExecutionMode, {
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
export const CHANNEL_CONFIG: Record<string, { icon: React.ElementType; label: string; colorClass: string; bgClass: string }> = {
  call: { icon: Phone, label: "Call", colorClass: "text-violet-500", bgClass: "bg-violet-500/10" },
  sms: { icon: MessageCircle, label: "SMS", colorClass: "text-blue-500", bgClass: "bg-blue-500/10" },
  email: { icon: Mail, label: "Email", colorClass: "text-amber-500", bgClass: "bg-amber-500/10" },
  voicemail: { icon: Voicemail, label: "Voicemail", colorClass: "text-red-500", bgClass: "bg-red-500/10" },
};

// ============================================================================
// TYPES
// ============================================================================
export interface Activity {
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

export interface Contact {
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
  dbId?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: string;
  contactType?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================
export const INITIAL_CONTACTS: Contact[] = [
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

export const MOCK_DIALER_QUEUE = [
  { id: "d1", name: "Robert Martinez", address: "234 Elm Drive", time: "10:30 AM", type: "Follow-up", phone: "(555) 123-4567", campaign: "Q1 Tampa Absentee Sellers" },
  { id: "d2", name: "Jennifer Lee", address: "567 Cedar Lane", time: "11:00 AM", type: "Callback", phone: "(555) 234-5678", campaign: "Q1 Tampa Absentee Sellers" },
  { id: "d3", name: "David Park", address: "890 Birch St", time: "11:30 AM", type: "Cold Call", phone: "(555) 345-6789", campaign: "Expired Listings Feb" },
  { id: "d4", name: "Angela Torres", address: "112 Walnut Way", time: "12:00 PM", type: "Follow-up", phone: "(555) 456-7890", campaign: "Expired Listings Feb" },
  { id: "d5", name: "Tom Bradley", address: "445 Spruce Ave", time: "1:00 PM", type: "Cold Call", phone: "(555) 567-8901", campaign: "Pre-Foreclosure Outreach" },
];

export const MOCK_CALL_SCRIPTS = [
  { id: "s1", name: "Follow-Up", type: "OUTBOUND", desc: "Re-engage warm leads", progress: 68 },
  { id: "s2", name: "Follow-Up Close", type: "OUTBOUND", desc: "Second touch negotiation", progress: 42 },
  { id: "s3", name: "Agent Intro", type: "OUTBOUND", desc: "Pitch to listing agents", progress: 15 },
];
