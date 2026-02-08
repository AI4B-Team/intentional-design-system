import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Ruler,
  CheckCircle2,
  Inbox,
  Sparkles,
  X,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactPanel } from "@/components/marketplace-deals/ContactPanel";
import { BuyersPanel } from "@/components/marketplace-deals/BuyersPanel";
import { TransactionRoadmapContent, type TransactionData } from "@/components/transactions/TransactionRoadmapContent";
import { toast } from "sonner";

// Mock transaction data (matching TransactionsDashboard)
const MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    propertyId: "1", // Match useMockDeals format
    address: "14060 Sydney Rd",
    city: "Tampa",
    state: "FL",
    zip: "33527",
    propertyType: "Single Family",
    offerAmount: 88000,
    arv: 235000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    agent: {
      name: "Sarah Mitchell",
      phone: "(512) 555-0147",
      email: "sarah.mitchell@premierrealty.com",
      brokerage: "Premier Realty Group",
    },
  },
  {
    id: "tx-2",
    propertyId: "2",
    address: "567 Pine Avenue",
    city: "Brandon",
    state: "FL",
    zip: "33511",
    propertyType: "Townhouse",
    offerAmount: 145000,
    arv: 220000,
    beds: 3,
    baths: 2,
    sqft: 1600,
    agent: {
      name: "Mike Johnson",
      phone: "(512) 555-0199",
      email: "mike.johnson@realestate.com",
      brokerage: "RE/MAX Elite",
    },
  },
  {
    id: "tx-3",
    propertyId: "3",
    address: "890 Maple Drive",
    city: "Riverview",
    state: "FL",
    zip: "33578",
    propertyType: "Single Family",
    offerAmount: 210000,
    arv: 320000,
    beds: 4,
    baths: 2.5,
    sqft: 2200,
    agent: {
      name: "Linda Williams",
      phone: "(512) 555-0211",
      email: "linda.williams@homes.com",
      brokerage: "Homes & Co",
    },
  },
  {
    id: "tx-4",
    propertyId: "4",
    address: "321 Cedar Lane",
    city: "Valrico",
    state: "FL",
    zip: "33594",
    propertyType: "Single Family",
    offerAmount: 175000,
    arv: 260000,
    beds: 3,
    baths: 2,
    sqft: 1700,
    agent: null,
  },
  {
    id: "tx-5",
    propertyId: "5",
    address: "456 Birch Court",
    city: "Tampa",
    state: "FL",
    zip: "33612",
    propertyType: "Duplex",
    offerAmount: 295000,
    arv: 420000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    agent: {
      name: "Jessica Davis",
      phone: "(512) 555-0188",
      email: "jessica.davis@remax.com",
      brokerage: "RE/MAX Premier",
    },
  },
];

export default function TransactionRoadmapPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNewTransactionBanner, setShowNewTransactionBanner] = useState(false);

  // Check if this is a new transaction from offer flow
  const newTransactionState = location.state as {
    newTransaction?: boolean;
    offerAmount?: number;
    offerPercentage?: number;
    autoFollowUp?: boolean;
    followUpDays?: number;
  } | null;

  useEffect(() => {
    if (newTransactionState?.newTransaction) {
      setShowNewTransactionBanner(true);
      // Clear the state so refresh doesn't show banner again
      window.history.replaceState({}, document.title);
    }
  }, [newTransactionState]);

  // Find transaction by propertyId
  const transaction = MOCK_TRANSACTIONS.find((t) => t.propertyId === id);

  if (!transaction) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Transaction not found</p>
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
      <div className="min-h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/transactions")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back To Transactions
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold">Transaction Roadmap: {transaction.address}</h1>
              </div>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">
              Active Transaction
            </Badge>
          </div>
        </div>

        {/* New Transaction Banner */}
        {showNewTransactionBanner && (
          <div className="bg-success/10 border-b border-success/20 px-6 py-3">
            <div className="flex items-start gap-3 max-w-4xl mx-auto">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-success">Transaction Created Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your offer has been sent and this transaction is now being tracked. You can manage negotiations, 
                  schedule inspections, and track progress through closing right here.
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Inbox className="h-4 w-4" />
                    Responses will appear in your Inbox
                  </span>
                  {newTransactionState?.autoFollowUp && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      Auto follow-up in {newTransactionState.followUpDays} days
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewTransactionBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Split Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Property Details */}
          <div className="w-[400px] flex-shrink-0 border-r border-border bg-white flex flex-col">
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
                      <h2 className="text-xl font-semibold">{transaction.address}</h2>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{transaction.city}, {transaction.state} {transaction.zip}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">
                        ${transaction.offerAmount.toLocaleString()}
                      </div>
                      <div className="text-lg font-medium text-primary">
                        ARV: ${transaction.arv.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center text-muted-foreground mb-1">
                          <Bed className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{transaction.beds}</p>
                        <p className="text-xs text-muted-foreground">Beds</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-muted-foreground mb-1">
                          <Bath className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{transaction.baths}</p>
                        <p className="text-xs text-muted-foreground">Baths</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-muted-foreground mb-1">
                          <Ruler className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">{transaction.sqft.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Sq Ft</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <p className="font-semibold">2005</p>
                        <p className="text-xs text-muted-foreground">Built</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Your Offer */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">Your Offer</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ARV</span>
                      <span className="font-medium text-primary">${transaction.arv.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Your Offer ({Math.round((transaction.offerAmount / transaction.arv) * 100)}%)</span>
                      <span className="font-bold text-lg">${transaction.offerAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Flipper Profit</span>
                      <span className="font-medium text-primary">
                        ${(transaction.arv - transaction.offerAmount - 25000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wholesaler Fee</span>
                      <span className="font-medium text-primary">
                        ${Math.round(transaction.offerAmount * 0.05).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Contact Panel */}
                <ContactPanel
                  contact={mockContact}
                  propertyAddress={transaction.address}
                  propertyPrice={transaction.offerAmount}
                />

                {/* Buyers Panel */}
                <BuyersPanel
                  viewMode="flip"
                  onShowOnMap={() => {}}
                  propertyAddress={transaction.address}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Transaction Roadmap */}
          <div className="flex-1 bg-white overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <TransactionRoadmapContent
                  propertyAddress={transaction.address}
                  propertyPrice={transaction.offerAmount}
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
