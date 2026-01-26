import * as React from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Building2,
  Users,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  navGroups?: NavGroup[];
  className?: string;
}

const defaultNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/", icon: Home },
      { label: "Properties", href: "/properties", icon: Building2 },
      { label: "Contacts", href: "/contacts", icon: Users },
      { label: "Deals", href: "/deals", icon: FileText },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help", href: "/help", icon: HelpCircle },
    ],
  },
];

export function AppSidebar({
  collapsed = false,
  onCollapsedChange,
  logo,
  navGroups = defaultNavGroups,
  className,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            {logo || (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
                R
              </div>
            )}
            <span className="text-h3 font-semibold text-sidebar-foreground">
              REInvest
            </span>
          </div>
        )}
        {collapsed && logo && <div className="mx-auto">{logo}</div>}
        {collapsed && !logo && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
            R
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {group.label && !collapsed && (
              <div className="mb-2 px-4">
                <span className="text-tiny font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
              </div>
            )}
            <ul className="space-y-1 px-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    className={cn(
                      "nav-item nav-item-inactive",
                      collapsed && "justify-center px-0"
                    )}
                    activeClassName="nav-item-active bg-sidebar-accent"
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-tiny font-medium px-1.5">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      {onCollapsedChange && (
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );
}
