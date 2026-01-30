import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Layers, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MarketplaceDeal } from "@/hooks/useMockDeals";
import { cn } from "@/lib/utils";

interface MarketplaceMapProps {
  deals: MarketplaceDeal[];
}

const heatMapOptions = [
  "Property Value By County",
  "Property Value By Zip",
  "Flips By County",
  "Flips By Zip",
  "Signal AI By County",
  "Signal AI By Zip",
];

const parcelMapOptions = [
  "All Parcels",
  "AI Retail Score",
  "AI Rental Score",
  "AI Wholesale Score",
  "Cash Buyer",
  "Vacant",
  "Loan to Value",
  "Square Footage",
  "Lot Size",
  "Last Sale Date",
  "Last Sale Price",
];

export function MarketplaceMap({ deals }: MarketplaceMapProps) {
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [overlaysOpen, setOverlaysOpen] = useState(false);
  
  // Overlay states
  const [heatMapsEnabled, setHeatMapsEnabled] = useState(false);
  const [selectedHeatMap, setSelectedHeatMap] = useState<string | null>(null);
  const [parcelMapsEnabled, setParcelMapsEnabled] = useState(false);
  const [selectedParcelMap, setSelectedParcelMap] = useState<string>("All Parcels");
  const [showLegend, setShowLegend] = useState(false);
  const [showLocationOutline, setShowLocationOutline] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  
  const loadedRef = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const defaultCenter: [number, number] = [27.9944, -81.7603];

  useEffect(() => {
    if (loadedRef.current || !mapContainerRef.current) return;
    loadedRef.current = true;

    const initMap = async () => {
      try {
        // Import leaflet CSS
        await import("leaflet/dist/leaflet.css");
        
        // Import leaflet
        const L = (await import("leaflet")).default;

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create map instance
        if (mapContainerRef.current && !mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current).setView(defaultCenter, 7);
          mapInstanceRef.current = { map, L };

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Add markers for deals
          deals.forEach((deal) => {
            const formattedPrice = deal.price >= 1000000 
              ? `${(deal.price / 1000000).toFixed(1)}M` 
              : `${Math.round(deal.price / 1000)}K`;

            const priceIcon = L.divIcon({
              className: "custom-price-marker",
              html: `<div class="price-marker">${formattedPrice}</div>`,
              iconSize: [60, 28],
              iconAnchor: [30, 28],
            });

            const marker = L.marker([deal.lat, deal.lng], { icon: priceIcon }).addTo(map);
            
            marker.bindPopup(`
              <div class="p-2 min-w-[200px]">
                <img src="${deal.imageUrl}" alt="${deal.address}" class="w-full h-24 object-cover rounded-md mb-2" />
                <p class="font-semibold text-sm">${deal.address}</p>
                <p class="text-xs text-gray-500">${deal.city}, ${deal.state} ${deal.zip}</p>
                <p class="text-lg font-bold text-emerald-600 mt-1">$${deal.price.toLocaleString()}</p>
                <p class="text-xs text-gray-500">${deal.beds} bd | ${deal.baths} ba | ${deal.sqft.toLocaleString()} sqft</p>
              </div>
            `);
          });

          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load map:", error);
        setHasError(true);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [deals]);

  // Update tile layer when map type changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const { map, L } = mapInstanceRef.current;
    
    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer based on mapType
    const tileUrl = mapType === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }, [mapType]);

  if (hasError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <MapPin className="h-10 w-10" />
          <p className="text-sm">Failed to load map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full z-0">
      {/* Map Type Toggle */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <button
            onClick={() => setMapType("map")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mapType === "map"
                ? "bg-white text-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType("satellite")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l ${
              mapType === "satellite"
                ? "bg-white text-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Overlays Dropdown */}
      <div className="absolute top-3 right-3 z-10">
        <Popover open={overlaysOpen} onOpenChange={setOverlaysOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-white shadow-md gap-2">
              <Layers className="h-4 w-4" />
              Overlays
              {overlaysOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-white p-0 shadow-lg" align="end">
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Heat Maps Section */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Heat Maps</span>
                  <Checkbox 
                    checked={heatMapsEnabled}
                    onCheckedChange={(checked) => {
                      setHeatMapsEnabled(!!checked);
                      if (!checked) setSelectedHeatMap(null);
                    }}
                  />
                </div>
                <div className="space-y-1.5 pl-2">
                  {heatMapOptions.map((option) => (
                    <div key={option} className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground cursor-pointer">{option}</Label>
                      <input
                        type="radio"
                        name="heatMap"
                        checked={selectedHeatMap === option}
                        onChange={() => {
                          setSelectedHeatMap(option);
                          setHeatMapsEnabled(true);
                        }}
                        className="h-4 w-4 text-primary border-muted-foreground"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Parcel Maps Section */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Parcel Maps</span>
                  <Checkbox 
                    checked={parcelMapsEnabled}
                    onCheckedChange={(checked) => setParcelMapsEnabled(!!checked)}
                  />
                </div>
                <div className="space-y-1.5 pl-2">
                  {parcelMapOptions.map((option) => (
                    <div key={option} className="flex items-center justify-between">
                      <Label 
                        className={cn(
                          "text-sm cursor-pointer",
                          selectedParcelMap === option ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        {option}
                      </Label>
                      <input
                        type="radio"
                        name="parcelMap"
                        checked={selectedParcelMap === option}
                        onChange={() => {
                          setSelectedParcelMap(option);
                          setParcelMapsEnabled(true);
                        }}
                        className="h-4 w-4 text-primary border-muted-foreground accent-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Options */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Legend</Label>
                  <Checkbox 
                    checked={showLegend}
                    onCheckedChange={(checked) => setShowLegend(!!checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Location outline</Label>
                  <Checkbox 
                    checked={showLocationOutline}
                    onCheckedChange={(checked) => setShowLocationOutline(!!checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Clusters</Label>
                  <Checkbox 
                    checked={showClusters}
                    onCheckedChange={(checked) => setShowClusters(!!checked)}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Loading state overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-[5]">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <MapPin className="h-10 w-10 animate-pulse" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Custom CSS for price markers and zoom controls */}
      <style>{`
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-pane {
          z-index: 0 !important;
        }
        .leaflet-tile-pane {
          z-index: 0 !important;
        }
        .leaflet-overlay-pane {
          z-index: 1 !important;
        }
        .leaflet-shadow-pane {
          z-index: 2 !important;
        }
        .leaflet-marker-pane {
          z-index: 3 !important;
        }
        .leaflet-tooltip-pane {
          z-index: 4 !important;
        }
        .leaflet-popup-pane {
          z-index: 5 !important;
        }
        .leaflet-control {
          z-index: 10 !important;
        }
        /* Move zoom controls below the Map/Satellite toggle */
        .leaflet-top.leaflet-left {
          top: 56px !important;
        }
        .leaflet-control-zoom {
          margin-top: 0 !important;
          margin-left: 12px !important;
        }
        .price-marker {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          text-align: center;
        }
        .price-marker::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #16a34a;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
