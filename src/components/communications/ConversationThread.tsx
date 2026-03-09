import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCallState } from "@/contexts/CallContext";
import { CHANNEL_CONFIG, type Contact } from "./comms-config";
import { ChannelBadge, DirectionBadge } from "./comms-ui-primitives";
import {
  Phone, MessageCircle, Mail, Sparkles, Send, ChevronDown,
  PanelLeftOpen, FileText, Home, MapPin, Star, Pencil, Trash2,
  MoreVertical, Zap, X,
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationThreadProps {
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
}

export function ConversationThread({
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
}: ConversationThreadProps) {
  const callState = useCallState();
  const [contactDetailsOpen, setContactDetailsOpen] = useState(true);
  const composeInputRef = React.useRef<HTMLInputElement>(null);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-6 text-muted-foreground px-8">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-1">Welcome to Communications</h2>
            <p className="text-sm text-muted-foreground">This is where deals move forward. Messages, calls, and AI guidance work together here.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Inbox</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Review messages, missed calls, and voicemails. AI highlights what needs action.</p>
              <span className="text-xs font-semibold text-primary group-hover:underline">View Inbox →</span>
            </div>
            
            <div className="p-5 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer" onClick={() => onSwitchToDialer?.()}>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <Phone className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Dialer</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Start live calls with AI guidance. Import lists or dial manually.</p>
              <span className="text-xs font-semibold text-primary group-hover:underline">Start Dialing →</span>
            </div>
            
            <div className="p-5 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer" onClick={() => onStartPowerHour?.()}>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Power Hour</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Lock in for 60 minutes of focused calling. Distractions hidden.</p>
              <span className="text-xs font-semibold text-primary group-hover:underline">Launch Session →</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">Show Me What to Do</div>
              <div className="text-[11px] text-muted-foreground">AI will analyze your pipeline and recommend the highest-impact communication actions right now.</div>
            </div>
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
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Thread Header */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {contact.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-foreground">{contact.name}</span>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">{contact.tag}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {contact.address}
              {contact.phone && <> · <Phone className="h-3 w-3" /> {contact.phone}</>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {autoSelectedReason && (
            <div className="flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/15">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary">{autoSelectedReason}</span>
              <button onClick={onDismissAutoSelect} className="text-muted-foreground hover:text-foreground ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={onCall} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors">
                  <Phone className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Call with real-time AI coaching</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => { onSendChannelChange("sms"); toast.info("Channel set to SMS"); }} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Send SMS</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => { onSendChannelChange("email"); toast.info("Channel set to Email"); }} className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors">
                  <Mail className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Send Email</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditContact}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(contact.phone || ""); toast.success("Phone copied"); }}>
                <Phone className="h-3.5 w-3.5 mr-2" /> Copy Phone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteContact} className="text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Contact
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Collapsible Contact Details */}
      <button
        onClick={() => setContactDetailsOpen(!contactDetailsOpen)}
        className="w-full px-5 py-2 flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-muted-foreground bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-1.5"><Home className="h-3 w-3" /> Contact Details</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", contactDetailsOpen && "rotate-180")} />
      </button>
      {contactDetailsOpen && (
        <div className="px-5 py-2.5 border-b border-border bg-muted/20 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5">
          <div className="text-[11px]"><span className="text-muted-foreground">Property:</span> <span className="font-medium text-foreground">{contact.address}</span></div>
          <div className="text-[11px]"><span className="text-muted-foreground">Location:</span> <span className="font-medium text-foreground">{[contact.city, contact.state].filter(Boolean).join(", ") || "—"}{contact.zip ? ` ${contact.zip}` : ""}</span></div>
          <div className="text-[11px]"><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{contact.phone || "—"}</span></div>
          <div className="text-[11px]"><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{contact.email || "—"}</span></div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
        {contact.activities.map((act) => {
          const config = CHANNEL_CONFIG[act.channel];
          const Icon = config?.icon || MessageCircle;
          const isInbound = act.direction === "inbound";

          return (
            <div
              key={act.id}
              className={cn(
                "flex gap-3",
                isInbound ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                config?.bgClass || "bg-muted"
              )}>
                <Icon className={cn("h-3.5 w-3.5", config?.colorClass || "text-muted-foreground")} />
              </div>
              <div className={cn(
                "max-w-[75%] rounded-xl px-4 py-3 border",
                isInbound
                  ? "bg-muted/60 border-border/50 rounded-tl-none"
                  : "bg-primary/5 border-primary/15 rounded-tr-none"
              )}>
                <div className="flex items-center gap-2 mb-1">
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
