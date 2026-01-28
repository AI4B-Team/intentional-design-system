import * as React from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import {
  Home,
  Building2,
  Users,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  Calculator,
  Banknote,
  LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: Home },
      { label: "Properties", href: "/properties", icon: Building2, badge: 12 },
      { label: "Contacts", href: "/contacts", icon: Users },
    ],
  },
  {
    label: "Deals",
    items: [
      { label: "Pipeline", href: "/pipeline", icon: Briefcase, badge: 3 },
      { label: "Marketplace", href: "/marketplace", icon: Banknote },
      { label: "Capital", href: "/capital", icon: Banknote },
      { label: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    label: "Analysis Tools",
    items: [
      { label: "Deal Analyzer", href: "/calculators?tab=deal", icon: Calculator },
      { label: "Comp Search", href: "/calculators?tab=comps", icon: MapPin },
      { label: "Rental Calculator", href: "/calculators?tab=rental", icon: Home },
      { label: "Repair Estimator", href: "/calculators?tab=repairs", icon: Briefcase },
      { label: "Market Trends", href: "/calculators?tab=trends", icon: BarChart3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Markets", href: "/markets", icon: MapPin },
      { label: "Preferences", href: "/settings", icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  className?: string;
}

export function AppSidebar({
  collapsed,
  onCollapsedChange,
  user = { name: "John Doe", email: "john@example.com" },
  className,
}: AppSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border-subtle bg-surface-secondary transition-all duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center px-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-medium bg-brand text-white font-bold text-body">
            R
          </div>
          {!collapsed && (
            <span className="text-[20px] font-semibold text-content">
              RealVest
            </span>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto p-xs">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-md">
            {!collapsed && (
              <div className="px-3 mb-2 text-tiny uppercase tracking-wide text-content-tertiary font-medium">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 rounded-small px-3 transition-all duration-150",
                    "text-content-secondary hover:bg-white hover:text-content hover:shadow-xs",
                    collapsed && "justify-center px-0"
                  )}
                  activeClassName="bg-white text-content font-medium shadow-xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-full before:bg-brand-accent [&>svg]:text-brand-accent"
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 text-content-tertiary transition-colors group-hover:text-content",
                      collapsed && "h-5 w-5"
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-body">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="default"
                          size="sm"
                          className="bg-brand-accent text-white"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn(
            "w-full justify-center text-content-tertiary hover:text-content",
            !collapsed && "justify-start px-3"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User Section */}
      <div className="border-t border-border-subtle p-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-small p-2 transition-colors hover:bg-white",
                collapsed && "justify-center"
              )}
            >
              <Avatar size="sm">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="text-small font-medium text-content truncate">
                    {user.name}
                  </div>
                  <div className="text-tiny text-content-tertiary truncate">
                    {user.email}
                  </div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? "center" : "start"}
            side="top"
            className="w-56 bg-white"
          >
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

// Mobile Sidebar Drawer
interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function MobileSidebar({ open, onOpenChange, user }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px] transform bg-surface-secondary transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AppSidebar
          collapsed={false}
          onCollapsedChange={() => {}}
          user={user}
          className="relative w-full border-r-0"
        />
      </div>
    </>
  );
}

// Bottom Tab Bar for Mobile
export function MobileTabBar() {
  const tabs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Properties", href: "/properties", icon: Building2 },
    { label: "Sources", href: "/deal-sources", icon: MapPin },
    { label: "Offers", href: "/offers", icon: Briefcase },
    { label: "More", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-white lg:hidden safe-area-pb">
      {tabs.map((tab) => (
        <NavLink
          key={tab.href}
          to={tab.href}
          end={tab.href === "/dashboard"}
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-content-tertiary transition-colors min-w-[64px]"
          activeClassName="text-brand"
        >
          <tab.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
