import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, MapPin, Loader2, BarChart3, Store, ChevronDown, Heart, Clock, Zap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
  bbox?: [string, string, string, string];
  type?: string;
}

type SearchMode = "listings" | "intel";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, placeId?: string, coords?: { lat: number; lng: number; bbox?: [string, string, string, string] }) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  defaultMode?: SearchMode;
  onModeSwitch?: (mode: SearchMode) => void;
  showModeBadge?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search address, city, state or zip for insights",
  className,
  inputClassName,
  defaultMode = "listings",
  onModeSwitch,
  showModeBadge = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [savedDropdownOpen, setSavedDropdownOpen] = React.useState(false);
  const [savedTab, setSavedTab] = React.useState<"saved" | "recent" | "quick" | "popular">("saved");
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout>();

  const handleDropdownSelect = (text: string) => {
    onChange(text);
    onSelect(text);
    setSavedDropdownOpen(false);
  };

  // Fetch suggestions from Nominatim (OpenStreetMap)
  const fetchSuggestions = React.useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&addressdetails=1&limit=6&dedupe=1`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'en-US,en' }
      });
      const data = await response.json();
      const formatted: AddressSuggestion[] = data
        .filter((r: any) => r.lat && r.lon)
        .map((r: any) => {
          const a = r.address || {};
          const main = a.house_number && a.road
            ? `${a.house_number} ${a.road}`
            : a.road || a.suburb || a.city || a.county || r.display_name.split(',')[0];
          const secondary = r.display_name
            .split(',')
            .slice(1)
            .join(',')
            .trim()
            .replace(/, United States$/, '');
          return {
            placeId: r.place_id?.toString() || r.osm_id?.toString() || Math.random().toString(),
            description: r.display_name.replace(', United States', ''),
            mainText: main,
            secondaryText: secondary,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            bbox: r.boundingbox as [string, string, string, string] | undefined,
            type: r.type || r.class,
          };
        });
      setSuggestions(formatted);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, fetchSuggestions]);

  // Handle click outside to close suggestions
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        onSelect(value);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        } else {
          onSelect(value);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description);
    onSelect(
      suggestion.description,
      suggestion.placeId,
      suggestion.lat != null ? { lat: suggestion.lat, lng: suggestion.lng!, bbox: suggestion.bbox } : undefined
    );
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (val: string) => {
    onChange(val);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex h-9 w-full rounded-small border-0 bg-surface-secondary pl-8 text-body transition-all duration-150",
            "placeholder:text-content-tertiary",
            "focus-visible:outline-none focus-visible:ring-0 focus-visible:bg-white",
            showModeBadge && onModeSwitch && value.trim().length >= 2 && !/^\d+\s/.test(value.trim())
              ? "pr-[7.5rem]"
              : "pr-10",
            inputClassName
          )}
          autoComplete="off"
        />
        {/* Mode badge - only show for city/ZIP input (not full addresses starting with a number) */}
        {showModeBadge && onModeSwitch && value.trim().length >= 2 && !/^\d+\s/.test(value.trim()) && (
          <button
            type="button"
            onClick={() => onModeSwitch(defaultMode === "intel" ? "listings" : "intel")}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md text-tiny font-medium transition-colors",
              "right-10",
              defaultMode === "intel"
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            )}
          >
            {defaultMode === "intel" ? (
              <><Store className="h-3 w-3" />Listings</>
            ) : (
              <><BarChart3 className="h-3 w-3" />Intel</>
            )}
          </button>
        )}
        {/* Saved searches dropdown trigger */}
        <Popover open={savedDropdownOpen} onOpenChange={setSavedDropdownOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors z-10"
            >
              <ChevronDown className={cn("h-4 w-4 text-content-tertiary transition-transform", savedDropdownOpen && "rotate-180")} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 bg-white border-2 border-border shadow-xl z-[200] rounded-lg"
            align="center"
            style={{ width: wrapperRef.current?.offsetWidth ? `${wrapperRef.current.offsetWidth}px` : '400px' }}
            sideOffset={6}
            alignOffset={(() => {
              // The trigger is the small chevron button on the right; shift the popover left
              // so it centers under the full search wrapper instead.
              if (!wrapperRef.current) return 0;
              const wrapperRect = wrapperRef.current.getBoundingClientRect();
              const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
              // Find the trigger button center (chevron is ~12px from right edge of wrapper)
              const triggerCenter = wrapperRect.right - 12;
              return Math.round(wrapperCenter - triggerCenter);
            })()}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Tab bar */}
            <div className="flex border-b border-border">
              {([
                { key: "saved" as const, label: "Saved", icon: Heart },
                { key: "recent" as const, label: "Recent", icon: Clock },
                { key: "quick" as const, label: "Quick", icon: Zap },
                { key: "popular" as const, label: "Markets", icon: MapPin },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors",
                    savedTab === tab.key
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => setSavedTab(tab.key)}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="max-h-[320px] overflow-y-auto">
              {savedTab === "saved" && (
                <div className="py-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saved Searches</span>
                    <button
                      type="button"
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      + New
                    </button>
                  </div>
                  {[
                    { name: "Tampa Distressed Under $200K", count: 43 },
                    { name: "Atlanta High Equity 3+ Beds", count: 127 },
                    { name: "Orlando Vacant Lots", count: 18 },
                  ].map((saved) => (
                    <button
                      key={saved.name}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => handleDropdownSelect(saved.name)}
                    >
                      <Heart className="h-3.5 w-3.5 flex-shrink-0 fill-red-400 text-red-400" />
                      <span className="flex-1 truncate">{saved.name}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium bg-muted text-muted-foreground">
                        {saved.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {savedTab === "recent" && (
                <div className="py-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Searches</span>
                  </div>
                  {[
                    "Jacksonville, FL",
                    "28205",
                    "Harris County, TX",
                  ].map((search) => (
                    <button
                      key={search}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => handleDropdownSelect(search)}
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      {search}
                    </button>
                  ))}
                </div>
              )}

              {savedTab === "quick" && (
                <div className="py-1">
                  {[
                    { label: "Foreclosures Near Me", icon: Zap, desc: "Pre-foreclosure & REO" },
                    { label: "Vacant Properties", icon: MapPin, desc: "Unoccupied homes" },
                    { label: "High Equity Leads", icon: TrendingUp, desc: "60%+ equity owners" },
                    { label: "Absentee Owners", icon: MapPin, desc: "Out-of-state landlords" },
                  ].map((quick) => (
                    <button
                      key={quick.label}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2.5"
                      onClick={() => handleDropdownSelect(quick.label)}
                    >
                      <quick.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">{quick.label}</div>
                        <div className="text-[11px] text-muted-foreground">{quick.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {savedTab === "popular" && (
                <div className="py-1">
                  {[
                    { name: "Tampa, FL", listings: 342, buyers: 128 },
                    { name: "Houston, TX", listings: 518, buyers: 203 },
                    { name: "Atlanta, GA", listings: 425, buyers: 176 },
                    { name: "Phoenix, AZ", listings: 389, buyers: 154 },
                    { name: "Jacksonville, FL", listings: 267, buyers: 98 },
                    { name: "Dallas, TX", listings: 471, buyers: 189 },
                    { name: "Orlando, FL", listings: 312, buyers: 134 },
                    { name: "Charlotte, NC", listings: 198, buyers: 87 },
                  ].map((market) => (
                    <button
                      key={market.name}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-3"
                      onClick={() => handleDropdownSelect(market.name.split(",")[0].trim())}
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 font-medium">{market.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {market.listings} listings · {market.buyers} buyers
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-medium shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className={cn(
                "w-full px-3 py-2.5 text-left flex items-start gap-2.5 transition-colors",
                "hover:bg-surface-secondary",
                index === selectedIndex && "bg-surface-secondary"
              )}
            >
              <MapPin className="h-4 w-4 text-content-tertiary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-small font-medium text-content truncate">
                  {suggestion.mainText}
                </p>
                <p className="text-tiny text-content-secondary truncate">
                  {suggestion.secondaryText}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
