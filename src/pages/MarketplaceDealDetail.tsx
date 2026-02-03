import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSavedDeals } from "@/hooks/useSavedDeals";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Heart,
  EyeOff,
  Share2,
  ChevronLeft,
  ChevronRight,
  Rotate3d,
  Video,
  MapPin,
  Camera,
  Home,
  Calendar,
  Tag,
  DollarSign,
  TrendingUp,
  Wrench,
  Target,
  Phone,
  Mail,
  Zap,
  Sparkles,
  User,
  Briefcase,
  BadgeCheck,
  Send,
  Copy,
  Check,
  Car,
  Building,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  PanelLeftClose,
  PanelLeft,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockDeals, MarketplaceDeal } from "@/hooks/useMockDeals";
import { BuyerSearch } from "@/components/marketplace-deals/BuyerSearch";
import { PropertyDetailMap } from "@/components/marketplace-deals/PropertyDetailMap";
import { BuyerActivitySearch } from "@/components/marketplace-deals/BuyerActivitySearch";
import { DealScore } from "@/components/marketplace-deals/DealScore";

type ViewMode = "flip" | "hold" | "buyers";
type LayoutMode = "detail" | "split";
type UserType = "investor" | "agent" | "investor-agent";

interface MessageTemplate {
  id: string;
  label: string;
  message: string;
}

const MESSAGE_TEMPLATES: Record<UserType, MessageTemplate[]> = {
  investor: [
    {
      id: "cash-offer",
      label: "💰 Cash Offer",
      message: `Hi {agentName},\n\nI'm interested in making a cash offer on {address}. I can close quickly (within 14-21 days) with no financing contingencies.\n\nWould you be open to discussing a purchase price of ${"{price}"}? I'm flexible on timing and can work around the seller's needs.\n\nLooking forward to your response.`,
    },
    {
      id: "as-is",
      label: "🔧 As-Is Offer",
      message: `Hi {agentName},\n\nI'm an investor looking to purchase {address} in as-is condition. I understand the property may need work and I'm prepared to take it as-is with no inspection contingencies.\n\nPlease let me know if the seller would entertain an offer in the ${"{priceRange}"} range.\n\nThank you!`,
    },
    {
      id: "creative",
      label: "🎯 Creative Terms",
      message: `Hi {agentName},\n\nI'm interested in {address} and wanted to explore some creative options that might work for the seller:\n\n• Subject-to existing financing\n• Seller financing with competitive terms\n• Lease-option arrangement\n\nWould any of these be of interest? Happy to discuss further.\n\nBest regards`,
    },
    {
      id: "info-request",
      label: "📋 Request Info",
      message: `Hi {agentName},\n\nI'm interested in {address} and would like to learn more before making an offer:\n\n• Current mortgage balance (if any)\n• Seller's timeline/motivation\n• Any known issues or repairs needed\n• Recent updates or renovations\n\nThank you for your time!`,
    },
  ],
  agent: [
    {
      id: "client-cash",
      label: "💰 Client Cash Offer",
      message: `Hi {agentName},\n\nI have a client who is very interested in {address}. They are a cash buyer looking to close within 21 days.\n\nMy client would like to submit an offer in the ${"{priceRange}"} range. Would the seller entertain offers at that level?\n\nPlease let me know if we can schedule a showing or if you need any pre-qualification documentation.\n\nBest regards`,
    },
    {
      id: "client-financed",
      label: "🏦 Client Financed",
      message: `Hi {agentName},\n\nI'm reaching out on behalf of a pre-approved buyer who is interested in {address}. My client has been pre-approved for ${"{loanAmount}"} and is looking for a 30-day close.\n\nWould the seller consider an offer near asking price with conventional financing?\n\nHappy to provide proof of funds and pre-approval letter.\n\nThank you!`,
    },
    {
      id: "showing-request",
      label: "🏠 Schedule Showing",
      message: `Hi {agentName},\n\nI have a qualified buyer interested in viewing {address}. Could we schedule a showing at your earliest convenience?\n\nMy client is flexible on timing. Please let me know your availability.\n\nThank you!`,
    },
  ],
  "investor-agent": [
    {
      id: "licensed-cash",
      label: "💰 Licensed Investor Cash",
      message: `Hi {agentName},\n\n**Disclosure: I am a licensed real estate agent purchasing for my own investment portfolio.**\n\nI'm interested in making a cash offer on {address}. I can close within 14-21 days with no financing contingencies.\n\nWould the seller consider an offer around ${"{price}"}? I'm flexible on terms and timing.\n\nLicense #: [Your License Number]\n\nBest regards`,
    },
    {
      id: "licensed-creative",
      label: "🎯 Licensed Creative Terms",
      message: `Hi {agentName},\n\n**Disclosure: I am a licensed agent acting as a principal buyer for my own investment.**\n\nI'm exploring creative acquisition options for {address}:\n\n• Subject-to existing financing\n• Seller financing\n• Lease-option\n\nWould any of these work for the seller?\n\nLicense #: [Your License Number]\n\nThank you!`,
    },
    {
      id: "licensed-info",
      label: "📋 Licensed Info Request",
      message: `Hi {agentName},\n\n**Disclosure: I am a licensed real estate professional inquiring for my own investment purposes.**\n\nI'd like to gather more information on {address} before submitting an offer:\n\n• Seller's motivation and timeline\n• Current mortgage status\n• Known repairs needed\n\nLicense #: [Your License Number]\n\nThank you for your time!`,
    },
  ],
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "highlights", label: "Highlights" },
  { id: "details", label: "Details" },
  { id: "map", label: "Map" },
  { id: "neighborhood", label: "Neighborhood" },
];

