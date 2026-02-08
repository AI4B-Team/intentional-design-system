import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Phone,
  MessageSquare,
  Mail,
  Sparkles,
  Hash,
  FileText,
  Building2,
  Search,
  PenTool,
  BookOpen,
  Dumbbell,
  Calendar,
  BarChart3,
  Users,
  Palette,
  Settings,
} from "lucide-react";

interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  href?: string;
  disabled?: boolean;
  /** Optional custom matcher for highlighting active state based on route */
  activeMatch?: (pathname: string) => boolean;
}

interface SidebarSection {
  label: string;
  items: SidebarNavItem[];
}

interface SessionSidebarProps {
  isLive: boolean;
  onLiveCallClick: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function SessionSidebar({
  isLive,
  onLiveCallClick,
  activeSection = "calls",
  onSectionChange,
}: SessionSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const sections: SidebarSection[] = [
    {
      label: "Dialer & SMS",
      items: [
        {
          id: "power-dialer",
          label: "Power Dialer",
          icon: Phone,
          href: "/dialer",
          activeMatch: (p) => p.startsWith("/dialer"),
        },
        {
          id: "sms",
          label: "SMS",
          icon: MessageSquare,
          disabled: true,
        },
        {
          id: "follow-ups",
          label: "Follow-ups",
          icon: Mail,
          badge: "NEW",
          disabled: true,
        },
        {
          id: "numbers",
          label: "Numbers",
          icon: Hash,
          badge: "NEW",
          disabled: true,
        },
      ],
    },
    {
      label: "Sales Tools",
      items: [
        {
          id: "scripts",
          label: "Scripts",
          icon: FileText,
          badge: "NEW",
          href: "/dialer/scripts",
          activeMatch: (p) => p.startsWith("/dialer/scripts"),
        },
        {
          id: "objections",
          label: "Objections",
          icon: MessageSquare,
          disabled: true,
        },
        {
          id: "prep",
          label: "Prep",
          icon: Sparkles,
          disabled: true,
        },
      ],
    },
    {
      // Present in screenshot even if currently empty
      label: "CRM",
      items: [],
    },
    {
      label: "Research & Intel",
      items: [
        {
          id: "company",
          label: "Company",
          icon: Building2,
          badge: "NEW",
          disabled: true,
        },
        {
          id: "research",
          label: "Research",
          icon: Search,
          badge: "NEW",
          disabled: true,
        },
        {
          id: "ai-notes",
          label: "AI Notes",
          icon: PenTool,
          badge: "NEW",
          disabled: true,
        },
      ],
    },
    {
      label: "Training",
      items: [
        {
          id: "knowledge",
          label: "Knowledge",
          icon: BookOpen,
          disabled: true,
        },
        {
          id: "practice",
          label: "Practice",
          icon: Dumbbell,
          badge: "NEW",
          disabled: true,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          id: "calendar",
          label: "Calendar",
          icon: Calendar,
          badge: "NEW",
          disabled: true,
        },
        {
          id: "performance",
          label: "Performance",
          icon: BarChart3,
          disabled: true,
        },
        {
          id: "team",
          label: "Team",
          icon: Users,
          href: "/settings/team",
          activeMatch: (p) => p.startsWith("/settings/team"),
        },
        {
          id: "branding",
          label: "Branding",
          icon: Palette,
          href: "/settings/organization",
          activeMatch: (p) => p.startsWith("/settings/organization"),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          href: "/settings/dialer",
          activeMatch: (p) => p.startsWith("/settings/dialer"),
        },
      ],
    },
  ];

  const isItemActive = (item: SidebarNavItem) => {
    if (item.activeMatch) return item.activeMatch(pathname);
    return item.id === activeSection;
  };

  const renderNavItem = (item: SidebarNavItem) => {
    const isActive = isItemActive(item);
    const isDisabled = !!item.disabled && !item.href;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          if (isDisabled) return;
          if (item.href) {
            navigate(item.href);
            return;
          }
          onSectionChange?.(item.id);
        }}
        aria-disabled={isDisabled}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-muted text-foreground font-medium"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          isDisabled &&
            "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span className="truncate">{item.label}</span>
        {item.badge && (
          <Badge variant="success" size="sm" className="ml-auto text-[9px] px-1.5 py-0">
            {item.badge}
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-border-subtle flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Master Closer</h2>
            <p className="text-xs text-muted-foreground">AI Sales Co-Pilot</p>
          </div>
        </div>
      </div>

      {/* Live Call Button */}
      <div className="p-4">
        <Button
          onClick={onLiveCallClick}
          className="w-full gap-2 font-semibold bg-destructive hover:bg-destructive/90 text-white"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {isLive ? "LIVE Call" : "Start Call"}
        </Button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {section.label}
            </p>
            {section.items.length > 0 && (
              <div className="space-y-1">{section.items.map(renderNavItem)}</div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
