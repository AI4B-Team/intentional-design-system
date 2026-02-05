import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, MapPin, Loader2 } from "lucide-react";

// Type declaration for Google Maps API on window
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string;
                types?: string[];
                componentRestrictions?: { country: string };
              },
              callback: (
                predictions: Array<{
                  place_id: string;
                  description: string;
                  structured_formatting?: {
                    main_text: string;
                    secondary_text: string;
                  };
                }> | null,
                status: string
              ) => void
            ) => void;
          };
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
  }
}

interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, placeId?: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter an address, city, or ZIP for insights",
  className,
  inputClassName,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout>();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Fetch suggestions from Google Places API
  const fetchSuggestions = React.useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3 || !apiKey) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&components=country:us&key=${apiKey}`
      );
      
      // If CORS blocks the direct call, use the Places Service from the Maps JavaScript API
      // For now, we'll use a fallback to simulated suggestions based on query
      if (!response.ok) {
        throw new Error("API call failed");
      }
      
      const data = await response.json();
      
      if (data.predictions) {
        const formatted: AddressSuggestion[] = data.predictions.map((p: {
          place_id: string;
          description: string;
          structured_formatting: {
            main_text: string;
            secondary_text: string;
          };
        }) => ({
          placeId: p.place_id,
          description: p.description,
          mainText: p.structured_formatting.main_text,
          secondaryText: p.structured_formatting.secondary_text,
        }));
        setSuggestions(formatted);
      }
    } catch {
      // Fallback: Use the Google Places script if loaded in the page
      if (window.google?.maps?.places) {
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: query,
            types: ["address"],
            componentRestrictions: { country: "us" },
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const formatted: AddressSuggestion[] = predictions.map((p) => ({
                placeId: p.place_id,
                description: p.description,
                mainText: p.structured_formatting?.main_text || p.description,
                secondaryText: p.structured_formatting?.secondary_text || "",
              }));
              setSuggestions(formatted);
            } else {
              setSuggestions([]);
            }
          }
        );
      } else {
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

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
    onSelect(suggestion.description, suggestion.placeId);
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
      <div className="relative">
        <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex h-9 w-full rounded-small border-0 bg-surface-secondary pl-6 pr-8 text-body transition-all duration-150",
            "placeholder:text-content-tertiary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/20 focus-visible:bg-white",
            inputClassName
          )}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary animate-spin" />
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
