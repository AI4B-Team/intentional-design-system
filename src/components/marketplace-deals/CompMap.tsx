import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface CompMarker {
  id: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  salePrice: number;
  distanceMiles: number;
  quality: "excellent" | "good";
  latitude: number;
  longitude: number;
}

interface CompMapProps {
  subjectLat: number;
  subjectLng: number;
  subjectAddress: string;
  subjectPrice: number;
  comps: CompMarker[];
}

// Custom marker icons
const createCustomIcon = (color: string, label?: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
      ">${label || ""}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const subjectIcon = createCustomIcon("#10b981", "S");
const excellentCompIcon = createCustomIcon("#22c55e", "");
const goodCompIcon = createCustomIcon("#f59e0b", "");

export function CompMap({
  subjectLat,
  subjectLng,
  subjectAddress,
  subjectPrice,
  comps,
}: CompMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[250px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="h-[250px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[subjectLat, subjectLng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Subject Property Marker */}
        <Marker position={[subjectLat, subjectLng]} icon={subjectIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">Subject Property</p>
              <p className="text-xs text-muted-foreground">{subjectAddress}</p>
              <p className="text-sm font-medium text-primary mt-1">
                ${subjectPrice.toLocaleString()}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Comp Markers */}
        {comps.map((comp) => (
          <Marker
            key={comp.id}
            position={[comp.latitude, comp.longitude]}
            icon={comp.quality === "excellent" ? excellentCompIcon : goodCompIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm">{comp.address}</p>
                <p className="text-xs text-muted-foreground">
                  {comp.beds} bd • {comp.baths} ba • {comp.sqft.toLocaleString()} sqft
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">
                    ${comp.salePrice.toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {comp.distanceMiles} mi
                  </Badge>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 1 Mile Radius Circle */}
        <Circle
          center={[subjectLat, subjectLng]}
          radius={1609}
          pathOptions={{
            color: "hsl(142, 76%, 36%)",
            fillColor: "hsl(142, 76%, 36%)",
            fillOpacity: 0.05,
            weight: 2,
            dashArray: "5, 5",
          }}
        />
      </MapContainer>
    </div>
  );
}
