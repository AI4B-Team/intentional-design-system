import * as React from "react";
import { Phone, Mail, MessageSquare, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClickToCall, getTelLink, getSMSLink, getEmailLink, getDirectionsLink } from "@/lib/mobile-utils";
import { cn } from "@/lib/utils";

interface MobileActionBarProps {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  onAction?: (action: string) => void;
  className?: string;
}

export function MobileActionBar({
  phone,
  email,
  address,
  onAction,
  className,
}: MobileActionBarProps) {
  const { call, sms, email: sendEmail, getDirections } = useClickToCall();

  const actions = [
    {
      key: "call",
      icon: Phone,
      label: "Call",
      enabled: !!phone,
      onClick: () => {
        call(phone);
        onAction?.("call");
      },
    },
    {
      key: "sms",
      icon: MessageSquare,
      label: "Text",
      enabled: !!phone,
      onClick: () => {
        sms(phone);
        onAction?.("sms");
      },
    },
    {
      key: "email",
      icon: Mail,
      label: "Email",
      enabled: !!email,
      onClick: () => {
        sendEmail(email);
        onAction?.("email");
      },
    },
    {
      key: "directions",
      icon: Navigation,
      label: "Directions",
      enabled: !!address,
      onClick: () => {
        getDirections(address!);
        onAction?.("directions");
      },
    },
  ];

  const enabledActions = actions.filter((a) => a.enabled);

  if (enabledActions.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-16 left-0 right-0 z-30 border-t border-border-subtle bg-white p-3 lg:hidden safe-area-pb",
        className
      )}
    >
      <div className="flex justify-around gap-2">
        {enabledActions.map((action) => (
          <button
            key={action.key}
            onClick={action.onClick}
            className="flex flex-1 flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors touch-target"
          >
            <action.icon className="h-5 w-5 text-brand" />
            <span className="text-[11px] font-medium text-content-secondary">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Inline contact buttons for cards
interface ContactButtonsProps {
  phone?: string | null;
  email?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function ContactButtons({
  phone,
  email,
  size = "sm",
  className,
}: ContactButtonsProps) {
  if (!phone && !email) return null;

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {phone && (
        <>
          <a
            href={getTelLink(phone)}
            className={cn(
              "flex items-center justify-center rounded-full bg-success/10 text-success hover:bg-success/20 transition-colors",
              buttonSize
            )}
            aria-label="Call"
          >
            <Phone className={iconSize} />
          </a>
          <a
            href={getSMSLink(phone)}
            className={cn(
              "flex items-center justify-center rounded-full bg-info/10 text-info hover:bg-info/20 transition-colors",
              buttonSize
            )}
            aria-label="Text"
          >
            <MessageSquare className={iconSize} />
          </a>
        </>
      )}
      {email && (
        <a
          href={getEmailLink(email)}
          className={cn(
            "flex items-center justify-center rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors",
            buttonSize
          )}
          aria-label="Email"
        >
          <Mail className={iconSize} />
        </a>
      )}
    </div>
  );
}

// Address link that opens maps
interface AddressLinkProps {
  address: string;
  className?: string;
  showIcon?: boolean;
}

export function AddressLink({ address, className, showIcon = true }: AddressLinkProps) {
  const { getDirections } = useClickToCall();

  return (
    <button
      onClick={() => getDirections(address)}
      className={cn(
        "inline-flex items-center gap-1.5 text-left text-content-secondary hover:text-brand transition-colors",
        className
      )}
    >
      {showIcon && <MapPin className="h-4 w-4 shrink-0" />}
      <span className="underline-offset-4 hover:underline">{address}</span>
    </button>
  );
}
