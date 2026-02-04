import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Plus,
  RefreshCw,
  FileText,
  Printer,
  Share2,
  Download,
  MapPin,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompMap } from "./CompMap";

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
  
  // Filter states
  const [timeframe, setTimeframe] = useState("6");
  const [radius, setRadius] = useState("1");
  const [bedsFilter, setBedsFilter] = useState("any");
  const [bathsFilter, setBathsFilter] = useState("any");
  const [sqftFilter, setSqftFilter] = useState("any");

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

      {/* Filter Controls */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b overflow-x-auto">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[90px] h-8 bg-background shrink-0 text-xs">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="3" className="text-xs">3 Mo</SelectItem>
            <SelectItem value="6" className="text-xs">6 Mo</SelectItem>
            <SelectItem value="12" className="text-xs">12 Mo</SelectItem>
            <SelectItem value="24" className="text-xs">24 Mo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={radius} onValueChange={setRadius}>
          <SelectTrigger className="w-[80px] h-8 bg-background shrink-0 text-xs">
            <SelectValue placeholder="Radius" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="0.25" className="text-xs">0.25 Mi</SelectItem>
            <SelectItem value="0.5" className="text-xs">0.5 Mi</SelectItem>
            <SelectItem value="1" className="text-xs">1 Mi</SelectItem>
            <SelectItem value="2" className="text-xs">2 Mi</SelectItem>
            <SelectItem value="5" className="text-xs">5 Mi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={bedsFilter} onValueChange={setBedsFilter}>
          <SelectTrigger className="w-[75px] h-8 bg-background shrink-0 text-xs">
            <SelectValue placeholder="Beds" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="any" className="text-xs">Any</SelectItem>
            <SelectItem value="1-2" className="text-xs">1-2</SelectItem>
            <SelectItem value="1-3" className="text-xs">1-3</SelectItem>
            <SelectItem value="2-4" className="text-xs">2-4</SelectItem>
            <SelectItem value="3-5" className="text-xs">3-5</SelectItem>
            <SelectItem value="4+" className="text-xs">4+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={bathsFilter} onValueChange={setBathsFilter}>
          <SelectTrigger className="w-[75px] h-8 bg-background shrink-0 text-xs">
            <SelectValue placeholder="Baths" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="any" className="text-xs">Any</SelectItem>
            <SelectItem value="1-2" className="text-xs">1-2</SelectItem>
            <SelectItem value="2-3" className="text-xs">2-3</SelectItem>
            <SelectItem value="3+" className="text-xs">3+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sqftFilter} onValueChange={setSqftFilter}>
          <SelectTrigger className="w-[85px] h-8 bg-background shrink-0 text-xs">
            <SelectValue placeholder="Sqft" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="any" className="text-xs">Any</SelectItem>
            <SelectItem value="0-1000" className="text-xs">0-1k</SelectItem>
            <SelectItem value="1000-1500" className="text-xs">1-1.5k</SelectItem>
            <SelectItem value="1500-2000" className="text-xs">1.5-2k</SelectItem>
            <SelectItem value="2000-3000" className="text-xs">2-3k</SelectItem>
            <SelectItem value="3000+" className="text-xs">3k+</SelectItem>
          </SelectContent>
        </Select>
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
        <div className="mb-4">
          <CompMap
            subjectLat={subjectLat}
            subjectLng={subjectLng}
            subjectAddress={subjectProperty.address}
            subjectPrice={subjectProperty.price}
            comps={compsWithCoords.map((c) => ({
              id: c.id,
              address: c.address,
              beds: c.beds,
              baths: c.baths,
              sqft: c.sqft,
              salePrice: c.salePrice,
              distanceMiles: c.distanceMiles,
              quality: c.quality,
              latitude: c.latitude!,
              longitude: c.longitude!,
            }))}
          />
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
        {selectedComps.size > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedComps.size} Selected
          </Badge>
        )}
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
                ? "border-success/30 bg-success/5 hover:border-success/50"
                : "border-warning/30 bg-warning/5 hover:border-warning/50"
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
                      ? "border-success text-success bg-success/10"
                      : "border-warning text-warning bg-warning/10"
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
