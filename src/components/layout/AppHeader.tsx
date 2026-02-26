import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Plus,
  User,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Hammer,
  CheckSquare,
  Home,
  Calendar,
  Command,
} from "lucide-react";
import { ProfileDropdown } from "./ProfileDropdown";
import { HelpButton } from "@/components/help";
import { DialerQuickAccess } from "@/components/dialer/DialerQuickAccess";
import { NotificationsDropdown } from "./NotificationsDropdown";

import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { MarketplaceSearchBar } from "@/components/marketplace-deals/MarketplaceSearchBar";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  onMenuClick: () => void;
  breadcrumbs?: Breadcrumb[];
  onOpenCommandPalette?: () => void;
}


export function AppHeader({ onMenuClick, breadcrumbs, onOpenCommandPalette }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8 || (document.querySelector('main')?.scrollTop ?? 0) > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    const main = document.querySelector('main');
    main?.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      main?.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // Sync search query from URL params
  // Sync search query from URL params
  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get("address") || searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = React.useState(urlQuery);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("address") || params.get("search") || "";
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [location.search]);
  
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  // Show marketplace-specific buttons only on /marketplace routes
  const isMarketplacePage = location.pathname.startsWith("/marketplace");
  const isIntelPage = location.pathname.startsWith("/intel");

  // On intel page, show "Listings" badge; everywhere else show "Intel" badge
  const defaultSearchMode = isIntelPage ? "intel" : "listings" as const;

  // Detect if input looks like a full address (starts with a number)

  // Detect if input looks like a full address (starts with a number)
  const isFullAddress = (input: string) => /^\d+\s/.test(input.trim());

  const handleAddressSelect = (address: string, placeId?: string, coords?: { lat: number; lng: number; bbox?: [string, string, string, string] }) => {
    if (!address.trim()) return;
    const query = address.trim();

    // Full address → property analysis
    if (isFullAddress(query)) {
      navigate(`/market-analyzer?tab=deals&address=${encodeURIComponent(query)}`);
      setSearchQuery("");
      return;
    }

    const params = new URLSearchParams({ address: query });
    if (coords) {
      params.set('lat', coords.lat.toString());
      params.set('lng', coords.lng.toString());
      if (coords.bbox) params.set('bbox', coords.bbox.join(','));
    }

    // Context-aware routing: Intel page → intel results, everywhere else → marketplace listings
    if (isIntelPage) {
      navigate(`/intel?${params.toString()}`);
    } else {
      navigate(`/marketplace?${params.toString()}`);
    }
    setSearchQuery("");
  };

  const handleModeSwitch = (mode: "listings" | "intel") => {
    const query = searchQuery.trim();
    if (mode === "intel") {
      // Badge clicked to go to Intel
      navigate(query ? `/intel?address=${encodeURIComponent(query)}` : "/intel");
    } else {
      // Badge clicked to go to Listings
      navigate(query ? `/marketplace?address=${encodeURIComponent(query)}` : "/marketplace");
    }
    setSearchQuery("");
  };

  return (
    <header className={cn(
      "h-14 flex items-center gap-2 px-3 sm:px-4 lg:px-6 sticky top-0 z-30 transition-all duration-300",
      isScrolled
        ? "bg-background/85 backdrop-blur-md border-b border-border/50 shadow-sm header-frosted dark:bg-[hsl(222_47%_6%_/_0.85)] dark:border-white/5"
        : "bg-background border-b border-border/30"
    )}>
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-content-secondary hover:text-content hover:bg-surface-secondary rounded-md transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search with Address Autocomplete */}
      {isMarketplacePage ? (
        <MarketplaceSearchBar
          className="hidden md:block flex-1 min-w-[240px] max-w-md"
          onLocationSelect={(loc) => {
            const params = new URLSearchParams({
              address: loc.displayName,
              lat: loc.lat.toString(),
              lng: loc.lng.toString(),
            });
            if (loc.bbox) params.set("bbox", loc.bbox.join(","));
            navigate(`/marketplace?${params.toString()}`);
          }}
        />
      ) : (
        <AddressAutocomplete
          value={searchQuery}
          onChange={setSearchQuery}
          onSelect={handleAddressSelect}
          className="hidden md:block flex-1 min-w-[240px] max-w-md"
          showModeBadge
          defaultMode={defaultSearchMode}
          onModeSwitch={handleModeSwitch}
        />
      )}

      {/* Cmd+K hint */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 bg-surface-secondary hover:bg-surface-tertiary transition-colors text-xs text-content-secondary"
      >
        <Command className="h-3 w-3" />
        <span>K</span>
      </button>

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
        <DropdownMenuContent className="w-40 bg-background">
          <DropdownMenuItem onClick={() => navigate("/properties/new")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/contacts?add=buyer")}>
            <User className="h-4 w-4 mr-2" />
            Buyer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/contacts?add=contractor")}>
            <Hammer className="h-4 w-4 mr-2" />
            Vendor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Buy Box Button - Marketplace pages */}
      {isMarketplacePage && (
        <Button
          size="sm"
          variant="outline"
          className="hidden sm:flex gap-1.5 border-2 border-primary"
          onClick={() => navigate("/marketplace/buy-box")}
        >
          <Home className="h-4 w-4" />
          <span>Buy Box</span>
        </Button>
      )}


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
        <DropdownMenuContent align="end" className="w-40 bg-background">
          <DropdownMenuItem onClick={() => navigate("/properties/new")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/contacts?add=buyer")}>
            <User className="h-4 w-4 mr-2" />
            Buyer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/contacts?add=contractor")}>
            <Hammer className="h-4 w-4 mr-2" />
            Vendor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TooltipProvider delayDuration={0}>
        {/* Calendar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-content-secondary hover:text-content"
              onClick={() => navigate("/calendar")}
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Calendar</p></TooltipContent>
        </Tooltip>

        {/* Dialer Quick Access */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span><DialerQuickAccess /></span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Dialer</p></TooltipContent>
        </Tooltip>

        {/* Help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span><HelpButton variant="icon" /></span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Help & Support</p></TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span><NotificationsDropdown /></span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Notifications</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User Dropdown */}
      <ProfileDropdown />
    </header>
  );
}
