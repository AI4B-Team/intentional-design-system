import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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

const navItems: NavItem[] = [
  { label: "AIVA", href: "/aiva", icon: Sparkles },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Contacts", href: "/deal-sources", icon: Users },
  { label: "Offers", href: "/offers", icon: Send },
  { label: "Contractors", href: "/contractors", icon: Hammer },
  { label: "Submissions", href: "/submissions", icon: Inbox, badgeKey: "submissions" },
  { label: "Buyers", href: "/buyers", icon: UserCheck },
];

const marketingGroup: NavGroup = {
  label: "Marketing",
  icon: Megaphone,
  items: [
    { label: "MLS", href: "/campaigns", icon: Megaphone },
    { label: "Direct Mail", href: "/mail", icon: Mail },
    { label: "Website", href: "/marketing/website", icon: Globe },
  ],
};

const bottomNavItems: NavItem[] = [
  { label: "Calculators", href: "/calculators", icon: Calculator },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

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
  const { data: pendingSubmissions } = usePendingSubmissionsCount();

  const [marketingOpen, setMarketingOpen] = React.useState(() => {
    return marketingGroup.items.some(item => location.pathname.startsWith(item.href));
  });

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "submissions") return pendingSubmissions || 0;
    return 0;
  };

  const isMarketingActive = marketingGroup.items.some(item => location.pathname.startsWith(item.href));

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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
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

          {/* Bottom Nav Items */}
          {bottomNavItems.map((item) => {
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
          "fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-slate-900 transition-all duration-200",
          collapsed ? "lg:w-16" : "lg:w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
