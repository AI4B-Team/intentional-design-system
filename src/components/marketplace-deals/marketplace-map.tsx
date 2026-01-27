import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layers, ChevronDown, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarketplaceDeal } from "@/hooks/useMockDeals";

interface MarketplaceMapProps {
  deals: MarketplaceDeal[];
}

export function MarketplaceMap({ deals }: MarketplaceMapProps) {
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [isMapReady, setIsMapReady] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: React.ComponentType<any>;
    TileLayer: React.ComponentType<any>;
    Marker: React.ComponentType<any>;
    Popup: React.ComponentType<any>;
    L: typeof import("leaflet");
  } | null>(null);

  // Center of Florida
  const defaultCenter: [number, number] = [27.9944, -81.7603];

  // Dynamically load leaflet and react-leaflet
  useEffect(() => {
    let mounted = true;

    const loadMap = async () => {
      try {
        // Import leaflet CSS first
        await import("leaflet/dist/leaflet.css");
        
        // Import leaflet and react-leaflet
        const [leaflet, reactLeaflet] = await Promise.all([
          import("leaflet"),
          import("react-leaflet"),
        ]);

        if (mounted) {
          setMapComponents({
            MapContainer: reactLeaflet.MapContainer,
            TileLayer: reactLeaflet.TileLayer,
            Marker: reactLeaflet.Marker,
            Popup: reactLeaflet.Popup,
            L: leaflet.default,
          });
          setIsMapReady(true);
        }
      } catch (error) {
        console.error("Failed to load map components:", error);
      }
    };

    loadMap();

    return () => {
      mounted = false;
    };
  }, []);

  // Create price marker icon
  const createPriceIcon = (price: number) => {
    if (!MapComponents?.L) return undefined;
    
    const formattedPrice = price >= 1000000 
      ? `${(price / 1000000).toFixed(1)}M` 
      : `${Math.round(price / 1000)}K`;
    
    return MapComponents.L.divIcon({
      className: "custom-price-marker",
      html: `<div class="price-marker">${formattedPrice}</div>`,
      iconSize: [60, 28],
      iconAnchor: [30, 28],
    });
  };

  // Loading state
  if (!isMapReady || !MapComponents) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <MapPin className="h-10 w-10 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <div className="relative h-full">
      {/* Map Type Toggle */}
      <div className="absolute top-3 left-3 z-[1000]">
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
      <div className="absolute top-3 right-3 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white shadow-md gap-2">
              <Layers className="h-4 w-4" />
              Overlays
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background">
            <DropdownMenuItem>County Lines</DropdownMenuItem>
            <DropdownMenuItem>Zip Codes</DropdownMenuItem>
            <DropdownMenuItem>School Districts</DropdownMenuItem>
            <DropdownMenuItem>Flood Zones</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={7}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            mapType === "satellite"
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        {deals.map((deal) => (
          <Marker
            key={deal.id}
            position={[deal.lat, deal.lng]}
            icon={createPriceIcon(deal.price)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <img
                  src={deal.imageUrl}
                  alt={deal.address}
                  className="w-full h-24 object-cover rounded-md mb-2"
                />
                <p className="font-semibold text-sm">{deal.address}</p>
                <p className="text-xs text-muted-foreground">
                  {deal.city}, {deal.state} {deal.zip}
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  ${deal.price.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deal.beds} bd | {deal.baths} ba | {deal.sqft.toLocaleString()} sqft
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom CSS for price markers */}
      <style>{`
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
