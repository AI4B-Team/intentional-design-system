import React from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
  placeholder?: string;
}

export function MarketplaceSearchBar({ onLocationSelect, className, placeholder }: MarketplaceSearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

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
        {isLoading && <Loader2 className="mr-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
        {query && !isLoading && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); }}
            className="mr-1.5 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
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
