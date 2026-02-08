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
  DollarSign,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactPanel } from "@/components/marketplace-deals/ContactPanel";
import { BuyersPanel } from "@/components/marketplace-deals/BuyersPanel";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { 
  TransactionStageId, 
  CriticalDate, 
  DEFAULT_CRITICAL_DATES,
  DocumentItem,
  DEFAULT_DOCUMENTS,
  Stakeholder,
} from "@/lib/transaction-stages";
import { TCPipelineProgress } from "@/components/transactions/TCPipelineProgress";
import { TCCriticalDates } from "@/components/transactions/TCCriticalDates";
import { TCAIBuyerMatching } from "@/components/transactions/TCAIBuyerMatching";
import { TCStakeholders } from "@/components/transactions/TCStakeholders";
import { TCDocumentChecklist } from "@/components/transactions/TCDocumentChecklist";

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    propertyId: "1",
    address: "14060 Sydney Rd",
    city: "Tampa",
    state: "FL",
    zip: "33527",
    propertyType: "Single Family",
    contractPrice: 88000,
    assignmentFee: 8000,
    arv: 235000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    yearBuilt: 2005,
    stage: "contract_signed" as TransactionStageId,
    contractDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    seller: {
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
    contractPrice: 145000,
    assignmentFee: 12000,
    arv: 220000,
    beds: 3,
    baths: 2,
    sqft: 1600,
    yearBuilt: 2010,
    stage: "due_diligence" as TransactionStageId,
    contractDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    seller: {
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
    contractPrice: 210000,
    assignmentFee: 15000,
    arv: 320000,
    beds: 4,
    baths: 2.5,
    sqft: 2200,
    yearBuilt: 2008,
    stage: "marketing" as TransactionStageId,
    contractDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    seller: {
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
    contractPrice: 175000,
    assignmentFee: 10000,
    arv: 260000,
    beds: 3,
    baths: 2,
    sqft: 1700,
    yearBuilt: 2003,
    stage: "closing" as TransactionStageId,
    contractDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    seller: null,
  },
  {
    id: "tx-5",
    propertyId: "5",
    address: "456 Birch Court",
    city: "Tampa",
    state: "FL",
    zip: "33612",
    propertyType: "Duplex",
    contractPrice: 295000,
    assignmentFee: 18000,
    arv: 420000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    yearBuilt: 2012,
    stage: "sold" as TransactionStageId,
    contractDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    seller: {
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
  const [currentStage, setCurrentStage] = useState<TransactionStageId>("contract_signed");

  // Check if this is a new transaction from offer flow
  const newTransactionState = location.state as {
    newTransaction?: boolean;
    offerAmount?: number;
    offerPercentage?: number;
    autoFollowUp?: boolean;
    followUpDays?: number;
  } | null;

  // Find transaction by propertyId
  const transaction = MOCK_TRANSACTIONS.find((t) => t.propertyId === id);

  // Initialize critical dates
  const [criticalDates, setCriticalDates] = useState<CriticalDate[]>(() => {
    const contractDate = transaction?.contractDate || new Date();
    return DEFAULT_CRITICAL_DATES.map((d, i) => ({
      ...d,
      id: `date-${i}`,
      date: d.daysFromContract !== undefined 
        ? addDays(contractDate, d.daysFromContract)
        : null,
      isCompleted: false,
    }));
  });

  // Initialize documents
  const [documents, setDocuments] = useState<DocumentItem[]>(() => 
    DEFAULT_DOCUMENTS.map((d, i) => ({
      ...d,
      id: `doc-${i}`,
      isUploaded: false,
    }))
  );

  // Initialize stakeholders
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(() => [
    {
      id: "s1",
      type: "seller",
      name: transaction?.seller?.name || "Unknown Seller",
      email: transaction?.seller?.email,
      phone: transaction?.seller?.phone,
      role: "Property Seller",
      isConfirmed: true,
    },
    {
      id: "s2",
      type: "seller_agent",
      name: transaction?.seller?.brokerage ? `Agent at ${transaction.seller.brokerage}` : "Seller's Agent",
      company: transaction?.seller?.brokerage,
      role: "Seller Representative",
      isConfirmed: Boolean(transaction?.seller),
    },
    {
      id: "s3",
      type: "title_company",
      name: "Title Company",
      role: "Title & Escrow",
      isConfirmed: false,
    },
    {
      id: "s4",
      type: "inspector",
      name: "Inspector",
      role: "Property Inspector",
      isConfirmed: false,
    },
  ]);

  useEffect(() => {
    if (newTransactionState?.newTransaction) {
      setShowNewTransactionBanner(true);
      window.history.replaceState({}, document.title);
    }
  }, [newTransactionState]);

  useEffect(() => {
    if (transaction) {
      setCurrentStage(transaction.stage);
    }
  }, [transaction]);

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
  const mockContact = transaction.seller ? {
    name: transaction.seller.name,
    type: "agent" as const,
    phone: transaction.seller.phone,
    email: transaction.seller.email,
    brokerage: transaction.seller.brokerage,
  } : null;

  // Mock images
  const propertyImages = [
    `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop`,
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdateCriticalDate = (dateId: string, updates: Partial<CriticalDate>) => {
    setCriticalDates(prev => 
      prev.map(d => d.id === dateId ? { ...d, ...updates } : d)
    );
  };

  const handleUpdateDocument = (docId: string, updates: Partial<DocumentItem>) => {
    setDocuments(prev =>
      prev.map(d => d.id === docId ? { ...d, ...updates } : d)
    );
  };

  const handleUpdateStakeholder = (id: string, updates: Partial<Stakeholder>) => {
    setStakeholders(prev =>
      prev.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  };

  const handleAddStakeholder = (stakeholder: Omit<Stakeholder, "id">) => {
    setStakeholders(prev => [...prev, { ...stakeholder, id: `s-${Date.now()}` }]);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  return (
    <AppLayout fullWidth>
      <div className="min-h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
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
                <h1 className="text-lg font-semibold">{transaction.address}</h1>
                <p className="text-sm text-muted-foreground">
                  {transaction.city}, {transaction.state} {transaction.zip}
                </p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Under Contract
            </Badge>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="flex-shrink-0 border-b border-border bg-card px-6 py-3">
          <TCPipelineProgress 
            currentStage={currentStage}
            onStageClick={setCurrentStage}
          />
        </div>

        {/* New Transaction Banner */}
        {showNewTransactionBanner && (
          <div className="bg-success/10 border-b border-success/20 px-6 py-3">
            <div className="flex items-start gap-3 max-w-4xl mx-auto">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-success">Transaction Created Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your offer has been accepted and this deal is now under contract. 
                  Track deadlines, market to buyers, and coordinate closing right here.
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Inbox className="h-4 w-4" />
                    All communications route to Inbox
                  </span>
                  {newTransactionState?.autoFollowUp && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      AI buyer matching active
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
          <div className="w-[400px] flex-shrink-0 border-r border-border bg-card flex flex-col">
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
                </Card>

                {/* Property Info */}
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3">
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
                        <p className="font-semibold">{transaction.yearBuilt}</p>
                        <p className="text-xs text-muted-foreground">Built</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Deal Summary */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">Deal Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ARV</span>
                      <span className="font-medium">{formatCurrency(transaction.arv)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Contract Price</span>
                      <span className="font-bold text-lg">{formatCurrency(transaction.contractPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">% of ARV</span>
                      <span className="font-medium text-primary">
                        {Math.round((transaction.contractPrice / transaction.arv) * 100)}%
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Assignment Fee</span>
                        <span className="font-bold text-lg text-success">
                          {formatCurrency(transaction.assignmentFee)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Contact Panel */}
                {mockContact && (
                  <ContactPanel
                    contact={mockContact}
                    propertyAddress={transaction.address}
                    propertyPrice={transaction.contractPrice}
                  />
                )}

                {/* Buyers Panel */}
                <BuyersPanel
                  viewMode="flip"
                  onShowOnMap={() => {}}
                  propertyAddress={transaction.address}
                />
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Transaction Coordinator Tools */}
          <div className="flex-1 bg-muted/30 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* AI Buyer Matching */}
                <TCAIBuyerMatching
                  propertyAddress={transaction.address}
                  askingPrice={transaction.contractPrice + transaction.assignmentFee}
                  arv={transaction.arv}
                  propertyType={transaction.propertyType}
                  market={transaction.city}
                />

                {/* Critical Dates */}
                <TCCriticalDates
                  contractDate={transaction.contractDate}
                  criticalDates={criticalDates}
                  onUpdateDate={handleUpdateCriticalDate}
                />

                {/* Stakeholders */}
                <TCStakeholders
                  stakeholders={stakeholders}
                  onUpdateStakeholder={handleUpdateStakeholder}
                  onAddStakeholder={handleAddStakeholder}
                />

                {/* Document Checklist */}
                <TCDocumentChecklist
                  documents={documents}
                  onUpdateDocument={handleUpdateDocument}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
