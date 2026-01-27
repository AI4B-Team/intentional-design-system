import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  Plus,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Hammer,
  CheckSquare,
  Send,
  HelpCircle,
} from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  onMenuClick: () => void;
  breadcrumbs?: Breadcrumb[];
}


export function AppHeader({ onMenuClick, breadcrumbs }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-content-secondary hover:text-content hover:bg-surface-secondary rounded-md transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search - Far Left */}
      <div className="hidden md:block relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
        <Input
          type="search"
          placeholder="Search properties, contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-surface-secondary border-0"
        />
      </div>

      {/* Breadcrumbs (only if provided and has multiple items) */}
      {breadcrumbs && breadcrumbs.length > 1 && (
        <nav className="flex items-center gap-1 text-small min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-content-tertiary" />
              )}
              {crumb.href ? (
                <button
                  onClick={() => navigate(crumb.href!)}
                  className="text-content-secondary hover:text-content transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-content font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick Add Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="hidden sm:flex gap-1 bg-slate-800 hover:bg-slate-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-background">
          <DropdownMenuItem onClick={() => navigate("/properties/new")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/buyers")}>
            <User className="h-4 w-4 mr-2" />
            Buyer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/contractors")}>
            <Hammer className="h-4 w-4 mr-2" />
            Vendor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Post Deal Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate("/submit-deal")}
        className="hidden sm:flex gap-2"
      >
        <Send className="h-4 w-4" />
        <span>Post Deal</span>
      </Button>

      {/* Mobile Add Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="sm:hidden h-9 w-9 bg-slate-800 hover:bg-slate-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-white">
          <DropdownMenuItem onClick={() => navigate("/properties/new")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/buyers")}>
            <User className="h-4 w-4 mr-2" />
            Buyer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/contractors")}>
            <Hammer className="h-4 w-4 mr-2" />
            Vendor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help */}
      <button 
        onClick={() => navigate("/help")}
        className="p-2 text-content-secondary hover:text-content hover:bg-surface-secondary rounded-md transition-colors"
        title="Help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* Notifications */}
      <button className="relative p-2 text-content-secondary hover:text-content hover:bg-surface-secondary rounded-md transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
      </button>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-1.5 hover:bg-surface-secondary rounded-md transition-colors">
            <div className="h-8 w-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center font-medium text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-content-secondary">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
