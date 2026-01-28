import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Locate, Plus, Minus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface D4DMapViewProps {
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  routeCoordinates: Array<{ lat: number; lng: number; timestamp: string }>;
  isPaused: boolean;
  taggedProperties?: Array<{ lat: number; lng: number; id: string }>;
}

export function D4DMapView({
  currentLocation,
  routeCoordinates,
  isPaused,
  taggedProperties = []
}: D4DMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [zoom, setZoom] = useState(16);

  // Since we can't use Google Maps without an API key, we'll show a placeholder
  // In production, this would integrate with Leaflet or Google Maps
  const hasLocation = currentLocation.latitude !== null && currentLocation.longitude !== null;

  return (
    <div className="relative w-full h-full bg-muted">
      {/* Map Placeholder */}
      <div 
        ref={mapRef} 
        className={cn(
          "absolute inset-0 transition-all",
          isSatellite ? "bg-slate-800" : "bg-slate-200"
        )}
      >
        {/* Grid Pattern */}
        <div 
          className={cn(
            "absolute inset-0 opacity-20",
            isSatellite ? "bg-slate-700" : "bg-slate-300"
          )}
          style={{
            backgroundImage: `
              linear-gradient(to right, ${isSatellite ? '#475569' : '#94a3b8'} 1px, transparent 1px),
              linear-gradient(to bottom, ${isSatellite ? '#475569' : '#94a3b8'} 1px, transparent 1px)
            `,
            backgroundSize: `${zoom * 3}px ${zoom * 3}px`
          }}
        />

        {/* Center Message */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "text-center p-4 rounded-lg",
            isSatellite ? "bg-slate-900/80 text-white" : "bg-white/80 text-slate-800"
          )}>
            {hasLocation ? (
              <>
                <div className="relative mb-3">
                  {/* Pulsing location dot */}
                  <div className={cn(
                    "w-6 h-6 rounded-full mx-auto",
                    "bg-blue-500",
                    !isPaused && "animate-pulse"
                  )}>
                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                  </div>
                </div>
                <p className="font-mono text-sm">
                  {currentLocation.latitude?.toFixed(6)}, {currentLocation.longitude?.toFixed(6)}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {isPaused ? "Tracking paused" : "Tracking active"}
                </p>
                {routeCoordinates.length > 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    {routeCoordinates.length} route points recorded
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium">Acquiring GPS...</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Make sure location services are enabled
                </p>
              </>
            )}
          </div>
        </div>

        {/* Route Preview (simplified) */}
        {routeCoordinates.length > 1 && (
          <svg className="absolute inset-0 pointer-events-none opacity-50">
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={routeCoordinates.slice(-20).map((_, i) => 
                `${50 + i * 10 + Math.random() * 5},${100 + Math.sin(i) * 20 + Math.random() * 5}`
              ).join(' ')}
            />
          </svg>
        )}

        {/* Tagged Properties Markers */}
        {taggedProperties.map((prop, i) => (
          <div
            key={prop.id}
            className="absolute w-6 h-6 -ml-3 -mt-6 pointer-events-none"
            style={{
              left: `${30 + (i * 15) % 60}%`,
              top: `${20 + (i * 20) % 50}%`
            }}
          >
            <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg bg-card"
          onClick={() => setIsSatellite(!isSatellite)}
        >
          <Layers className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg bg-card"
          onClick={() => setZoom(z => Math.min(20, z + 1))}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg bg-card"
          onClick={() => setZoom(z => Math.max(10, z - 1))}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg bg-card"
        >
          <Locate className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
