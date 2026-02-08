import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DollarSign, RefreshCw, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompMap } from "@/components/marketplace-deals/CompMap";

interface RentalComp {
  id: string;
  address: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
  monthlyRent: number;
  leaseDate: string;
  distanceMiles: number;
  rentPerSqft: number;
  similarity: number;
  quality: "excellent" | "good" | "fair";
  leaseType: string;
  latitude?: number;
  longitude?: number;
}

interface RentalCompsSectionProps {
  rentalComps: RentalComp[];
  subjectProperty: {
    address: string;
    beds: number;
    baths: number;
    sqft: number;
    latitude?: number;
    longitude?: number;
  };
}

export function RentalCompsSection({ rentalComps, subjectProperty }: RentalCompsSectionProps) {
  const [selectedComps, setSelectedComps] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(true);
  
  // Filter states
  const [timeframe, setTimeframe] = useState("6");
  const [radius, setRadius] = useState("1");
  const [bedsFilter, setBedsFilter] = useState("any");
  const [bathsFilter, setBathsFilter] = useState("any");
  const [sqftFilter, setSqftFilter] = useState("any");

  const avgRent = Math.round(rentalComps.reduce((sum, c) => sum + c.monthlyRent, 0) / rentalComps.length);
  const avgRentPerSqft = (rentalComps.reduce((sum, c) => sum + c.rentPerSqft, 0) / rentalComps.length).toFixed(2);
  const avgSimilarity = Math.round(rentalComps.reduce((sum, c) => sum + c.similarity, 0) / rentalComps.length);
  const avgDistance = (rentalComps.reduce((sum, c) => sum + c.distanceMiles, 0) / rentalComps.length).toFixed(1);

  // Generate mock coordinates around subject property for demo
  const subjectLat = subjectProperty.latitude || 33.4484;
  const subjectLng = subjectProperty.longitude || -112.074;

  const compsWithCoords = rentalComps.map((comp) => ({
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
    if (selectedComps.size === rentalComps.length) {
      setSelectedComps(new Set());
    } else {
      setSelectedComps(new Set(rentalComps.map((c) => c.id)));
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Rental Comparables</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs whitespace-nowrap">
                  Add Comp
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add A Custom Rental Comparable</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Comps</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowMap(!showMap)}>
                  <MapPin className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showMap ? "Hide Map" : "Show Map"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-4 bg-surface-secondary rounded-lg">
          <p className="text-2xl font-bold text-primary">${Math.round(subjectProperty.sqft * parseFloat(avgRentPerSqft)).toLocaleString()}/mo</p>
          <p className="text-sm text-muted-foreground">Est. Rent (Subject)</p>
        </div>
        <div className="text-center p-4 bg-surface-secondary rounded-lg">
          <p className="text-2xl font-bold">${avgRent.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Avg. Comp Rent</p>
        </div>
        <div className="text-center p-4 bg-surface-secondary rounded-lg">
          <p className="text-2xl font-bold">${avgRentPerSqft}/sqft</p>
          <p className="text-sm text-muted-foreground">Avg. Rent/SqFt</p>
        </div>
        <div className="text-center p-4 bg-surface-secondary rounded-lg">
          <p className="text-2xl font-bold">{avgDistance} mi</p>
          <p className="text-sm text-muted-foreground">Avg. Distance</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-center gap-4 mb-4 pb-4 border-b">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="min-w-[130px] h-8 bg-background text-xs gap-1 px-3">
            <span className="text-muted-foreground">Timeline:</span>
            <SelectValue placeholder="6 Mo" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="3" className="text-xs">3 Mo</SelectItem>
            <SelectItem value="6" className="text-xs">6 Mo</SelectItem>
            <SelectItem value="12" className="text-xs">12 Mo</SelectItem>
            <SelectItem value="24" className="text-xs">24 Mo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={radius} onValueChange={setRadius}>
          <SelectTrigger className="min-w-[130px] h-8 bg-background text-xs gap-1 px-3">
            <span className="text-muted-foreground">Radius:</span>
            <SelectValue placeholder="1 Mi" />
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
          <SelectTrigger className="min-w-[110px] h-8 bg-background text-xs gap-1 px-3">
            <span className="text-muted-foreground">Beds:</span>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="any" className="text-xs">Any</SelectItem>
            <SelectItem value="1-2" className="text-xs">1-2</SelectItem>
            <SelectItem value="2-3" className="text-xs">2-3</SelectItem>
            <SelectItem value="3+" className="text-xs">3+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={bathsFilter} onValueChange={setBathsFilter}>
          <SelectTrigger className="min-w-[110px] h-8 bg-background text-xs gap-1 px-3">
            <span className="text-muted-foreground">Baths:</span>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="any" className="text-xs">Any</SelectItem>
            <SelectItem value="1-2" className="text-xs">1-2</SelectItem>
            <SelectItem value="2-3" className="text-xs">2-3</SelectItem>
            <SelectItem value="3+" className="text-xs">3+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sqftFilter} onValueChange={setSqftFilter}>
          <SelectTrigger className="min-w-[110px] h-8 bg-background text-xs gap-1 px-3">
            <span className="text-muted-foreground">SqFt:</span>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[100]">
            <SelectItem value="any" className="text-xs">Any</SelectItem>
            <SelectItem value="0-1000" className="text-xs">0-1k</SelectItem>
            <SelectItem value="1000-1500" className="text-xs">1-1.5k</SelectItem>
            <SelectItem value="1500-2000" className="text-xs">1.5-2k</SelectItem>
            <SelectItem value="2000+" className="text-xs">2k+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Map */}
      {showMap && (
        <div className="mb-4">
          <CompMap
            subjectLat={subjectLat}
            subjectLng={subjectLng}
            subjectAddress={subjectProperty.address}
            subjectPrice={0}
            comps={compsWithCoords.map((c) => ({
              id: c.id,
              address: c.address,
              beds: c.beds,
              baths: c.baths,
              sqft: c.sqft,
              salePrice: c.monthlyRent,
              distanceMiles: c.distanceMiles,
              quality: c.quality === "fair" ? "good" : c.quality,
              latitude: c.latitude!,
              longitude: c.longitude!,
            }))}
          />
        </div>
      )}

      {/* Comp List Header with Select All */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedComps.size === rentalComps.length && rentalComps.length > 0}
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
        <Badge variant="secondary">{rentalComps.length} Comps</Badge>
      </div>

      {/* Rental Comps List */}
      <div className="space-y-3">
        {rentalComps.map((comp, idx) => (
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
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{comp.beds} bd • {comp.baths} ba • {comp.sqft.toLocaleString()} sqft</span>
                <span>{comp.distanceMiles} mi away</span>
                <span>Leased {new Date(comp.leaseDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-lg">${comp.monthlyRent.toLocaleString()}/mo</p>
              <p className="text-xs text-muted-foreground">${comp.rentPerSqft}/sqft</p>
            </div>
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
          <span className="text-sm text-muted-foreground">
            Avg Rent: <span className="font-semibold text-foreground">${avgRent.toLocaleString()}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            Avg $/sqft: <span className="font-semibold text-foreground">${avgRentPerSqft}</span>
          </span>
        </div>
      </div>

      {/* Estimated Rent for Subject */}
      <Card className="p-6 mt-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Rent for Subject Property</p>
            <p className="text-3xl font-bold text-primary">
              ${Math.round(subjectProperty.sqft * parseFloat(avgRentPerSqft)).toLocaleString()}/mo
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {subjectProperty.sqft.toLocaleString()} sqft × ${avgRentPerSqft}/sqft
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Range</p>
            <p className="font-medium">
              ${Math.min(...rentalComps.map(c => c.monthlyRent)).toLocaleString()} - ${Math.max(...rentalComps.map(c => c.monthlyRent)).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </Card>
  );
}
