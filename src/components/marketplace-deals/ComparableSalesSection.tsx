import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Trash2,
  FileText,
  Printer,
  Share2,
  Download,
  MapPin,
  Home,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Comp {
  id: string;
  address: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
  salePrice: number;
  saleDate: string;
  distanceMiles: number;
  pricePerSqft: number;
  similarity: number;
  isSelected: boolean;
  quality: "excellent" | "good";
  saleType: string;
  latitude?: number;
  longitude?: number;
}

interface SubjectProperty {
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  arv: number;
  latitude?: number;
  longitude?: number;
}

interface ComparableSalesSectionProps {
  subjectProperty: SubjectProperty;
  retailComps: Comp[];
  investorComps: Comp[];
  onAddComp?: () => void;
  onRefreshComps?: () => void;
  onRemoveComp?: (id: string) => void;
  onGenerateReport?: (selectedIds: string[]) => void;
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

export function ComparableSalesSection({
  subjectProperty,
  retailComps,
  investorComps,
  onAddComp,
  onRefreshComps,
  onRemoveComp,
  onGenerateReport,
}: ComparableSalesSectionProps) {
  const [compType, setCompType] = useState<"retail" | "investor">("retail");
  const [selectedComps, setSelectedComps] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(true);

  const comps = compType === "retail" ? retailComps : investorComps;

  // Generate mock coordinates around subject property for demo
  const subjectLat = subjectProperty.latitude || 33.4484;
  const subjectLng = subjectProperty.longitude || -112.074;

  const compsWithCoords = comps.map((comp, idx) => ({
    ...comp,
    latitude: comp.latitude || subjectLat + (Math.random() - 0.5) * 0.02,
    longitude: comp.longitude || subjectLng + (Math.random() - 0.5) * 0.02,
  }));

  const handleToggleComp = (id: string) => {
    setSelectedComps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedComps.size === comps.length) {
      setSelectedComps(new Set());
    } else {
      setSelectedComps(new Set(comps.map((c) => c.id)));
    }
  };

  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport(Array.from(selectedComps));
    }
  };

  const avgCompPrice = comps.length > 0
    ? Math.round(comps.reduce((sum, c) => sum + c.salePrice, 0) / comps.length)
    : 0;

  const avgPricePerSqft = comps.length > 0
    ? Math.round(comps.reduce((sum, c) => sum + c.pricePerSqft, 0) / comps.length)
    : 0;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Comparable Sales</h2>
          {/* Comp Type Toggle */}
          <div className="flex items-center gap-1 ml-2 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setCompType("retail")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                compType === "retail"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Retail Comps
            </button>
            <button
              onClick={() => setCompType("investor")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                compType === "investor"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Investor Comps
            </button>
          </div>
        </div>
        <Badge variant="secondary">{comps.length} Comps</Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onAddComp}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Comp
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a custom comparable</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onRefreshComps}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fetch updated comps</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="h-4 w-4 mr-1" />
            {showMap ? "Hide Map" : "Show Map"}
          </Button>
        </div>

        {/* Selection Actions */}
        {selectedComps.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedComps.size} selected
            </span>
            <Button variant="secondary" size="sm" onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-1" />
              Create Report
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print Report</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share Report</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Map */}
      {showMap && (
        <div className="h-[250px] rounded-lg overflow-hidden mb-4 border">
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
                  <p className="text-xs text-muted-foreground">{subjectProperty.address}</p>
                  <p className="text-sm font-medium text-primary mt-1">
                    ${subjectProperty.price.toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Comp Markers */}
            {compsWithCoords.map((comp, idx) => (
              <Marker
                key={comp.id}
                position={[comp.latitude!, comp.longitude!]}
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
              radius={1609} // 1 mile in meters
              pathOptions={{
                color: "hsl(var(--primary))",
                fillColor: "hsl(var(--primary))",
                fillOpacity: 0.05,
                weight: 2,
                dashArray: "5, 5",
              }}
            />
          </MapContainer>
        </div>
      )}

      {/* Comp List Header with Select All */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <Checkbox
          checked={selectedComps.size === comps.length && comps.length > 0}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          Select All
        </span>
      </div>

      {/* Comp List */}
      <div className="space-y-3">
        {comps.map((comp, idx) => (
          <div
            key={comp.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
              selectedComps.has(comp.id)
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : comp.quality === "excellent"
                ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300"
                : "border-amber-200 bg-amber-50/50 hover:border-amber-300"
            )}
            onClick={() => handleToggleComp(comp.id)}
          >
            <Checkbox
              checked={selectedComps.has(comp.id)}
              onCheckedChange={() => handleToggleComp(comp.id)}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Comp Number */}
            <div className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white",
              comp.quality === "excellent" ? "bg-success" : "bg-warning"
            )}>
              {idx + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate">{comp.address}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs shrink-0",
                    comp.quality === "excellent"
                      ? "border-emerald-500 text-emerald-700 bg-emerald-100"
                      : "border-amber-500 text-amber-700 bg-amber-100"
                  )}
                >
                  {comp.similarity}% Match
                </Badge>
                {comp.saleType !== "Standard" && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {comp.saleType}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{comp.beds} bd • {comp.baths} ba • {comp.sqft.toLocaleString()} sqft</span>
                <span>{comp.distanceMiles} mi away</span>
                <span>Sold {new Date(comp.saleDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-lg">${comp.salePrice.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">${comp.pricePerSqft}/sqft</p>
            </div>

            {onRemoveComp && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveComp(comp.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove Comp</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ))}
      </div>

      {/* Footer Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Excellent Match (90%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Good Match (70-89%)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm">
            <span className="text-muted-foreground">Avg Price:</span>{" "}
            <span className="font-semibold">${avgCompPrice.toLocaleString()}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Avg $/sqft:</span>{" "}
            <span className="font-semibold">${avgPricePerSqft}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
