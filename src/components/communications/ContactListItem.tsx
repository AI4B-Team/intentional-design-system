import * as React from "react";
import { cn } from "@/lib/utils";
import { CHANNEL_CONFIG, type Contact } from "./comms-config";
import { Phone, MessageCircle, Star, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContactListItemProps {
  contact: Contact;
  isActive: boolean;
  onClick: () => void;
  onCall?: () => void;
  onSms?: () => void;
  onCopy?: () => void;
}

export function ContactListItem({ contact, isActive, onClick, onCall, onSms, onCopy }: ContactListItemProps) {
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
