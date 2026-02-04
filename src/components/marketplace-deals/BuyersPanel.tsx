import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Home,
  Building2,
  Phone,
  Mail,
  Star,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Buyer {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email: string;
  buyerType: "flipper" | "landlord";
  rating?: number;
  dealsCompleted?: number;
  preferredAreas?: string[];
  maxPrice?: number;
  isVerified?: boolean;
}

interface BuyersPanelProps {
  viewMode: "flip" | "hold" | "buyers";
  onShowOnMap?: () => void;
  propertyAddress?: string;
}

// Mock buyers for demo - will be replaced with real data
const mockBuyers: Buyer[] = [
  {
    id: "1",
    name: "Marcus Johnson",
    company: "Johnson Investments LLC",
    phone: "(813) 555-0142",
    email: "marcus@johnsoninv.com",
    buyerType: "flipper",
    rating: 4.8,
    dealsCompleted: 23,
    preferredAreas: ["Tampa", "Clearwater"],
    maxPrice: 350000,
    isVerified: true,
  },
  {
    id: "2",
    name: "Sarah Chen",
    company: "Coastal Rentals Group",
    phone: "(813) 555-0198",
    email: "sarah@coastalrentals.com",
    buyerType: "landlord",
    rating: 4.9,
    dealsCompleted: 45,
    preferredAreas: ["Tampa", "St. Petersburg"],
    maxPrice: 400000,
    isVerified: true,
  },
  {
    id: "3",
    name: "David Williams",
    phone: "(727) 555-0167",
    email: "dwilliams@email.com",
    buyerType: "flipper",
    rating: 4.5,
    dealsCompleted: 12,
    preferredAreas: ["Tampa Bay"],
    maxPrice: 275000,
    isVerified: false,
  },
  {
    id: "4",
    name: "Elena Rodriguez",
    company: "ER Property Holdings",
    phone: "(813) 555-0234",
    email: "elena@erholdings.com",
    buyerType: "landlord",
    rating: 4.7,
    dealsCompleted: 31,
    preferredAreas: ["Tampa", "Brandon"],
    maxPrice: 500000,
    isVerified: true,
  },
  {
    id: "5",
    name: "Mike Thompson",
    phone: "(727) 555-0189",
    email: "mthompson@gmail.com",
    buyerType: "flipper",
    rating: 4.3,
    dealsCompleted: 8,
    preferredAreas: ["Hillsborough County"],
    maxPrice: 225000,
    isVerified: false,
  },
];

export function BuyersPanel({ viewMode, onShowOnMap, propertyAddress }: BuyersPanelProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true); // Default open
  
  // Default filter based on view mode
  const defaultFilter = viewMode === "flip" ? "flippers" : viewMode === "hold" ? "landlords" : "all";
  const [buyerFilter, setBuyerFilter] = useState<"all" | "flippers" | "landlords">(defaultFilter);
  
  // Get the display label for the badge
  const getBuyerTypeLabel = () => {
    if (buyerFilter === "flippers") return "Flippers";
    if (buyerFilter === "landlords") return "Landlords";
    return "All Buyers";
  };

  const filteredBuyers = mockBuyers.filter((buyer) => {
    if (buyerFilter === "all") return true;
    if (buyerFilter === "flippers") return buyer.buyerType === "flipper";
    if (buyerFilter === "landlords") return buyer.buyerType === "landlord";
    return true;
  });

  const handleViewBuyer = (buyerId: string) => {
    navigate(`/dispo/buyers?id=${buyerId}`);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden border-success/50 bg-success/5">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-success/10 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold">Buyers</span>
              <Badge variant="secondary" className="text-xs">
                {getBuyerTypeLabel()}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            {/* Filter Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden mb-3">
              <button
                onClick={() => setBuyerFilter("flippers")}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                  buyerFilter === "flippers"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted text-muted-foreground"
                )}
              >
                <Home className="h-3 w-3" />
                Flippers
              </button>
              <button
                onClick={() => setBuyerFilter("landlords")}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border-x border-border",
                  buyerFilter === "landlords"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted text-muted-foreground"
                )}
              >
                <Building2 className="h-3 w-3" />
                Landlords
              </button>
              <button
                onClick={() => setBuyerFilter("all")}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                  buyerFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted text-muted-foreground"
                )}
              >
                <Users className="h-3 w-3" />
                All
              </button>
            </div>

            {/* Show on Map Button */}
            {onShowOnMap && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mb-3 gap-2 text-xs"
                onClick={onShowOnMap}
              >
                <MapPin className="h-3.5 w-3.5" />
                View Buyers On Map
              </Button>
            )}

            {/* Buyers List */}
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-2">
                {filteredBuyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewBuyer(buyer.id)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{buyer.name}</span>
                        {buyer.isVerified && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-success text-success">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          buyer.buyerType === "flipper"
                            ? "border-primary text-primary bg-primary/10"
                            : "border-warning text-warning bg-warning/10"
                        )}
                      >
                        {buyer.buyerType === "flipper" ? "Flipper" : "Landlord"}
                      </Badge>
                    </div>

                    {buyer.company && (
                      <p className="text-xs text-muted-foreground mb-1">{buyer.company}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {buyer.rating && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          {buyer.rating}
                        </span>
                      )}
                      {buyer.dealsCompleted && (
                        <span>{buyer.dealsCompleted} deals</span>
                      )}
                      {buyer.maxPrice && (
                        <span>Max ${(buyer.maxPrice / 1000).toFixed(0)}k</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${buyer.phone}`;
                        }}
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${buyer.email}`;
                        }}
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBuyer(buyer.id);
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <p className="text-xs text-center text-muted-foreground mt-3">
              {filteredBuyers.length} Buyers Match This Property
            </p>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
