import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  User,
  DollarSign,
  Briefcase,
  BadgeCheck,
  Sparkles,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  name: string;
  phone: string;
  email: string;
  type: "agent" | "seller";
  brokerage?: string;
}

interface MessageTemplate {
  id: string;
  label: string;
  message: string;
}

interface ContactPanelProps {
  contact: Contact;
  propertyAddress: string;
  propertyPrice: number;
}

const MESSAGE_TEMPLATES: Record<string, MessageTemplate[]> = {
  investor: [
    { id: "cash", label: "💰 Cash Offer", message: "Hi {agentName}, I'm a cash buyer interested in {address}. I can close quickly at {price}. Would the seller consider a cash offer?" },
    { id: "asis", label: "🔧 As-Is Offer", message: "Hi {agentName}, I buy properties as-is with no inspections. Interested in {address} at {priceRange}. Can we discuss?" },
    { id: "creative", label: "🎯 Creative Terms", message: "Hi {agentName}, would your seller consider creative terms on {address}? I'm flexible on structure - sub-to, seller finance, or lease option." },
    { id: "info", label: "📋 Request Info", message: "Hi {agentName}, I'm interested in {address}. Can you share seller motivation, property condition, and best offer terms?" },
  ],
  agent: [
    { id: "client", label: "👤 Client Interest", message: "Hi {agentName}, I have a qualified buyer interested in {address}. They're pre-approved and ready to move quickly. Are you still accepting offers?" },
    { id: "showing", label: "📅 Schedule Showing", message: "Hi {agentName}, I'd like to schedule a showing for my client at {address}. What times work for you this week?" },
    { id: "terms", label: "📝 Discuss Terms", message: "Hi {agentName}, my client is very interested in {address}. Before writing an offer, can we discuss what terms would be most attractive to your seller?" },
    { id: "commission", label: "💼 Commission Split", message: "Hi {agentName}, regarding {address} - can you confirm the buyer's agent commission being offered? My client is ready to proceed." },
  ],
  "investor-agent": [
    { id: "dual", label: "🏠 Investor Interest", message: "Hi {agentName}, I'm a licensed investor interested in {address}. I buy for my own portfolio and can close quickly at {price}." },
    { id: "asis", label: "🔧 As-Is Purchase", message: "Hi {agentName}, I specialize in as-is purchases. Would your seller consider {priceRange} for {address} with a quick close?" },
    { id: "creative", label: "🎯 Creative Terms", message: "Hi {agentName}, I'm licensed and looking at {address}. Would seller consider sub-to existing loan of {loanAmount} or seller financing?" },
    { id: "direct", label: "📋 Direct Deal", message: "Hi {agentName}, I'm a licensed investor. For {address}, I can represent myself. What's your seller's bottom line?" },
  ],
};

export function ContactPanel({ contact, propertyAddress, propertyPrice }: ContactPanelProps) {
  const [isOpen, setIsOpen] = useState(false); // Default closed
  const [userType, setUserType] = useState<"investor" | "agent" | "investor-agent">("investor");
  const [message, setMessage] = useState("");

  const handleTemplateClick = (template: MessageTemplate) => {
    const filledMessage = template.message
      .replace("{agentName}", contact.name.split(" ")[0])
      .replace("{address}", propertyAddress)
      .replace("{price}", `$${Math.round(propertyPrice * 0.9).toLocaleString()}`)
      .replace("{priceRange}", `$${Math.round(propertyPrice * 0.85).toLocaleString()} - $${Math.round(propertyPrice * 0.92).toLocaleString()}`)
      .replace("{loanAmount}", `$${Math.round(propertyPrice * 0.97).toLocaleString()}`);
    setMessage(filledMessage);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden border-warning/50 bg-warning/5">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-warning/10 transition-colors">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-warning" />
              <span className="font-semibold">Contact</span>
              <Badge variant="secondary" className="text-xs">
                {contact.type === "agent" ? "Agent" : "Seller"}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            {/* Contact Info */}
            <h3 className="text-lg font-semibold mb-3">{contact.name}</h3>

            <div className="space-y-2 mb-4">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                {contact.email}
              </a>
            </div>

            {/* User Type Toggle */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <User className="h-3 w-3" />
                I am a...
              </p>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setUserType("investor")}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                    userType === "investor"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  <DollarSign className="h-3 w-3" />
                  Investor
                </button>
                <button
                  onClick={() => setUserType("agent")}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border-x border-border",
                    userType === "agent"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Briefcase className="h-3 w-3" />
                  Agent
                </button>
                <button
                  onClick={() => setUserType("investor-agent")}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                    userType === "investor-agent"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  <BadgeCheck className="h-3 w-3" />
                  Licensed
                </button>
              </div>
            </div>

            {/* AI Message Templates */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                AI Message Templates
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {MESSAGE_TEMPLATES[userType].map((template) => (
                  <TooltipProvider key={template.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleTemplateClick(template)}
                          className="px-2.5 py-1.5 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors text-left truncate"
                        >
                          {template.label}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[250px]">
                        <p className="text-xs">{template.label.replace(/[^\w\s]/g, "").trim()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                userType === "investor"
                  ? "Write your offer message..."
                  : userType === "agent"
                  ? "Write on behalf of your client..."
                  : "Write your message (include license disclosure)..."
              }
              className="min-h-[100px] mb-3 text-sm"
            />

            {/* Send Actions */}
            <div className="space-y-2">
              <Button variant="primary" className="w-full gap-2" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
                Send Message
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="secondary" className="w-full gap-2 text-xs" size="sm">
                      <Mail className="h-3.5 w-3.5" />
                      Launch Campaign To Similar Listings
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px]">
                    <p className="text-xs">Send this message to multiple agents with similar listings in one click</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Only HomesDaily Connects You To The Listing Agent.
            </p>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
