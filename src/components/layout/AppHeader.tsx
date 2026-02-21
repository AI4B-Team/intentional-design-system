import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { ProfileDropdown } from "./ProfileDropdown";
import { HelpButton } from "@/components/help";
import { DialerQuickAccess } from "@/components/dialer/DialerQuickAccess";
import { NotificationsDropdown } from "./NotificationsDropdown";

import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

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
  const { user } = useAuth();
  // Sync search query from URL params (but not on filter pages where chips handle it)
  const searchParams = new URLSearchParams(location.search);
  const isFilterPageInit = location.pathname.startsWith("/marketplace") || location.pathname.startsWith("/intel");
  const urlQuery = isFilterPageInit ? "" : (searchParams.get("address") || searchParams.get("search") || "");
  const [searchQuery, setSearchQuery] = React.useState(urlQuery);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("address") || params.get("search") || "";
    // Only sync from URL if not on marketplace/intel (where search is a filter, not the header field)
    const isFilterPage = location.pathname.startsWith("/marketplace") || location.pathname.startsWith("/intel");
    if (q && q !== searchQuery && !isFilterPage) {
      setSearchQuery(q);
    }
  }, [location.search]);
  
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  // Show marketplace-specific buttons only on /marketplace routes
  const isMarketplacePage = location.pathname.startsWith("/marketplace");
  const isIntelPage = location.pathname.startsWith("/intel");
  const isFilterPage = isMarketplacePage || isIntelPage;

  // Active address chip from URL (only on filter pages)
  const activeAddress = isFilterPage ? (searchParams.get("address") || searchParams.get("search") || "") : "";

  const handleClearChip = () => {
    // Remove address from URL
    const params = new URLSearchParams(location.search);
    params.delete("address");
    params.delete("search");
    navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // On intel page, show "Listings" badge; everywhere else show "Intel" badge
  const defaultSearchMode = isIntelPage ? "intel" : "listings" as const;

  // Detect if input looks like a full address (starts with a number)

  // Detect if input looks like a full address (starts with a number)
  const isFullAddress = (input: string) => /^\d+\s/.test(input.trim());

  const handleAddressSelect = (address: string, placeId?: string) => {
    if (!address.trim()) return;
    const query = address.trim();

    // Full address → property analysis
    if (isFullAddress(query)) {
      navigate(`/market-analyzer?tab=deals&address=${encodeURIComponent(query)}`);
      setSearchQuery("");
      return;
    }

    // Context-aware routing: Intel page → intel results, everywhere else → marketplace listings
    if (isIntelPage) {
      navigate(`/intel?address=${encodeURIComponent(query)}`);
    } else {
      navigate(`/marketplace?address=${encodeURIComponent(query)}`);
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
    <header className="sticky top-0 z-50 h-16 bg-white/95 backdrop-blur border-b border-border flex items-center px-4 lg:px-6 gap-2">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-content-secondary hover:text-content hover:bg-surface-secondary rounded-md transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search with Address Autocomplete */}
      <AddressAutocomplete
        value={searchQuery}
        onChange={setSearchQuery}
        onSelect={handleAddressSelect}
        className="hidden md:block flex-1 min-w-[240px] max-w-md"
        showModeBadge
        defaultMode={defaultSearchMode}
        onModeSwitch={handleModeSwitch}
        activeChip={activeAddress || undefined}
        onClearChip={activeAddress ? handleClearChip : undefined}
      />

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

      {/* Dialer Quick Access */}
      <DialerQuickAccess />

      {/* Help */}
      <HelpButton variant="icon" />

      {/* Notifications */}
      <NotificationsDropdown />

      {/* User Dropdown */}
      <ProfileDropdown />
    </header>
  );
}
