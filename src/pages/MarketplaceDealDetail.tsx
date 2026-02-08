import React, { useState } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useSavedDeals } from "@/hooks/useSavedDeals";
import { useSidebarState } from "@/contexts/SidebarContext";
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
  Share2,
  ChevronLeft,
  ChevronRight,
  Rotate3d,
  Video,
  MapPin,
  Camera,
  Phone,
  Mail,
  Sparkles,
  User,
  DollarSign,
  Briefcase,
  BadgeCheck,
  Send,
  Check,
  Users,
  Map,
  PanelLeftClose,
  FileText,
  Download,
  LayoutGrid,
  TrendingUp,
  Scale,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockDeals, MarketplaceDeal } from "@/hooks/useMockDeals";
import { PropertyDetailMap } from "@/components/marketplace-deals/PropertyDetailMap";
import { ContactPanel } from "@/components/marketplace-deals/ContactPanel";
import { BuyersPanel } from "@/components/marketplace-deals/BuyersPanel";
import { OverviewTab, MarketTab, CompsTab, AnalysisTab } from "@/components/marketplace-deals/property-detail";

type ViewMode = "flip" | "hold";
type LayoutMode = "detail" | "split";
type ContentTab = "overview" | "market" | "comps" | "analysis";
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

// Content tabs (left side)
const contentTabs = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "market", label: "Market", icon: TrendingUp },
  { id: "comps", label: "Comps", icon: Scale },
  { id: "analysis", label: "Analysis", icon: Calculator },
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

// Mock contact data
const mockContact = {
  name: "Carolina Vassalo Coimbra",
  phone: "(305) 851-2820",
  email: "carolina45@gmail.com",
  type: "agent" as "agent" | "seller",
};

// Session storage keys for persistent preferences
const DETAIL_VIEW_MODE_KEY = "marketplace-detail-view-mode";
const DETAIL_LAYOUT_MODE_KEY = "marketplace-detail-layout-mode";

function getStoredDetailViewMode(): ViewMode {
  if (typeof window === "undefined") return "flip";
  const stored = sessionStorage.getItem(DETAIL_VIEW_MODE_KEY);
  if (stored === "flip" || stored === "hold") return stored as ViewMode;
  return "flip";
}

function getStoredDetailLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return "detail";
  const stored = sessionStorage.getItem(DETAIL_LAYOUT_MODE_KEY);
  if (stored === "detail" || stored === "split") return stored as LayoutMode;
  return "detail";
}

