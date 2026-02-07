import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Bed,
  Bath,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockDeals } from "@/hooks/useMockDeals";
import { ContactPanel } from "@/components/marketplace-deals/ContactPanel";
import { BuyersPanel } from "@/components/marketplace-deals/BuyersPanel";
import { TransactionRoadmapContent, type TransactionData } from "@/components/transactions/TransactionRoadmapContent";
import { toast } from "sonner";

// Default filter values for useMockDeals
const defaultFilters = {
  address: "",
  leadType: "all",
  homeTypes: [],
  priceMin: "",
  priceMax: "",
  bedsMin: "",
  bathsMin: "",
};

export default function TransactionRoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deals } = useMockDeals({
    filters: defaultFilters,
    sortBy: "newest",
    page: 1,
    perPage: 50,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const deal = deals.find((d) => d.id === id);

  if (!deal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Property not found</p>
        </div>
      </AppLayout>
    );
  }

  // Mock contact for demo
  const mockContact = {
    name: "Sarah Mitchell",
    type: "agent" as const,
    phone: "(512) 555-0147",
    email: "sarah.mitchell@premierrealty.com",
    brokerage: "Premier Realty Group",
  };

  // Mock images
  const propertyImages = [
    `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop`,
  ];

  const handleSaveTransaction = (data: TransactionData) => {
    console.log("Transaction data saved:", data);
    toast.success("Transaction progress saved!");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  return (
    <AppLayout fullWidth>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/marketplace/deal/${id}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Property
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold">Transaction Roadmap</h1>
                <p className="text-sm text-muted-foreground">{deal.address}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">
              Active Transaction
            </Badge>
          </div>
        </div>

        {/* Split Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Property Details */}
          <div className="w-[400px] flex-shrink-0 border-r border-border bg-muted/30 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Image Gallery */}
                <Card className="overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={propertyImages[currentImageIndex]}
                      alt={`Property ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-between p-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {propertyImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            idx === currentImageIndex
                              ? "w-4 bg-white"
                              : "w-1.5 bg-white/60"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="p-2 flex gap-2">
                    {propertyImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "w-16 h-12 rounded-md overflow-hidden border-2 transition-all",
                          idx === currentImageIndex
                            ? "border-primary"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Property Info */}
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>{deal.city}, {deal.state}</span>
                      </div>
                      <h2 className="text-xl font-semibold">{deal.address}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary">
                        ${deal.price.toLocaleString()}
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        {deal.propertyType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-2 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Bed className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{deal.beds}</p>
                        <p className="text-xs text-muted-foreground">Beds</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Bath className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{deal.baths}</p>
                        <p className="text-xs text-muted-foreground">Baths</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Square className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{deal.sqft.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Sq Ft</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">2005</p>
                        <p className="text-xs text-muted-foreground">Built</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Investment Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">ARV</span>
                      <span className="font-semibold">${deal.arv.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Est. Repair</span>
                      <span className="font-semibold">${(25000).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Potential Profit</span>
                      <span className="font-semibold text-success">
                        ${(deal.arv - deal.price - 25000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Days on Market</span>
                      <span className="font-semibold">14</span>
                    </div>
                  </div>
                </Card>

                {/* Contact Panel */}
                <ContactPanel
                  contact={mockContact}
                  propertyAddress={deal.address}
                  propertyPrice={deal.price}
                />

                {/* Buyers Panel */}
                <BuyersPanel
                  viewMode="flip"
                  onShowOnMap={() => {}}
                  propertyAddress={deal.address}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Transaction Roadmap */}
          <div className="flex-1 bg-white overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <TransactionRoadmapContent
                  propertyAddress={deal.address}
                  propertyPrice={deal.price}
                  onSave={handleSaveTransaction}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
