import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Send,
  MessageCircle,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AIMessageTemplatesDialog } from "./AIMessageTemplatesDialog";
import { BuyerProfileModal } from "./BuyerProfileModal";

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
  {
    id: "6",
    name: "Jessica Palmer",
    company: "Palm Realty Ventures",
    phone: "(813) 555-0256",
    email: "jpalmer@palmrealty.com",
    buyerType: "landlord",
    rating: 4.6,
    dealsCompleted: 28,
    preferredAreas: ["Tampa", "Wesley Chapel"],
    maxPrice: 450000,
    isVerified: true,
  },
  {
    id: "7",
    name: "Robert Kim",
    phone: "(727) 555-0312",
    email: "rkim@email.com",
    buyerType: "flipper",
    rating: 4.4,
    dealsCompleted: 15,
    preferredAreas: ["Pinellas County"],
    maxPrice: 300000,
    isVerified: true,
  },
  {
    id: "8",
    name: "Amanda Foster",
    company: "Foster Capital Group",
    phone: "(813) 555-0378",
    email: "amanda@fostercapital.com",
    buyerType: "landlord",
    rating: 4.8,
    dealsCompleted: 52,
    preferredAreas: ["Tampa", "Riverview"],
    maxPrice: 600000,
    isVerified: true,
  },
  {
    id: "9",
    name: "Carlos Mendez",
    phone: "(813) 555-0401",
    email: "cmendez@gmail.com",
    buyerType: "flipper",
    rating: 4.2,
    dealsCompleted: 6,
    preferredAreas: ["Brandon", "Valrico"],
    maxPrice: 200000,
    isVerified: false,
  },
  {
    id: "10",
    name: "Linda Chang",
    company: "Evergreen Properties",
    phone: "(727) 555-0445",
    email: "linda@evergreenprops.com",
    buyerType: "landlord",
    rating: 4.9,
    dealsCompleted: 67,
    preferredAreas: ["St. Petersburg", "Clearwater"],
    maxPrice: 550000,
    isVerified: true,
  },
  {
    id: "11",
    name: "Brian Scott",
    phone: "(813) 555-0489",
    email: "bscott@yahoo.com",
    buyerType: "flipper",
    rating: 4.1,
    dealsCompleted: 4,
    preferredAreas: ["Temple Terrace"],
    maxPrice: 180000,
    isVerified: false,
  },
  {
    id: "12",
    name: "Rachel Green",
    company: "Sunshine State Rentals",
    phone: "(813) 555-0523",
    email: "rachel@sunshinerentals.com",
    buyerType: "landlord",
    rating: 4.5,
    dealsCompleted: 19,
    preferredAreas: ["Tampa", "Lutz"],
    maxPrice: 375000,
    isVerified: true,
  },
  {
    id: "13",
    name: "James Morrison",
    phone: "(727) 555-0567",
    email: "jmorrison@email.com",
    buyerType: "flipper",
    rating: 4.7,
    dealsCompleted: 34,
    preferredAreas: ["Largo", "Seminole"],
    maxPrice: 325000,
    isVerified: true,
  },
  {
    id: "14",
    name: "Nicole Adams",
    company: "Adams Investment Co",
    phone: "(813) 555-0612",
    email: "nicole@adamsinvest.com",
    buyerType: "landlord",
    rating: 4.3,
    dealsCompleted: 11,
    preferredAreas: ["Carrollwood", "Northdale"],
    maxPrice: 425000,
    isVerified: false,
  },
  {
    id: "15",
    name: "Kevin O'Brien",
    phone: "(727) 555-0656",
    email: "kobrien@gmail.com",
    buyerType: "flipper",
    rating: 4.6,
    dealsCompleted: 21,
    preferredAreas: ["Dunedin", "Palm Harbor"],
    maxPrice: 290000,
    isVerified: true,
  },
];

