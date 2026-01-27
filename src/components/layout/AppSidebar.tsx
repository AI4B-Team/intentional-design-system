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
  Megaphone,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Inbox,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Submissions", href: "/submissions", icon: Inbox, badgeKey: "submissions" },
  { label: "Deal Sources", href: "/deal-sources", icon: Users },
  { label: "Buyers", href: "/buyers", icon: UserCheck },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Calculators", href: "/calculators", icon: Calculator },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
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

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "submissions") return pendingSubmissions || 0;
    return 0;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-accent flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white whitespace-nowrap">
              DealFlow
            </span>
          )}
        </div>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
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
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-700 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
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
