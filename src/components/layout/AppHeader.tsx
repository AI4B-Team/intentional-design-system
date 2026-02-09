import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { useMockDeals } from "@/hooks/useMockDeals";
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
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  // Show marketplace-specific buttons only on /marketplace routes
  const isMarketplacePage = location.pathname.startsWith("/marketplace");

  // Get all deals for search matching
  const { deals } = useMockDeals({
    filters: { address: "", leadType: "all", homeTypes: [], priceMin: "", priceMax: "", bedsMin: "", bathsMin: "" },
    sortBy: "newest",
    page: 1,
    perPage: 100,
  });

  const handleAddressSelect = (address: string, placeId?: string) => {
    if (!address.trim()) return;
    
    const query = address.trim().toLowerCase();
    
    // Find a matching deal by address, city, or zip
    const matchedDeal = deals.find((deal) => {
      const fullAddress = `${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}`.toLowerCase();
      return (
        deal.address.toLowerCase().includes(query) ||
        fullAddress.includes(query) ||
        deal.city.toLowerCase().includes(query) ||
        deal.zip.includes(query)
      );
    });
    
    if (matchedDeal) {
      // Navigate to the property detail page
      navigate(`/marketplace/deal/${matchedDeal.id}`);
      setSearchQuery("");
    } else {
      // Show toast if no match found
      toast.info("No matching property found", {
        description: "Try searching with a different address, city, or ZIP code.",
      });
    }
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
        className="hidden md:block flex-1 max-w-md"
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
