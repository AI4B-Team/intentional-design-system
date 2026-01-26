import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, Plus, Menu, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function Header({
  user,
  title,
  breadcrumbs,
  showSearch = true,
  onSearch,
  onMenuClick,
  showMenuButton = false,
  actions,
  className,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [notificationCount] = React.useState(3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-white px-md shadow-xs lg:px-lg",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Breadcrumbs or Title */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="hidden items-center gap-2 text-small sm:flex">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-content-tertiary">/</span>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-content">{item.label}</span>
                ) : (
                  <a
                    href={item.href}
                    className="text-content-secondary hover:text-content transition-colors"
                  >
                    {item.label}
                  </a>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : title ? (
          <h1 className="text-h3 font-semibold text-content">{title}</h1>
        ) : null}
      </div>

      {/* Center Section - Search */}
      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="hidden max-w-md flex-1 px-8 md:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-tertiary" />
            <input
              type="search"
              placeholder="Search properties, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-9 w-full rounded-small border border-border bg-surface-secondary pl-10 pr-12 text-body transition-all duration-150 placeholder:text-content-tertiary focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10 focus-visible:bg-white"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded border border-border bg-white px-1.5 py-0.5 text-tiny text-content-tertiary lg:flex">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>
        </form>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Custom Actions */}
        {actions}

        {/* Add Property Button */}
        <Button
          variant="primary"
          size="sm"
          icon={<Plus />}
          className="hidden sm:inline-flex"
        >
          Add Property
        </Button>

        {/* Mobile Add Button */}
        <Button
          variant="primary"
          size="icon"
          className="sm:hidden h-9 w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                  {notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">New lead assigned</span>
                <span className="text-small text-content-secondary">
                  123 Oak Street has been assigned to you
                </span>
                <span className="text-tiny text-content-tertiary">2 min ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Deal updated</span>
                <span className="text-small text-content-secondary">
                  456 Pine Ave moved to Due Diligence
                </span>
                <span className="text-tiny text-content-tertiary">1 hour ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <span className="font-medium">Document signed</span>
                <span className="text-small text-content-secondary">
                  Purchase agreement for 789 Elm St
                </span>
                <span className="text-tiny text-content-tertiary">3 hours ago</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-brand-accent font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0"
              >
                <Avatar size="sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-small font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-tiny leading-none text-content-tertiary">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
