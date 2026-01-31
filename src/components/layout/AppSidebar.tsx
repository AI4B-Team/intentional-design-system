import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAIVA } from "@/contexts/AIVAContext";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { usePendingSubmissionsCount } from "@/hooks/useDealSubmissions";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  UserPlus,
  Megaphone,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  Send,
  X,
  Inbox,
  Hammer,
  Mail,
  ChevronDown,
  Globe,
  Sparkles,
  AtSign,
  ListFilter,
  Phone,
  DollarSign,
  Store,
  Car,
  Wrench,
  Handshake,
  Trophy,
  Award,
  FileText,
  Home,
  Package,
  Kanban,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: string;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const topNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "Properties", href: "/properties", icon: Building2 },
];

const afterLeadsItems: NavItem[] = [
  { label: "Financing", href: "/financing", icon: DollarSign },
];

const leadsGroup: NavGroup = {
  label: "Leads",
  icon: UserPlus,
  items: [
    { label: "Submissions", href: "/submissions", icon: Inbox, badgeKey: "submissions" },
  ],
};

// Contacts - direct nav item (not a collapsible group)
const contactsNavItem: NavItem = {
  label: "Contacts",
  href: "/contacts",
  icon: Users,
};

const marketingGroup: NavGroup = {
  label: "Marketing",
  icon: Megaphone,
  items: [
    { label: "Lists", href: "/marketing/lists", icon: ListFilter },
    { label: "Email", href: "/marketing/email", icon: AtSign },
    { label: "Dialer", href: "/dialer", icon: Phone },
    { label: "Direct Mail", href: "/mail", icon: Mail },
    { label: "MLS", href: "/campaigns", icon: Megaphone },
    { label: "Website", href: "/websites", icon: Globe },
    { label: "Offers", href: "/offers", icon: Send },
  ],
};

const dispoGroup: NavGroup = {
  label: "Deal Marketing",
  icon: Package,
  items: [
    { label: "Deals", href: "/dispo/deals", icon: Home },
    { label: "Cash Buyers", href: "/dispo/buyers", icon: UserCheck },
    { label: "Campaigns", href: "/dispo/campaigns", icon: Mail },
    { label: "Settings", href: "/dispo/settings", icon: Settings },
  ],
};

const toolsGroup: NavGroup = {
  label: "Tools",
  icon: Calculator,
  items: [
    { label: "D4D", href: "/d4d", icon: Car },
    { label: "Renovations", href: "/renovations", icon: Wrench },
    { label: "Deal Analyzer", href: "/tools/deal-analyzer", icon: Sparkles },
    { label: "Market Analyzer", href: "/tools/market-analyzer", icon: BarChart3 },
    { label: "OfferBlaster", href: "/tools/offer-blaster", icon: Send },
    { label: "Calculators", href: "/calculators", icon: Calculator },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
  ],
};

