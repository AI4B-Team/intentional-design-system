import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Ruler, MapPin, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface RentalCompsSectionProps {
  rentalComps: RentalComp[];
  subjectProperty: {
    address: string;
    beds: number;
    baths: number;
    sqft: number;
  };
}

export function RentalCompsSection({ rentalComps, subjectProperty }: RentalCompsSectionProps) {
  const avgRent = Math.round(rentalComps.reduce((sum, c) => sum + c.monthlyRent, 0) / rentalComps.length);
  const avgRentPerSqft = (rentalComps.reduce((sum, c) => sum + c.rentPerSqft, 0) / rentalComps.length).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Rental Comparables</h2>
          </div>
          <Badge variant="outline" className="border-success text-success bg-success/10">
            {rentalComps.length} Comps Found
          </Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-surface-secondary rounded-lg">
            <p className="text-2xl font-bold text-primary">${avgRent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Avg. Monthly Rent</p>
          </div>
          <div className="text-center p-4 bg-surface-secondary rounded-lg">
            <p className="text-2xl font-bold">${avgRentPerSqft}</p>
            <p className="text-sm text-muted-foreground">Avg. Rent/SqFt</p>
          </div>
          <div className="text-center p-4 bg-surface-secondary rounded-lg">
            <p className="text-2xl font-bold">{Math.round(rentalComps.reduce((sum, c) => sum + c.similarity, 0) / rentalComps.length)}%</p>
            <p className="text-sm text-muted-foreground">Avg. Similarity</p>
          </div>
          <div className="text-center p-4 bg-surface-secondary rounded-lg">
            <p className="text-2xl font-bold">{(rentalComps.reduce((sum, c) => sum + c.distanceMiles, 0) / rentalComps.length).toFixed(1)} mi</p>
            <p className="text-sm text-muted-foreground">Avg. Distance</p>
          </div>
        </div>
      </Card>

      {/* Rental Comps List */}
      <div className="space-y-3">
        {rentalComps.map((comp) => (
          <Card key={comp.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{comp.address}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      comp.quality === "excellent"
                        ? "border-success text-success bg-success/10"
                        : comp.quality === "good"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-muted-foreground"
                    )}
                  >
                    {comp.similarity}% Match
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" />
                    {comp.beds} Beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" />
                    {comp.baths} Baths
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5" />
                    {comp.sqft.toLocaleString()} SqFt
                  </span>
                  <span>{comp.distanceMiles} mi away</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Leased {new Date(comp.leaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {comp.leaseType}
                  </Badge>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-success">${comp.monthlyRent.toLocaleString()}/mo</p>
                <p className="text-sm text-muted-foreground">${comp.rentPerSqft}/SqFt</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Estimated Rent for Subject */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
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
    </div>
  );
}