export function BuyersPanel({ viewMode, onShowOnMap, propertyAddress }: BuyersPanelProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Default closed
  
  // AI Template Dialog state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [messageType, setMessageType] = useState<"email" | "sms">("email");
  
  // Profile Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileBuyer, setProfileBuyer] = useState<Buyer | null>(null);
  
  // Default filter based on view mode
  const defaultFilter = viewMode === "flip" ? "flippers" : viewMode === "hold" ? "landlords" : "all";
  const [buyerFilter, setBuyerFilter] = useState<"all" | "flippers" | "landlords">(defaultFilter);
  
  // Sync filter when viewMode changes from parent
  useEffect(() => {
    const newFilter = viewMode === "flip" ? "flippers" : viewMode === "hold" ? "landlords" : "all";
    setBuyerFilter(newFilter);
  }, [viewMode]);
  
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

  const handleViewBuyer = (buyer: Buyer) => {
    setProfileBuyer(buyer);
    setProfileModalOpen(true);
  };

  const openAITemplates = (buyer: Buyer, type: "email" | "sms") => {
    setSelectedBuyer(buyer);
    setMessageType(type);
    setAiDialogOpen(true);
  };
  
  const handleProfileContact = (type: "call" | "sms" | "email") => {
    if (!profileBuyer) return;
    if (type === "call") {
      window.location.href = `tel:${profileBuyer.phone}`;
    } else if (type === "sms") {
      setProfileModalOpen(false);
      openAITemplates(profileBuyer, "sms");
    } else {
      setProfileModalOpen(false);
      openAITemplates(profileBuyer, "email");
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} data-buyers-panel>
      <Card className="overflow-hidden border-success/50 bg-success/5">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between bg-success/10 hover:bg-success/20 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold">Buyers</span>
              <Badge variant="secondary" className="text-xs">
                {filteredBuyers.length} {getBuyerTypeLabel()}
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
            {/* Filter Toggle + Action Buttons Row */}
            <div className="flex items-center justify-between gap-2 mb-3 pt-2">
              {/* Filter Toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setBuyerFilter("flippers")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
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
                    "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 border-x border-border",
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
                    "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                    buyerFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Users className="h-3 w-3" />
                  All
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-8 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/dispo/buyers");
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add
                </Button>
                <Button
                  size="sm"
                  className="gap-1 text-xs h-8 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dispo/campaigns/new?property=${encodeURIComponent(propertyAddress || "")}&buyerType=${buyerFilter}`);
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                  Campaign
                </Button>
              </div>
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
            <div className="space-y-2">
              {filteredBuyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewBuyer(buyer)}
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
                        <span>{buyer.dealsCompleted} Deals</span>
                      )}
                      {buyer.maxPrice && (
                        <span>Max ${(buyer.maxPrice / 1000).toFixed(0)}k</span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 mt-2 -mx-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 flex-1 text-xs gap-1 justify-center px-1"
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
                        className="h-7 flex-1 text-xs gap-1 justify-center px-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAITemplates(buyer, "sms");
                        }}
                      >
                        <MessageCircle className="h-3 w-3" />
                        SMS
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 flex-1 text-xs gap-1 justify-center px-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAITemplates(buyer, "email");
                        }}
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 flex-1 text-xs gap-1 justify-center px-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBuyer(buyer);
                        }}
                      >
                        <Users className="h-3 w-3" />
                        Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </CollapsibleContent>
      </Card>

      {/* Buyer Profile Modal */}
      <BuyerProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        buyer={profileBuyer}
        onContact={handleProfileContact}
      />

      {/* AI Message Templates Dialog */}
      {selectedBuyer && (
        <AIMessageTemplatesDialog
          open={aiDialogOpen}
          onOpenChange={(open) => {
            setAiDialogOpen(open);
            if (!open) setSelectedBuyer(null);
          }}
          buyerName={selectedBuyer.name}
          buyerEmail={selectedBuyer.email}
          buyerPhone={selectedBuyer.phone}
          buyerType={selectedBuyer.buyerType}
          propertyAddress={propertyAddress || ""}
          messageType={messageType}
        />
      )}
    </Collapsible>
  );
}