// Mock additional images
const mockImages = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
];

// Mock listing agent data
const mockAgent = {
  name: "Carolina Vassalo Coimbra",
  phone: "(305) 851-2820",
  email: "carolina45@gmail.com",
};

function DealRiskMeter({ arvPercent }: { arvPercent: number }) {
  const position = ((arvPercent - 50) / 50) * 100;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">Deal Risk</span>
        <span className="font-semibold text-primary">{arvPercent}% ARV</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-success" />
          <div className="flex-1 bg-warning" />
          <div className="flex-1 bg-destructive" />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-foreground rounded-full shadow-md"
          style={{ left: `${Math.min(Math.max(position, 0), 100)}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>50%</span>
        <span>70%</span>
        <span>85%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default function MarketplaceDealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState<UserType>("investor");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [showShareCopied, setShowShareCopied] = useState(false);
  const [compType, setCompType] = useState<"investor" | "retail">("retail");
  const [viewMode, setViewMode] = useState<ViewMode>("flip");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("detail");
  
  // Use shared saved deals hook
  const { isSaved, toggleSave } = useSavedDeals();

  // Get deal data from mock
  const { deals } = useMockDeals({
    filters: { address: "", leadType: "all", homeTypes: [], priceMin: "", priceMax: "", bedsMin: "", bathsMin: "" },
    sortBy: "newest",
    page: 1,
    perPage: 100,
  });

  const deal = deals.find((d) => d.id === id) || deals[0];

  if (!deal) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Deal not found</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate("/marketplace")}>
            Back to Marketplace
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Use deal's main image + mock additional images
  const images = [deal.imageUrl, ...mockImages.slice(0, 9)];

  // Mock last sold data
  const lastSoldPrice = 200000;
  const lastSoldDate = "May 2025";
  const priceChange = deal.price - lastSoldPrice;

  // Mock additional data
  const yearBuilt = 2006;
  const lotSize = 0.06;
  const pricePerSqft = Math.round(deal.price / deal.sqft);
  const hoaFee = 0;
  
  // Fix & Flip calculations
  const estRepairs = 20000;
  const holdingCosts = 8000;
  const closingCosts = Math.round(deal.arv * 0.06);
  const agentCommission = Math.round(deal.arv * 0.05);
  const totalCosts = deal.price + estRepairs + holdingCosts + closingCosts + agentCommission;
  const profit = deal.arv - totalCosts;
  const roi = Math.round((profit / (deal.price + estRepairs)) * 100);
  
  // Rental calculations
  const estRent = 1650;
  const propertyTax = Math.round((deal.price * 0.012) / 12);
  const insurance = Math.round((deal.price * 0.005) / 12);
  const mortgage = Math.round((deal.price * 0.8) * (0.07 / 12) / (1 - Math.pow(1 + 0.07 / 12, -360)));
  const estPiti = mortgage + propertyTax + insurance;
  const vacancy = Math.round(estRent * 0.05);
  const maintenance = Math.round(estRent * 0.08);
  const propertyMgmt = Math.round(estRent * 0.10);
  const netCashflow = estRent - estPiti - vacancy - maintenance - propertyMgmt;
  const noi = (estRent - vacancy - maintenance - propertyMgmt) * 12;
  const capRate = (noi / deal.price) * 100;
  const cashOnCash = ((netCashflow * 12) / (deal.price * 0.25)) * 100;
  const grm = deal.price / (estRent * 12);

  // Mock investor comps data (distressed/as-is sales)

  // Mock investor comps data (distressed/as-is sales)
  const investorComps = [
    {
      id: "1",
      address: "14234 Maple Lane",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft + 120,
      salePrice: Math.round(deal.arv * 0.68),
      saleDate: "2025-12-15",
      distanceMiles: 0.3,
      pricePerSqft: Math.round((deal.arv * 0.68) / (deal.sqft + 120)),
      similarity: 95,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "REO",
    },
    {
      id: "2",
      address: "7892 Oak Street",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft - 80,
      salePrice: Math.round(deal.arv * 0.62),
      saleDate: "2025-11-28",
      distanceMiles: 0.5,
      pricePerSqft: Math.round((deal.arv * 0.62) / (deal.sqft - 80)),
      similarity: 92,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "Short Sale",
    },
    {
      id: "3",
      address: "2456 Pine Drive",
      city: deal.city,
      state: deal.state,
      beds: deal.beds + 1,
      baths: deal.baths,
      sqft: deal.sqft + 350,
      salePrice: Math.round(deal.arv * 0.72),
      saleDate: "2025-10-10",
      distanceMiles: 0.8,
      pricePerSqft: Math.round((deal.arv * 0.72) / (deal.sqft + 350)),
      similarity: 78,
      isSelected: true,
      quality: "good" as const,
      saleType: "As-Is",
    },
    {
      id: "4",
      address: "9821 Cedar Way",
      city: deal.city,
      state: deal.state,
      beds: deal.beds - 1,
      baths: deal.baths - 0.5,
      sqft: deal.sqft - 300,
      salePrice: Math.round(deal.arv * 0.58),
      saleDate: "2025-09-22",
      distanceMiles: 1.1,
      pricePerSqft: Math.round((deal.arv * 0.58) / (deal.sqft - 300)),
      similarity: 72,
      isSelected: true,
      quality: "good" as const,
      saleType: "Auction",
    },
  ];

  // Mock retail comps data (standard MLS sales)
  const retailComps = [
    {
      id: "r1",
      address: "14234 Maple Lane",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft + 120,
      salePrice: deal.arv + 5000,
      saleDate: "2025-12-15",
      distanceMiles: 0.3,
      pricePerSqft: Math.round((deal.arv + 5000) / (deal.sqft + 120)),
      similarity: 95,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "Standard",
    },
    {
      id: "r2",
      address: "7892 Oak Street",
      city: deal.city,
      state: deal.state,
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft - 80,
      salePrice: deal.arv - 8000,
      saleDate: "2025-11-28",
      distanceMiles: 0.5,
      pricePerSqft: Math.round((deal.arv - 8000) / (deal.sqft - 80)),
      similarity: 92,
      isSelected: true,
      quality: "excellent" as const,
      saleType: "Standard",
    },
    {
      id: "r3",
      address: "2456 Pine Drive",
      city: deal.city,
      state: deal.state,
      beds: deal.beds + 1,
      baths: deal.baths,
      sqft: deal.sqft + 350,
      salePrice: deal.arv + 35000,
      saleDate: "2025-10-10",
      distanceMiles: 0.8,
      pricePerSqft: Math.round((deal.arv + 35000) / (deal.sqft + 350)),
      similarity: 78,
      isSelected: true,
      quality: "good" as const,
      saleType: "Standard",
    },
    {
      id: "r4",
      address: "9821 Cedar Way",
      city: deal.city,
      state: deal.state,
      beds: deal.beds - 1,
      baths: deal.baths - 0.5,
      sqft: deal.sqft - 300,
      salePrice: deal.arv - 25000,
      saleDate: "2025-09-22",
      distanceMiles: 1.1,
      pricePerSqft: Math.round((deal.arv - 25000) / (deal.sqft - 300)),
      similarity: 72,
      isSelected: true,
      quality: "good" as const,
      saleType: "Standard",
    },
  ];

  // Select active comps based on toggle
  const mockComps = compType === "investor" ? investorComps : retailComps;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Prepare comps data for map
  const mapComps = mockComps.map((comp) => ({
    id: comp.id,
    address: comp.address,
    beds: comp.beds,
    baths: comp.baths,
    sqft: comp.sqft,
    salePrice: comp.salePrice,
    pricePerSqft: comp.pricePerSqft,
    distanceMiles: comp.distanceMiles,
    similarity: comp.similarity,
    saleDate: comp.saleDate,
    quality: comp.quality,
    saleType: comp.saleType,
  }));

  const subjectForMap = {
    address: deal.address,
    city: deal.city,
    state: deal.state,
    zip: deal.zip,
    beds: deal.beds,
    baths: deal.baths,
    sqft: deal.sqft,
    price: deal.price,
    arv: deal.arv,
  };

  return (
    <AppLayout fullWidth={layoutMode === "split"}>
      <div className={cn(
        "flex flex-col h-full",
        layoutMode === "split" ? "overflow-hidden" : ""
      )}>
        {/* Top Navigation */}
        <div className={cn(
          "flex items-center justify-between mb-4 flex-shrink-0",
          layoutMode === "split" ? "px-4" : "max-w-7xl mx-auto w-full"
        )}>
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate("/marketplace")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Listings
            </Button>

            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === tab.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Layout Mode Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={layoutMode === "split" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setLayoutMode(layoutMode === "split" ? "detail" : "split")}
                  >
                    {layoutMode === "split" ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <Map className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {layoutMode === "split" ? "Close Map View" : "Open Map View"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => toggleSave(deal.id)}
            >
              <Heart className={cn("h-4 w-4", isSaved(deal.id) && "fill-destructive text-destructive")} />
              {isSaved(deal.id) ? "Saved" : "Save"}
            </Button>
            <Button variant="ghost" className="gap-2">
              <EyeOff className="h-4 w-4" />
              Hide
            </Button>
            <Button 
              variant="ghost" 
              className="gap-2"
              onClick={async () => {
                const shareData = {
                  title: `${deal.address} - $${deal.price.toLocaleString()}`,
                  text: `Check out this property: ${deal.address}, ${deal.city}, ${deal.state} - ${deal.beds} bed, ${deal.baths} bath, ${deal.sqft.toLocaleString()} sqft for $${deal.price.toLocaleString()}`,
                  url: window.location.href,
                };
                
                if (navigator.share && navigator.canShare?.(shareData)) {
                  try {
                    await navigator.share(shareData);
                  } catch (err) {
                    // User cancelled or error
                  }
                } else {
                  // Fallback: copy link to clipboard
                  await navigator.clipboard.writeText(window.location.href);
                  setShowShareCopied(true);
                  setTimeout(() => setShowShareCopied(false), 2000);
                }
              }}
            >
              {showShareCopied ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Area - Split or Detail Mode */}
        <div className={cn(
          "flex-1",
          layoutMode === "split" ? "flex overflow-hidden" : ""
        )}>
          {/* Map Panel - Only in Split Mode */}
          {layoutMode === "split" && (
            <div className="w-1/2 h-full border-r">
              <PropertyDetailMap
                subjectProperty={subjectForMap}
                comps={mapComps}
              />
            </div>
          )}

          {/* Detail Panel */}
          <div className={cn(
            layoutMode === "split" 
              ? "w-1/2 h-full overflow-y-auto p-4" 
              : "max-w-7xl mx-auto w-full"
          )}>
            {/* Image Gallery - Compact Layout */}
            <div className={cn(
              "flex gap-2 mb-6",
              layoutMode === "split" ? "h-[200px]" : "h-[320px]"
            )}>
          {/* Main Image - Takes ~60% width */}
          <div className="relative flex-[3] rounded-xl overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={deal.address}
              className="w-full h-full object-cover"
            />

            {/* For Sale Badge */}
            <Badge className="absolute top-3 left-3 bg-background text-foreground gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-success" />
              For sale
            </Badge>

            {/* Navigation Arrows */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-lg"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-lg"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Property Type Badge - Bottom Left */}
            <Badge className="absolute bottom-3 left-3 bg-success text-success-foreground shadow-md">
              {deal.propertyType}
            </Badge>

            {/* Media Controls - Bottom Right */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white gap-1.5 h-8 text-xs">
                <Rotate3d className="h-3.5 w-3.5" />
                3D Tour
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white gap-1.5 h-8 text-xs">
                <Video className="h-3.5 w-3.5" />
                Videos
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white gap-1.5 h-8 text-xs">
                <MapPin className="h-3.5 w-3.5" />
                Street View
              </Button>
            </div>
          </div>

          {/* Side Images Grid - 2x2 compact grid */}
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-2 flex-[2]">
            {images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                onClick={() => setCurrentImageIndex(idx + 1)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                {idx === 3 && (
                  <button 
                    className="absolute bottom-2 right-2 bg-white px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium shadow-md hover:bg-muted transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could open full gallery modal here
                    }}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    See All 10 Photos
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
              {(["flip", "hold", "buyers"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize",
                    viewMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "flip" ? "Flip" : mode === "hold" ? "Hold" : "Buyers"}
                </button>
              ))}
            </div>

            {/* Price, ARV & Address */}
            <div>
              <div className="flex items-center flex-wrap gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Price</span>
                  <span className="text-3xl font-bold">${deal.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">ARV</span>
                  <span className="text-3xl font-bold text-success">${deal.arv.toLocaleString()}</span>
                </div>
                {/* Last Sold - always shown since we only have Flip/Hold views */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Last Sold ${lastSoldPrice.toLocaleString()} ({lastSoldDate})
                  </span>
                  <span className={cn(
                    "flex items-center gap-0.5 text-sm font-semibold",
                    priceChange >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {priceChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {priceChange >= 0 ? "+" : ""}${Math.abs(priceChange).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="flex items-center gap-2 text-lg text-muted-foreground">
                <MapPin className="h-5 w-5" />
                {deal.address}, {deal.city}, {deal.state} {deal.zip}
              </p>
            </div>

            {/* Property Details Grid - 4 per row */}
            <div className="grid grid-cols-4 gap-3">
              {/* Row 1: Beds, Baths, Half Bath, SqFt */}
              <Card className="p-4 flex items-center gap-3">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{deal.beds} Beds</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{deal.baths} Baths</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">0 Half Bath</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{deal.sqft.toLocaleString()} SqFt</span>
              </Card>
              {/* Row 2: Year Built, Parking, Lot Size, Price/SqFt */}
              <Card className="p-4 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Built {yearBuilt}</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Car className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">2 Car Garage</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{lotSize} Acres</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">${pricePerSqft}/SqFt</span>
              </Card>
            </div>

            {/* Comparable Sales Section - Only shown on Flip view */}
            {viewMode === "flip" && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Comparable Sales</h2>
                  {/* Comp Type Toggle - Retail first */}
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
                <Badge variant="secondary">{mockComps.length} Selected Comps</Badge>
              </div>

              <div className="space-y-3">
                {mockComps.map((comp) => (
                  <div
                    key={comp.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-2 transition-colors",
                      comp.quality === "excellent" 
                        ? "border-emerald-200 bg-emerald-50/50" 
                        : "border-amber-200 bg-amber-50/50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{comp.address}</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            comp.quality === "excellent" 
                              ? "border-emerald-500 text-emerald-700 bg-emerald-100" 
                              : "border-amber-500 text-amber-700 bg-amber-100"
                          )}
                        >
                          {comp.similarity}% Match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{comp.beds} bd • {comp.baths} ba • {comp.sqft.toLocaleString()} sqft</span>
                        <span>{comp.distanceMiles} mi away</span>
                        <span>Sold {new Date(comp.saleDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${comp.salePrice.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">${comp.pricePerSqft}/sqft</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Excellent Match (90%+)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs text-muted-foreground">Good Match (70-89%)</span>
                  </div>
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Avg Comp Price:</span>{" "}
                  <span className="font-semibold">
                    ${Math.round(mockComps.reduce((sum, c) => sum + c.salePrice, 0) / mockComps.length).toLocaleString()}
                  </span>
                </p>
              </div>
            </Card>
            )}

            {/* Buyer Search - Shown on Flip/Hold views for exit strategy */}
            {(viewMode === "flip" || viewMode === "hold") && (
              <BuyerSearch
                subjectAddress={deal.address}
                subjectCity={deal.city}
                subjectState={deal.state}
                subjectPrice={deal.price}
                subjectArv={deal.arv}
              />
            )}

            {/* Buyer Activity Search - Shown on Buyers view */}
            {viewMode === "buyers" && (
              <BuyerActivitySearch
                subjectAddress={deal.address}
                subjectCity={deal.city}
                subjectState={deal.state}
                subjectPrice={deal.price}
              />
            )}

            {/* Investment Analysis - Conditional based on view mode */}
            {viewMode === "flip" && (
            <Card className="p-6 relative">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Flip Analysis</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Purchase Price</span>
                    <span className="font-medium">${deal.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">After Repair Value (ARV)</span>
                    <span className="font-medium text-primary">${deal.arv.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Est. Repairs</span>
                    <span className="font-medium text-destructive">-${estRepairs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Holding Costs</span>
                    <span className="font-medium text-destructive">-${holdingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Closing Costs (6%)</span>
                    <span className="font-medium text-destructive">-${closingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Agent Commission (5%)</span>
                    <span className="font-medium text-destructive">-${agentCommission.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Potential Profit</span>
                    <span className={cn(
                      "text-xl font-bold",
                      profit > 0 ? "text-success" : "text-destructive"
                    )}>
                      ${profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ROI</span>
                    <span className={cn(
                      "font-semibold",
                      roi >= 20 ? "text-success" : roi >= 10 ? "text-warning" : "text-destructive"
                    )}>
                      {roi}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ARV Ratio</span>
                    <span className="font-semibold">{deal.arvPercent}%</span>
                  </div>
                </div>

                {/* MAO Section */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Maximum Allowable Offer</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">MAO (70% Rule)</p>
                      <p className="text-lg font-bold text-primary">
                        ${Math.round(deal.arv * 0.70 - estRepairs).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">ARV × 70% − Repairs</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">WMAO (Wholesale)</p>
                      <p className="text-lg font-bold text-amber-600">
                        ${Math.round(deal.arv * 0.65 - estRepairs).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">ARV × 65% − Repairs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Conservative (60%)</p>
                      <p className="text-lg font-bold text-success">
                        ${Math.round(deal.arv * 0.60 - estRepairs).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Aggressive (75%)</p>
                      <p className="text-lg font-bold text-destructive">
                        ${Math.round(deal.arv * 0.75 - estRepairs).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <DealRiskMeter arvPercent={deal.arvPercent} />
              </div>
            </Card>
            )}

            {viewMode === "hold" && (
            <>
            {/* Deal Score Card */}
            <DealScore 
              score={Math.round(capRate * 10 + cashOnCash * 2)}
              showBadges={true}
              badges={[
                ...(netCashflow >= 200 ? [{ label: 'Strong Cash Flow', variant: 'success' as const }] : []),
                ...(capRate >= 6 ? [{ label: 'Low Risk', variant: 'success' as const }] : []),
                { label: `${capRate.toFixed(1)}% Cap`, variant: 'info' as const },
                ...(grm <= 12 ? [{ label: 'A+ Location', variant: 'warning' as const }] : []),
              ]}
            />

            {/* Key Metrics Summary */}
            <Card className="p-4 bg-gradient-to-r from-muted/50 to-muted/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className={cn(
                    "text-2xl font-bold",
                    cashOnCash >= 10 ? "text-success" : cashOnCash >= 6 ? "text-warning" : "text-muted-foreground"
                  )}>
                    {cashOnCash.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">ROI</p>
                </div>
                <div>
                  <p className={cn(
                    "text-2xl font-bold",
                    netCashflow >= 0 ? "text-success" : "text-destructive"
                  )}>
                    ${Math.abs(netCashflow).toLocaleString()}/mo
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Cash Flow</p>
                </div>
                <div>
                  <p className={cn(
                    "text-2xl font-bold",
                    capRate >= 8 ? "text-success" : capRate >= 5 ? "text-warning" : "text-muted-foreground"
                  )}>
                    {capRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Cap Rate</p>
                </div>
              </div>
            </Card>

            {/* AI Insight */}
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Insight</span>
                </div>
                <Badge variant="outline" className="ml-auto text-xs bg-success/10 text-success border-success/30">
                  3.1s
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Strong rental demand in {deal.zip}. Similar properties rent within 12 days. 
                {capRate >= 7 ? " Cap rate exceeds market average." : ""}
                {netCashflow >= 300 ? " Excellent monthly cash flow potential." : ""}
              </p>
            </Card>

            <Card className="p-6 relative">
              <div className="flex items-center gap-2 mb-6">
                <Home className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Rental Cashflow Analysis</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Purchase Price</span>
                    <span className="font-medium">${deal.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Est. Monthly Rent</span>
                    <span className="font-medium text-success">${estRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mortgage (P&I)</span>
                    <span className="font-medium">-${mortgage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Property Tax</span>
                    <span className="font-medium">-${propertyTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Insurance</span>
                    <span className="font-medium">-${insurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">PITI Total</span>
                    <span className="font-medium text-destructive">-${estPiti.toLocaleString()}/mo</span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Vacancy (5%)</span>
                    <span>-${vacancy}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Maintenance (8%)</span>
                    <span>-${maintenance}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Property Mgmt (10%)</span>
                    <span>-${propertyMgmt}</span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Net Cashflow</span>
                    <span className={cn(
                      "text-xl font-bold",
                      netCashflow >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {netCashflow >= 0 ? "+" : ""}${netCashflow.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Annual Cashflow</span>
                    <span className={cn(
                      "font-semibold",
                      netCashflow >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {netCashflow >= 0 ? "+" : ""}${(netCashflow * 12).toLocaleString()}/yr
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Cap Rate</p>
                      <p className={cn(
                        "text-xl font-bold",
                        capRate >= 8 ? "text-success" : capRate >= 5 ? "text-warning" : "text-muted-foreground"
                      )}>
                        {capRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {capRate >= 8 ? "Excellent" : capRate >= 6 ? "Good" : capRate >= 4 ? "Fair" : "Below Avg"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Cash-on-Cash</p>
                      <p className={cn(
                        "text-xl font-bold",
                        cashOnCash >= 10 ? "text-success" : cashOnCash >= 6 ? "text-warning" : "text-muted-foreground"
                      )}>
                        {cashOnCash.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cashOnCash >= 12 ? "Excellent" : cashOnCash >= 8 ? "Good" : cashOnCash >= 5 ? "Fair" : "Below Avg"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">GRM</p>
                      <p className="text-xl font-bold">{grm.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {grm <= 10 ? "Excellent" : grm <= 15 ? "Good" : "High"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">1% Rule</p>
                      <p className={cn(
                        "text-xl font-bold",
                        (estRent / deal.price * 100) >= 1 ? "text-success" : "text-warning"
                      )}>
                        {(estRent / deal.price * 100).toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(estRent / deal.price * 100) >= 1 ? "Passes ✓" : "Below 1%"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            </>
            )}

            {/* Lead Types */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Lead Types</p>
              <div className="flex flex-wrap gap-2">
                {deal.tags.map((tag, i) => (
                  <Badge key={i} className="bg-slate-700 text-white hover:bg-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* About This Home */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About This Home</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to this beautifully upgraded single-story home in the heart of {deal.city}! 
                This {deal.beds}-bedroom, {deal.baths}-bathroom gem features an open floor plan that's 
                perfect for entertaining. The spacious kitchen boasts an oversized island, stainless 
                steel appliances, and plenty of cabinet space—ideal for any home chef. Enjoy cozy evenings 
                by the fireplace in the inviting family room. You'll love the upgraded flooring throughout, 
                as well as the modern finishes in all bathrooms. The large backyard is a private oasis with 
                stylish pavers and room to relax or entertain. Plus, a 2-car garage adds convenience and extra storage.
              </p>
            </div>
          </div>

          {/* Sidebar - Agent Card with AI Templates */}
          <div className="space-y-4">
            <Card className="p-5 sticky top-6">
              {/* Agent Info */}
              <p className="text-sm text-muted-foreground mb-1">Listing Agent</p>
              <h3 className="text-lg font-semibold mb-3">{mockAgent.name}</h3>

              <div className="space-y-2 mb-4">
                <a
                  href={`tel:${mockAgent.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {mockAgent.phone}
                </a>
                <a
                  href={`mailto:${mockAgent.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {mockAgent.email}
                </a>
              </div>

              {/* User Type Toggle */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  I am a...
                </p>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setUserType("investor")}
                    className={cn(
                      "flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                      userType === "investor" 
                        ? "bg-brand text-white" 
                        : "bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <DollarSign className="h-3 w-3" />
                    Investor
                  </button>
                  <button
                    onClick={() => setUserType("agent")}
                    className={cn(
                      "flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border-x border-border",
                      userType === "agent" 
                        ? "bg-brand text-white" 
                        : "bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Briefcase className="h-3 w-3" />
                    Agent
                  </button>
                  <button
                    onClick={() => setUserType("investor-agent")}
                    className={cn(
                      "flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                      userType === "investor-agent" 
                        ? "bg-brand text-white" 
                        : "bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <BadgeCheck className="h-3 w-3" />
                    Licensed
                  </button>
                </div>
              </div>

              {/* AI Message Templates */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand" />
                  AI Message Templates
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {MESSAGE_TEMPLATES[userType].map((template) => (
                    <TooltipProvider key={template.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              const filledMessage = template.message
                                .replace("{agentName}", mockAgent.name.split(" ")[0])
                                .replace("{address}", deal.address)
                                .replace("{price}", `$${Math.round(deal.price * 0.9).toLocaleString()}`)
                                .replace("{priceRange}", `$${Math.round(deal.price * 0.85).toLocaleString()} - $${Math.round(deal.price * 0.92).toLocaleString()}`)
                                .replace("{loanAmount}", `$${Math.round(deal.price * 0.97).toLocaleString()}`);
                              setMessage(filledMessage);
                            }}
                            className="px-2.5 py-1.5 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors text-left truncate"
                          >
                            {template.label}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[250px]">
                          <p className="text-tiny">{template.label.replace(/[^\w\s]/g, '').trim()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  userType === "investor" 
                    ? "Write your offer message..." 
                    : userType === "agent"
                    ? "Write on behalf of your client..."
                    : "Write your message (include license disclosure)..."
                }
                className="min-h-[120px] mb-3 text-sm"
              />

              {/* Send Actions */}
              <div className="space-y-2">
                <Button variant="primary" className="w-full gap-2" disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" className="w-full gap-2 text-xs" size="sm">
                        <Mail className="h-3.5 w-3.5" />
                        Launch Campaign To Similar Listings
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[220px]">
                      <p className="text-tiny">Send this message to multiple agents with similar listings in one click</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Only HomesDaily Connects You To The Listing Agent.
              </p>
            </Card>
          </div>
        </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
