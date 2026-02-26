import React from "react";
import { Search, MapPin, Loader2, X, ChevronDown, Star, Clock, Zap, TrendingUp, BarChart3, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationResult {
  lat: number;
  lng: number;
  bbox?: [string, string, string, string];
  displayName: string;
  mainText: string;
  secondaryText: string;
}

interface MarketplaceSearchBarProps {
  onLocationSelect: (loc: LocationResult) => void;
  onModeSwitch?: (mode: "listings" | "intel") => void;
  onQueryChange?: (query: string) => void;
  defaultMode?: "listings" | "intel";
  className?: string;
  placeholder?: string;
}

export function MarketplaceSearchBar({ onLocationSelect, onModeSwitch, onQueryChange, defaultMode = "listings", className, placeholder }: MarketplaceSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [savedDropdownOpen, setSavedDropdownOpen] = React.useState(false);
  const [savedTab, setSavedTab] = React.useState<"saved" | "recent" | "quick" | "popular">("saved");
  const debounceRef = React.useRef<NodeJS.Timeout>();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = React.useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=us&addressdetails=1&limit=6&dedupe=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en-US,en" } });
      const data = await res.json();
      setSuggestions(data || []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    onQueryChange?.(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (r: any) => {
    const a = r.address || {};
    const main = a.house_number && a.road
      ? `${a.house_number} ${a.road}`
      : a.road || a.suburb || a.city || a.county || r.display_name.split(",")[0];
    const secondary = r.display_name
      .replace(", United States", "")
      .split(",")
      .slice(1)
      .join(",")
      .trim();

    const displayText = r.display_name.replace(", United States", "");
    setQuery(displayText);
    setShowSuggestions(false);
    onLocationSelect({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      bbox: r.boundingbox,
      displayName: displayText,
      mainText: main,
      secondaryText: secondary,
    });
  };

  const handleDropdownSelect = async (text: string) => {
    setQuery(text);
    setSavedDropdownOpen(false);
    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=us&addressdetails=1&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en-US,en" } });
      const data = await res.json();
      if (data && data.length > 0) {
        const r = data[0];
        const a = r.address || {};
        const main = a.city || a.county || r.display_name.split(",")[0];
        const secondary = r.display_name.replace(", United States", "").split(",").slice(1).join(",").trim();
        onLocationSelect({
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          bbox: r.boundingbox,
          displayName: r.display_name.replace(", United States", ""),
          mainText: main,
          secondaryText: secondary,
        });
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const tabs = [
    { key: "saved" as const, label: "Saved", icon: Star },
    { key: "recent" as const, label: "Recent", icon: Clock },
    { key: "quick" as const, label: "Quick", icon: Zap },
    { key: "popular" as const, label: "Markets", icon: MapPin },
  ];

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="flex items-center h-9 rounded-lg border border-border/60 bg-surface-secondary overflow-hidden">
        <Search className="ml-2.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search city, ZIP, county or address..."}
          className="flex-1 h-full px-2 text-sm outline-none bg-transparent placeholder:text-muted-foreground text-foreground"
          autoComplete="off"
        />
        {/* Intel / Listings mode badge */}
        {onModeSwitch && query.trim().length >= 2 && !/^\d+\s/.test(query.trim()) && (
          <button
            onClick={() => onModeSwitch(defaultMode === "intel" ? "listings" : "intel")}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 mr-1",
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

        {isLoading && <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
        {query && !isLoading && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); onQueryChange?.(""); }}
            className="mr-1.5 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Saved/Recent/Quick/Markets dropdown */}
        <Popover open={savedDropdownOpen} onOpenChange={setSavedDropdownOpen}>
          <PopoverTrigger asChild>
            <button className="h-full px-2 border-l border-border/40 hover:bg-muted/50 transition-colors flex items-center">
              <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", savedDropdownOpen && "rotate-180")} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0 bg-card border border-border shadow-xl z-[200]"
            align="end"
            sideOffset={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Tab bar */}
            <div className="flex border-b border-border/60 bg-muted/30">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSavedTab(tab.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                    savedTab === tab.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="max-h-64 overflow-y-auto">
              {savedTab === "saved" && (
                <div className="p-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">Saved Searches</span>
                    <button className="text-xs text-primary hover:underline">+ New</button>
                  </div>
                  {[
                    { name: "Tampa Distressed Under $200K", count: 43 },
                    { name: "Atlanta High Equity 3+ Beds", count: 127 },
                    { name: "Orlando Vacant Lots", count: 18 },
                  ].map((saved) => (
                    <button
                      key={saved.name}
                      onClick={() => handleDropdownSelect(saved.name)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/50 rounded-md transition-colors text-left"
                    >
                      <Star className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                      <span className="flex-1 truncate">{saved.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {saved.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {savedTab === "recent" && (
                <div className="p-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                  </div>
                  {["Jacksonville, FL", "28205", "Harris County, TX"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleDropdownSelect(s)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/50 rounded-md transition-colors text-left"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {savedTab === "quick" && (
                <div className="p-1">
                  {[
                    { label: "Foreclosures Near Me", icon: Zap, desc: "Pre-foreclosure & REO" },
                    { label: "Vacant Properties", icon: MapPin, desc: "Unoccupied homes" },
                    { label: "High Equity Leads", icon: TrendingUp, desc: "60%+ equity owners" },
                    { label: "Absentee Owners", icon: MapPin, desc: "Out-of-state landlords" },
                  ].map((quick) => (
                    <button
                      key={quick.label}
                      onClick={() => handleDropdownSelect(quick.label)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-md transition-colors text-left"
                    >
                      <quick.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{quick.label}</p>
                        <p className="text-xs text-muted-foreground">{quick.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {savedTab === "popular" && (
                <div className="p-1">
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
                      onClick={() => handleDropdownSelect(market.name)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/50 rounded-md transition-colors text-left"
                    >
                      <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="flex-1">{market.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {market.listings} listings · {market.buyers} buyers
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border/60 overflow-hidden max-h-72 overflow-y-auto z-50">
          {suggestions.map((r: any, i: number) => {
            const a = r.address || {};
            const main = a.house_number && a.road
              ? `${a.house_number} ${a.road}`
              : a.road || a.suburb || a.city || a.county || r.display_name.split(",")[0];
            const secondary = r.display_name
              .replace(", United States", "")
              .split(",")
              .slice(1)
              .join(",")
              .trim();
            return (
              <button
                key={r.place_id || i}
                onClick={() => handleSelect(r)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 text-left transition-colors"
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{main}</p>
                  <p className="text-xs text-muted-foreground truncate">{secondary}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
