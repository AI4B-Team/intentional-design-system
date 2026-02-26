import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Gauge, Building2, Users, Kanban, Phone, Inbox,
  Plus, Search, Settings, Sparkles, BarChart3,
  Calculator, FileText, Car, Megaphone, Globe,
  Hammer, Handshake, LogOut, DollarSign,
  Trophy, AppWindow, Radar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAIVA } from "@/contexts/AIVAContext";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAVIGATION_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge, shortcut: "D" },
  { label: "Pipeline", href: "/pipeline", icon: Kanban, shortcut: "P" },
  { label: "Intel", href: "/intel", icon: Radar },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Communications", href: "/communications", icon: Inbox },
  { label: "Dialer", href: "/dialer", icon: Phone },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Driving for Dollars", href: "/d4d", icon: Car },
  { label: "Market Analyzer", href: "/market-analyzer", icon: BarChart3 },
  { label: "Calculators", href: "/market-analyzer?tab=calculators", icon: Calculator },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Renovations", href: "/renovations", icon: Hammer },
  { label: "Transactions", href: "/transactions", icon: Handshake },
  { label: "Dispo", href: "/dispo", icon: DollarSign },
  { label: "Seller Websites", href: "/websites", icon: Globe },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Apps", href: "/apps", icon: AppWindow },
  { label: "Settings", href: "/settings", icon: Settings },
];

const QUICK_ACTIONS = [
  { label: "Add New Property", href: "/properties/new", icon: Plus },
  { label: "Start Driving Session", href: "/d4d", icon: Car },
  { label: "Analyze a Deal", href: "/market-analyzer?tab=deals", icon: BarChart3 },
  { label: "Search Properties & Markets", href: "/intel", icon: Search },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { openAIVA } = useAIVA();
  const [search, setSearch] = React.useState("");

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, actions, tools..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => openAIVA())}>
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>Ask AIVA</span>
            <CommandShortcut>AI</CommandShortcut>
          </CommandItem>
          {QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.href}
              onSelect={() => runCommand(() => navigate(action.href))}
            >
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {NAVIGATION_ITEMS.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => navigate(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => signOut())}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
