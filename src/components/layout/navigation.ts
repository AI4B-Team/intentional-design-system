import {
  AppWindow,
  BarChart3,
  Building2,
  Calculator,
  Car,
  DollarSign,
  FileText,
  Flame,
  Gauge,
  Globe,
  Hammer,
  Handshake,
  Kanban,
  Megaphone,
  Phone,
  Radar,
  Search,
  Settings,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AppNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: string;
  shortcut?: string;
}

export const SHELL_PRIMARY_NAV_ITEMS: AppNavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge, shortcut: "D" },
  { label: "Intel", href: "/intel", icon: Radar },
  { label: "Search", href: "/marketplace", icon: Search },
  { label: "Leads", href: "/leads", icon: Flame, shortcut: "L" },
  { label: "Pipeline", href: "/pipeline", icon: Kanban, shortcut: "P" },
  { label: "Transactions", href: "/transactions", icon: Handshake },
  { label: "Communications", href: "/communications", icon: Phone },
];

export const SHELL_SECONDARY_NAV_ITEMS: AppNavigationItem[] = [
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Apps", href: "/apps", icon: AppWindow },
];

export const COMMAND_NAVIGATION_ITEMS: AppNavigationItem[] = [
  ...SHELL_PRIMARY_NAV_ITEMS,
  { label: "Properties", href: "/properties", icon: Building2 },
  ...SHELL_SECONDARY_NAV_ITEMS,
  { label: "Dialer", href: "/dialer", icon: Phone },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Driving for Dollars", href: "/d4d", icon: Car },
  { label: "Market Analyzer", href: "/market-analyzer", icon: BarChart3 },
  { label: "Calculators", href: "/market-analyzer?tab=calculators", icon: Calculator },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Renovations", href: "/renovations", icon: Hammer },
  { label: "Dispo", href: "/dispo", icon: DollarSign },
  { label: "Seller Websites", href: "/websites", icon: Globe },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Settings", href: "/settings", icon: Settings },
];