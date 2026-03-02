import * as React from "react";
// Sidebar navigation component
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAIVA } from "@/contexts/AIVAContext";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { RealEliteLogo } from "@/components/brand/RealEliteLogo";
import { usePendingSubmissionsCount } from "@/hooks/useDealSubmissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Gauge,
  Building2,
  Users,
  UserCheck,
  UserPlus,
  Megaphone,
  Calculator,
  Radar,
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
  Search,
  Car,
  Wrench,
  Handshake,
  Trophy,
  Award,
  FileText,
  Home,
  Kanban,
  FolderOpen,
  PenTool,
  AppWindow,
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
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Intel", href: "/intel", icon: Radar },
  { label: "Search", href: "/marketplace", icon: Search },
  { label: "Pipeline", href: "/pipeline", icon: Kanban },
  { label: "Transactions", href: "/transactions", icon: Handshake },
  { label: "Communications", href: "/communications", icon: Phone },
];

// Pipeline is now a direct top nav item

// Pipeline is now a direct top nav item, not a group


// Contacts - direct nav item (not a collapsible group)
const contactsNavItem: NavItem = {
  label: "Contacts",
  href: "/contacts",
  icon: Users,
};


// Documents moved to Apps page

// Apps - direct nav item (not a collapsible group)
const appsNavItem: NavItem = {
  label: "Apps",
  href: "/apps",
  icon: AppWindow,
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

  // Pipeline is now a direct top nav item, no dropdown state needed

  // Leads is now a direct link, no open state needed

  // Contacts is now a direct link, no open state needed



  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "submissions") return pendingSubmissions || 0;
    return 0;
  };

  // Active state checks for navigation items
  const isContactsActive = location.pathname.startsWith(contactsNavItem.href);
  const isAppsActive = location.pathname.startsWith(appsNavItem.href);

  const handleSignOut = async () => {
    await signOut();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4" style={{borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
        <div className="flex items-center gap-2">
          {collapsed ? (
            <button
              onClick={onToggle}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="Expand sidebar"
            >
              <RealEliteLogo iconOnly height={24} color="white" />
            </button>
          ) : (
            <RealEliteLogo height={20} color="white" />
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
      <div className="py-2" style={{borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] scrollbar-hide py-3 px-2">
        <TooltipProvider delayDuration={0}>
          <ul className="space-y-0.5">
            {/* AIVA Button - Opens Panel */}
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      openAIVA();
                      onMobileClose();
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 w-full",
                       "text-slate-400 hover:text-white hover:bg-white/5",
                       aivaOpen && "bg-gradient-to-r from-primary/25 via-primary/15 to-transparent border border-primary/30 text-white shadow-glow-sm font-semibold",
                      collapsed && "justify-center"
                    )}
                  >
                    <div className="relative">
                      <Sparkles className={cn("h-5 w-5 flex-shrink-0", aivaOpen && "text-white")} />
                      {!aivaOpen && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    {!collapsed && <span>AIVA</span>}
                    {!collapsed && (
                      <span className="ml-auto text-[10px] text-slate-900 bg-amber-400 px-1.5 py-0.5 rounded font-medium">AI</span>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-white text-slate-900 border-slate-200">
                    AIVA
                  </TooltipContent>
                )}
              </Tooltip>
            </li>

            {/* Top Nav Items */}
            {topNavItems.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const badgeCount = getBadgeCount(item.badgeKey);

              return (
                <li key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        onClick={onMobileClose}
                        className={cn(
                           "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                           "text-slate-400 hover:text-white hover:bg-white/5",
                           isActive && "nav-item-glow text-white font-semibold",
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
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-white text-slate-900 border-slate-200">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              );
            })}

            {/* Divider after top nav items */}
            <li className="py-2">
              <div className="border-t border-white/[0.06]" />
            </li>

            {/* Contacts - Direct Link */}
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={contactsNavItem.href}
                    onClick={onMobileClose}
                    className={cn(
                       "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                       "text-slate-400 hover:text-white hover:bg-white/5",
                       isContactsActive && "nav-item-glow text-white font-semibold",
                      collapsed && "justify-center"
                    )}
                  >
                    <contactsNavItem.icon className={cn("h-5 w-5 flex-shrink-0", isContactsActive && "text-white")} />
                    {!collapsed && <span>{contactsNavItem.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-white text-slate-900 border-slate-200">
                    {contactsNavItem.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>



            {/* Apps - Direct Link */}
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={appsNavItem.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                       "text-slate-400 hover:text-white hover:bg-white/5",
                       isAppsActive && "nav-item-glow text-white font-semibold",
                      collapsed && "justify-center"
                    )}
                  >
                    <appsNavItem.icon className={cn("h-5 w-5 flex-shrink-0", isAppsActive && "text-white")} />
                    {!collapsed && <span>{appsNavItem.label}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-white text-slate-900 border-slate-200">
                    {appsNavItem.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          </ul>
        </TooltipProvider>
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

      {/* Sidebar - fixed on desktop for full viewport height coverage */}
      <aside
        data-sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col sidebar-premium noise-texture transition-all duration-200",
          collapsed ? "lg:w-16" : "lg:w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
