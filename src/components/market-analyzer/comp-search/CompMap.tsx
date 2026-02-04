import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { CompResult, SubjectProperty } from "./types";

interface CompMapProps {
  subject?: SubjectProperty | null;
  comps: CompResult[];
  selectedIds: string[];
  radiusMiles: number;
  onSelectComp: (id: string, selected: boolean) => void;
  onViewDetails: (comp: CompResult) => void;
}

// Subject marker (blue)
const subjectIcon = L.divIcon({
  className: "subject-marker",
  html: `
    <div style="
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="M12 2L2 9l10 7 10-7-10-7z"/>
        <path d="M2 17l10 7 10-7"/>
        <path d="M2 12l10 7 10-7"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Comp marker factory
function createCompIcon(isRecent: boolean, isSelected: boolean) {
  const bgColor = isSelected
    ? "#22c55e"
    : isRecent
    ? "#22c55e"
    : "#eab308";
  const borderColor = isSelected ? "#166534" : "white";

  return L.divIcon({
    className: "comp-marker",
    html: `
      <div style="
        background: ${bgColor};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        ${isSelected ? "transform: scale(1.2);" : ""}
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Component to fit bounds when data changes
function MapBoundsUpdater({
  subject,
  comps,
}: {
  subject?: SubjectProperty | null;
  comps: CompResult[];
}) {
  const map = useMap();

  React.useEffect(() => {
    if (!subject?.latitude || !subject?.longitude) return;

    const bounds = L.latLngBounds([]);
    bounds.extend([subject.latitude, subject.longitude]);

    comps.forEach((c) => {
      if (c.latitude && c.longitude) {
        bounds.extend([c.latitude, c.longitude]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, subject, comps]);

  return null;
}

export function CompMap({
  subject,
  comps,
  selectedIds,
  radiusMiles,
  onSelectComp,
  onViewDetails,
}: CompMapProps) {
  const defaultCenter: [number, number] = [30.2672, -97.7431]; // Austin, TX
  const center: [number, number] =
    subject?.latitude && subject?.longitude
      ? [subject.latitude, subject.longitude]
      : defaultCenter;

  const radiusMeters = radiusMiles * 1609.34;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater subject={subject} comps={comps} />

        {/* Radius circle */}
        {subject?.latitude && subject?.longitude && (
          <Circle
            center={[subject.latitude, subject.longitude]}
            radius={radiusMeters}
            pathOptions={{
              color: "hsl(var(--primary))",
              fillColor: "hsl(var(--primary))",
              fillOpacity: 0.1,
              weight: 2,
              dashArray: "5, 5",
            }}
          />
        )}

        {/* Subject marker */}
        {subject?.latitude && subject?.longitude && (
          <Marker position={[subject.latitude, subject.longitude]} icon={subjectIcon}>
            <Popup>
              <div className="text-small">
                <div className="font-semibold">{subject.address}</div>
                <div className="text-muted-foreground">Subject Property</div>
                <div className="mt-1">
                  {subject.beds}bd / {subject.baths}ba • {subject.sqft?.toLocaleString()} sqft
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Comp markers */}
        {comps.map((comp) => {
          if (!comp.latitude || !comp.longitude) return null;

          const isRecent =
            new Date(comp.saleDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const isSelected = selectedIds.includes(comp.id);

          return (
            <Marker
              key={comp.id}
              position={[comp.latitude, comp.longitude]}
              icon={createCompIcon(isRecent, isSelected)}
            >
              <Popup>
                <div className="text-small min-w-[180px]">
                  <div className="font-semibold">{comp.address}</div>
                  <div className="text-muted-foreground">
                    {comp.city}, {comp.state}
                  </div>
                  <div className="mt-2 font-semibold text-primary">
                    {formatCurrency(comp.salePrice)}
                  </div>
                  <div className="text-muted-foreground">
                    ${comp.pricePerSqft}/sqft • {comp.distance.toFixed(1)} mi
                  </div>
                  <div className="mt-1">
                    {comp.beds}bd / {comp.baths}ba • {comp.sqft?.toLocaleString()} sqft
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                      onClick={() => onViewDetails(comp)}
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant={isSelected ? "secondary" : "default"}
                      className="h-7 text-xs"
                      onClick={() => onSelectComp(comp.id, !isSelected)}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Selected
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