export default function MarketplaceDealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isCollapsed: sidebarCollapsed } = useSidebarState();
  const [activeTab, setActiveTab] = useState<ContentTab>("overview");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState<UserType>("investor");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [showShareCopied, setShowShareCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("flip");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(getStoredDetailLayoutMode);
  const [showBuyersOnMap, setShowBuyersOnMap] = useState(false);

  // Persist view mode and layout mode changes to sessionStorage
  React.useEffect(() => {
    sessionStorage.setItem(DETAIL_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  React.useEffect(() => {
    sessionStorage.setItem(DETAIL_LAYOUT_MODE_KEY, layoutMode);
  }, [layoutMode]);
  
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

  // Mock retail comps data for map
  const retailComps = [
    {
      id: "r1",
      address: "14234 Maple Lane",
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft + 120,
      salePrice: deal.arv + 5000,
      pricePerSqft: Math.round((deal.arv + 5000) / (deal.sqft + 120)),
      distanceMiles: 0.3,
      similarity: 95,
      saleDate: "2025-12-15",
      quality: "excellent" as const,
      saleType: "Standard",
    },
    {
      id: "r2",
      address: "7892 Oak Street",
      beds: deal.beds,
      baths: deal.baths,
      sqft: deal.sqft - 80,
      salePrice: deal.arv - 8000,
      pricePerSqft: Math.round((deal.arv - 8000) / (deal.sqft - 80)),
      distanceMiles: 0.5,
      similarity: 92,
      saleDate: "2025-11-28",
      quality: "excellent" as const,
      saleType: "Standard",
    },
    {
      id: "r3",
      address: "2456 Pine Drive",
      beds: deal.beds + 1,
      baths: deal.baths,
      sqft: deal.sqft + 350,
      salePrice: deal.arv + 35000,
      pricePerSqft: Math.round((deal.arv + 35000) / (deal.sqft + 350)),
      distanceMiles: 0.8,
      similarity: 78,
      saleDate: "2025-10-10",
      quality: "good" as const,
      saleType: "Standard",
    },
    {
      id: "r4",
      address: "9821 Cedar Way",
      beds: deal.beds - 1,
      baths: deal.baths - 0.5,
      sqft: deal.sqft - 300,
      salePrice: deal.arv - 25000,
      pricePerSqft: Math.round((deal.arv - 25000) / (deal.sqft - 300)),
      distanceMiles: 1.1,
      similarity: 72,
      saleDate: "2025-09-22",
      quality: "good" as const,
      saleType: "Standard",
    },
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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

  // Mock buyers data for map
  const mockBuyersForMap = [
    { id: "1", name: "Marcus Johnson", company: "Johnson Investments LLC", buyerType: "flipper" as const, maxPrice: 350000, isVerified: true, dealsCompleted: 23 },
    { id: "2", name: "Sarah Chen", company: "Coastal Rentals Group", buyerType: "landlord" as const, maxPrice: 400000, isVerified: true, dealsCompleted: 45 },
    { id: "3", name: "David Williams", buyerType: "flipper" as const, maxPrice: 275000, isVerified: false, dealsCompleted: 12 },
    { id: "4", name: "Elena Rodriguez", company: "ER Property Holdings", buyerType: "landlord" as const, maxPrice: 500000, isVerified: true, dealsCompleted: 31 },
    { id: "5", name: "Mike Thompson", buyerType: "flipper" as const, maxPrice: 225000, isVerified: false, dealsCompleted: 8 },
    { id: "6", name: "Jessica Palmer", company: "Palm Realty Ventures", buyerType: "landlord" as const, maxPrice: 450000, isVerified: true, dealsCompleted: 28 },
    { id: "7", name: "Robert Kim", buyerType: "flipper" as const, maxPrice: 300000, isVerified: true, dealsCompleted: 15 },
    { id: "8", name: "Amanda Foster", company: "Foster Capital Group", buyerType: "landlord" as const, maxPrice: 600000, isVerified: true, dealsCompleted: 52 },
  ];

  // Filter buyers based on current view mode
  const filteredBuyersForMap = viewMode === "flip" 
    ? mockBuyersForMap.filter(b => b.buyerType === "flipper")
    : viewMode === "hold"
    ? mockBuyersForMap.filter(b => b.buyerType === "landlord")
    : mockBuyersForMap;

  const handleDownloadPdf = () => {
    toast.success("Generating PDF report...");
    // In real implementation, this would generate and download a PDF
  };

  return (
    <AppLayout fullWidth={layoutMode === "split"}>
      <div className={cn(
        "flex flex-col",
        layoutMode === "split" ? "flex-1 min-h-0 overflow-hidden" : ""
      )}>
        {/* Top Navigation */}
        <div className={cn(
          "flex items-center justify-between flex-shrink-0",
          layoutMode === "split" ? "px-4 py-2" : "max-w-7xl mx-auto w-full mb-4"
        )}>
          {/* Left Side: Back only */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate("/marketplace")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Listings
            </Button>
          </div>

          {/* Right Side: Map, Save, Share, PDF Actions */}
          <div className="flex items-center gap-2">
            {/* Layout Mode Toggle (Map) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={layoutMode === "split" ? "secondary" : "ghost"}
                    onClick={() => setLayoutMode(layoutMode === "split" ? "detail" : "split")}
                    className="gap-2"
                  >
                    {layoutMode === "split" ? (
                      <>
                        <PanelLeftClose className="h-4 w-4" />
                        Close Map
                      </>
                    ) : (
                      <>
                        <Map className="h-4 w-4" />
                        Map
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {layoutMode === "split" ? "Close Map" : "Show Map"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => toggleSave(deal.id)}
            >
              <Heart className={cn("h-4 w-4", isSaved(deal.id) && "fill-destructive text-destructive")} />
              Save
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

            {/* PDF Download */}
            <Button
              variant="ghost"
              className="gap-2"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Main Content Area - Split or Detail Mode */}
        <div className={cn(
          "flex-1",
          layoutMode === "split" ? "flex overflow-hidden min-h-0" : ""
        )}>
          {/* Map Panel - Only in Split Mode - Fixed/Locked */}
          {layoutMode === "split" && (
            <div className="w-1/2 h-full min-h-0 border-r overflow-hidden">
              <PropertyDetailMap
                subjectProperty={subjectForMap}
                comps={retailComps}
                buyers={mockBuyersForMap}
                showBuyers={showBuyersOnMap}
                onCloseBuyersView={() => setShowBuyersOnMap(false)}
              />
            </div>
          )}

          {/* Detail Panel - Scrollable */}
          <div className={cn(
            layoutMode === "split" 
              ? "w-1/2 h-full min-h-0 overflow-y-auto p-4" 
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

                {/* Status Badge */}
                <Badge className="absolute top-3 left-3 text-xs font-medium px-2 py-0.5 rounded shadow-md bg-primary text-primary-foreground">
                  For Sale
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
                <Badge className="absolute bottom-3 left-3 bg-primary text-primary-foreground shadow-md">
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
                        }}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        {layoutMode === "split" ? "+10" : "See All 10 Photos"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs Bar - Below Photos */}
            <div className="flex items-center justify-between mb-6">
              {/* Left: Content Tabs */}
              <div className="flex items-center gap-2">
                {contentTabs.map((tab) => {
                  const Icon = tab.icon;
                  // Show icons when: not in split mode, OR sidebar is collapsed
                  const showIcon = layoutMode !== "split" || sidebarCollapsed;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "secondary" : "ghost"}
                      onClick={() => setActiveTab(tab.id as ContentTab)}
                      className={cn(
                        activeTab === tab.id
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                        layoutMode === "split" && !sidebarCollapsed ? "gap-1 px-3" : "gap-2"
                      )}
                    >
                      {showIcon && <Icon className="h-4 w-4" />}
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              {/* Right: View Mode Toggle + Make Offer */}
              <div className="flex items-center gap-3">
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  {(["flip", "hold"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                        viewMode === mode
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {mode === "flip" ? "Flip" : "Hold"}
                    </button>
                  ))}
                </div>

                {/* Make Offer Button - only in split mode */}
                {layoutMode === "split" && (
                  <Button
                    onClick={() => navigate(`/marketplace/deal/${deal.id}/make-offer`)}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Make Offer
                  </Button>
                )}
              </div>
            </div>
            <div className={cn(
              "grid gap-6",
              layoutMode === "split" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
            )}>
              {/* Main Content */}
              <div className={cn(
                "space-y-6",
                layoutMode === "split" ? "" : "lg:col-span-2"
              )}>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <OverviewTab deal={deal} viewMode={viewMode} layoutMode={layoutMode} />
                )}
                {activeTab === "market" && (
                  <MarketTab deal={deal} viewMode={viewMode} />
                )}
                {activeTab === "comps" && (
                  <CompsTab deal={deal} viewMode={viewMode} />
                )}
                {activeTab === "analysis" && (
                  <AnalysisTab deal={deal} viewMode={viewMode} />
                )}

                {/* Agent Contact Card - Horizontal layout for split mode */}
                {layoutMode === "split" && (
                  <Card className="p-5">
                    {/* Row 1: Contact Info + User Type + Templates */}
                    <div className="flex flex-wrap items-start gap-6 mb-4">
                      {/* Contact Info */}
                      <div className="flex-shrink-0 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <Badge variant="secondary" className="text-xs">
                            {mockContact.type === "agent" ? "Agent" : "Seller"}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{mockContact.name}</h3>
                        <div className="space-y-1">
                          <a
                            href={`tel:${mockContact.phone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            {mockContact.phone}
                          </a>
                          <a
                            href={`mailto:${mockContact.email}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            {mockContact.email}
                          </a>
                        </div>
                      </div>

                      {/* User Type Toggle */}
                      <div className="flex-shrink-0">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          I am a...
                        </p>
                        <div className="flex rounded-lg border border-border overflow-hidden">
                          <button
                            onClick={() => setUserType("investor")}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                              userType === "investor" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-background hover:bg-muted text-muted-foreground"
                            )}
                          >
                            <DollarSign className="h-3 w-3" />
                            Investor
                          </button>
                          <button
                            onClick={() => setUserType("agent")}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border-x border-border",
                              userType === "agent" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-background hover:bg-muted text-muted-foreground"
                            )}
                          >
                            <Briefcase className="h-3 w-3" />
                            Agent
                          </button>
                          <button
                            onClick={() => setUserType("investor-agent")}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5",
                              userType === "investor-agent" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-background hover:bg-muted text-muted-foreground"
                            )}
                          >
                            <BadgeCheck className="h-3 w-3" />
                            Licensed
                          </button>
                        </div>
                      </div>

                      {/* AI Message Templates */}
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          AI Message Templates
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {MESSAGE_TEMPLATES[userType].map((template) => (
                            <button
                              key={template.id}
                              onClick={() => {
                                const filledMessage = template.message
                                  .replace("{agentName}", mockContact.name.split(" ")[0])
                                  .replace("{address}", deal.address)
                                  .replace("{price}", `$${Math.round(deal.price * 0.9).toLocaleString()}`)
                                  .replace("{priceRange}", `$${Math.round(deal.price * 0.85).toLocaleString()} - $${Math.round(deal.price * 0.92).toLocaleString()}`)
                                  .replace("{loanAmount}", `$${Math.round(deal.price * 0.97).toLocaleString()}`);
                                setMessage(filledMessage);
                              }}
                              className="px-2.5 py-1.5 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
                            >
                              {template.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Message Input - Full Width */}
                    <div className="flex gap-3">
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
                        className="flex-1 min-h-[80px] text-sm resize-none"
                      />
                      <div className="flex flex-col gap-2">
                        <Button className="gap-2 whitespace-nowrap" disabled={!message.trim()}>
                          <Send className="h-4 w-4" />
                          Send
                        </Button>
                        <Button variant="secondary" className="gap-2 text-xs whitespace-nowrap" size="sm">
                          <Mail className="h-3.5 w-3.5" />
                          Campaign
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar - Agent Card with AI Templates (Only in detail mode) */}
              {layoutMode !== "split" && (
                <div className="space-y-4">
                  {/* Make Offer Button - Full Width */}
                  <Button
                    onClick={() => navigate(`/marketplace/deal/${deal.id}/make-offer`)}
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <FileText className="h-4 w-4" />
                    Make Offer
                  </Button>

                  {/* Contact Panel - Collapsible */}
                  <ContactPanel
                    contact={mockContact}
                    propertyAddress={deal.address}
                    propertyPrice={deal.price}
                  />

                  {/* Buyers Panel - Collapsible */}
                  <BuyersPanel
                    viewMode={viewMode}
                    onShowOnMap={() => setLayoutMode("split")}
                    propertyAddress={deal.address}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