const moreGroup: NavGroup = {
  label: "More",
  icon: FileText,
  items: [
    { label: "JV Partners", href: "/jv", icon: Handshake },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Achievements", href: "/achievements", icon: Award },
    { label: "Daily Report", href: "/reports/daily", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { openAIVA, isOpen: aivaOpen } = useAIVA();
  const { data: pendingSubmissions } = usePendingSubmissionsCount();

  const [leadsOpen, setLeadsOpen] = React.useState(() => {
    return leadsGroup.items.some(item => location.pathname.startsWith(item.href));
  });

  // Contacts is now a direct link, no open state needed

  const [marketingOpen, setMarketingOpen] = React.useState(() => {
    return marketingGroup.items.some(item => location.pathname.startsWith(item.href));
  });

  const [toolsOpen, setToolsOpen] = React.useState(() => {
    return toolsGroup.items.some(item => location.pathname.startsWith(item.href));
  });

  const [moreOpen, setMoreOpen] = React.useState(() => {
    return moreGroup.items.some(item => location.pathname.startsWith(item.href));
  });

  const [dispoOpen, setDispoOpen] = React.useState(() => {
    return dispoGroup.items.some(item => location.pathname.startsWith(item.href));
  });

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "submissions") return pendingSubmissions || 0;
    return 0;
  };

  const isLeadsActive = leadsGroup.items.some(item => location.pathname.startsWith(item.href));
  const isContactsActive = location.pathname.startsWith(contactsNavItem.href);
  const isMarketingActive = marketingGroup.items.some(item => location.pathname.startsWith(item.href));
  const isToolsActive = toolsGroup.items.some(item => location.pathname.startsWith(item.href));
  const isMoreActive = moreGroup.items.some(item => location.pathname.startsWith(item.href));
  const isDispoActive = dispoGroup.items.some(item => location.pathname.startsWith(item.href));

  const handleSignOut = async () => {
    await signOut();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={collapsed ? onToggle : undefined}
            className={cn(
              "h-8 w-8 rounded-lg bg-brand-accent flex items-center justify-center flex-shrink-0",
              collapsed && "cursor-pointer hover:bg-brand-accent/80 transition-colors"
            )}
            title={collapsed ? "Expand sidebar" : undefined}
          >
            <Building2 className="h-5 w-5 text-white" />
          </button>
          {!collapsed && (
            <span className="text-lg font-bold text-white whitespace-nowrap">
              DealFlow
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Collapse Toggle - Desktop Only */}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="py-2 border-b border-slate-700">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="space-y-1">
          {/* AIVA Button - Opens Panel */}
          <li>
            <button
              onClick={() => {
                openAIVA();
                onMobileClose();
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full",
                "text-slate-300 hover:text-white hover:bg-slate-700/50",
                aivaOpen && "bg-gradient-to-r from-primary to-primary/60 text-white font-medium",
                collapsed && "justify-center"
              )}
            >
              <div className="relative">
                <Sparkles className={cn("h-5 w-5 flex-shrink-0", aivaOpen && "text-white")} />
                {!aivaOpen && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
                )}
              </div>
              {!collapsed && <span>AIVA</span>}
              {!collapsed && (
                <span className="ml-auto text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">AI</span>
              )}
            </button>
          </li>

          {/* Top Nav Items */}
          {topNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            const badgeCount = getBadgeCount(item.badgeKey);

            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                    "text-slate-300 hover:text-white hover:bg-slate-700/50",
                    isActive && "bg-brand-accent text-white font-medium",
                    collapsed && "justify-center"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
                    {collapsed && badgeCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-[10px] font-bold text-white flex items-center justify-center">
                        {badgeCount > 9 ? "9+" : badgeCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && badgeCount > 0 && (
                    <span className="ml-auto bg-warning text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}

          {/* Leads Group */}
          <li>
            <button
              onClick={() => !collapsed && setLeadsOpen(!leadsOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full",
                "text-slate-300 hover:text-white hover:bg-slate-700/50",
                isLeadsActive && "text-white",
                collapsed && "justify-center"
              )}
            >
              <div className="relative">
                <leadsGroup.icon className={cn("h-5 w-5 flex-shrink-0", isLeadsActive && "text-brand-accent")} />
                {collapsed && getBadgeCount("submissions") > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-[10px] font-bold text-white flex items-center justify-center">
                    {getBadgeCount("submissions") > 9 ? "9+" : getBadgeCount("submissions")}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <span>{leadsGroup.label}</span>
                  {getBadgeCount("submissions") > 0 && (
                    <span className="bg-warning text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {getBadgeCount("submissions")}
                    </span>
                  )}
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-auto transition-transform",
                    leadsOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>
            {!collapsed && leadsOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-3">
                {leadsGroup.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  const badgeCount = getBadgeCount(item.badgeKey);

                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                          "text-slate-400 hover:text-white hover:bg-slate-700/50 text-sm",
                          isActive && "bg-brand-accent/20 text-white font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="ml-auto bg-warning text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                            {badgeCount}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Contacts - Direct Link */}
          <li>
            <NavLink
              to={contactsNavItem.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                "text-slate-300 hover:text-white hover:bg-slate-700/50",
                isContactsActive && "bg-brand-accent text-white font-medium",
                collapsed && "justify-center"
              )}
            >
              <contactsNavItem.icon className={cn("h-5 w-5 flex-shrink-0", isContactsActive && "text-white")} />
              {!collapsed && <span>{contactsNavItem.label}</span>}
            </NavLink>
          </li>

          {/* Marketing Group */}
          <li>
            <button
              onClick={() => !collapsed && setMarketingOpen(!marketingOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full",
                "text-slate-300 hover:text-white hover:bg-slate-700/50",
                isMarketingActive && "text-white",
                collapsed && "justify-center"
              )}
            >
              <marketingGroup.icon className={cn("h-5 w-5 flex-shrink-0", isMarketingActive && "text-brand-accent")} />
              {!collapsed && (
                <>
                  <span>{marketingGroup.label}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-auto transition-transform",
                    marketingOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>
            {!collapsed && marketingOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-3">
                {marketingGroup.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                          "text-slate-400 hover:text-white hover:bg-slate-700/50 text-sm",
                          isActive && "bg-brand-accent/20 text-white font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* After Leads Items */}
          {afterLeadsItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                    "text-slate-300 hover:text-white hover:bg-slate-700/50",
                    isActive && "bg-brand-accent text-white font-medium",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}

          {/* Tools Group */}
          <li>
            <button
              onClick={() => !collapsed && setToolsOpen(!toolsOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full",
                "text-slate-300 hover:text-white hover:bg-slate-700/50",
                isToolsActive && "text-white",
                collapsed && "justify-center"
              )}
            >
              <toolsGroup.icon className={cn("h-5 w-5 flex-shrink-0", isToolsActive && "text-brand-accent")} />
              {!collapsed && (
                <>
                  <span>{toolsGroup.label}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-auto transition-transform",
                    toolsOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>
            {!collapsed && toolsOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-3">
                {toolsGroup.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                          "text-slate-400 hover:text-white hover:bg-slate-700/50 text-sm",
                          isActive && "bg-brand-accent/20 text-white font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Dispo / Deal Marketing Group */}
          <li>
            <button
              onClick={() => !collapsed && setDispoOpen(!dispoOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full",
                "text-slate-300 hover:text-white hover:bg-slate-700/50",
                isDispoActive && "text-white",
                collapsed && "justify-center"
              )}
            >
              <dispoGroup.icon className={cn("h-5 w-5 flex-shrink-0", isDispoActive && "text-brand-accent")} />
              {!collapsed && (
                <>
                  <span>{dispoGroup.label}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-auto transition-transform",
                    dispoOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>
            {!collapsed && dispoOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-3">
                {dispoGroup.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                          "text-slate-400 hover:text-white hover:bg-slate-700/50 text-sm",
                          isActive && "bg-brand-accent/20 text-white font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          <li>
            <button
              onClick={() => !collapsed && setMoreOpen(!moreOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full",
                "text-slate-300 hover:text-white hover:bg-slate-700/50",
                isMoreActive && "text-white",
                collapsed && "justify-center"
              )}
            >
              <moreGroup.icon className={cn("h-5 w-5 flex-shrink-0", isMoreActive && "text-brand-accent")} />
              {!collapsed && (
                <>
                  <span>{moreGroup.label}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-auto transition-transform",
                    moreOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>
            {!collapsed && moreOpen && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-3">
                {moreGroup.items.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                          "text-slate-400 hover:text-white hover:bg-slate-700/50 text-sm",
                          isActive && "bg-brand-accent/20 text-white font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 flex flex-col bg-slate-900 transition-all duration-200",
          collapsed ? "lg:w-16" : "lg:w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
