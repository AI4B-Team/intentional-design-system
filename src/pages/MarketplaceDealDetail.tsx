import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockDeals, MarketplaceDeal } from "@/hooks/useMockDeals";

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [userType, setUserType] = useState<UserType>("investor");
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

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

  // Mock additional data
  const yearBuilt = 2006;
  const lotSize = 0.06;
  const pricePerSqft = Math.round(deal.price / deal.sqft);
  const hoaFee = 0;
  const estRepairs = 20000;
  const profit = deal.arv - deal.price - estRepairs;
  const estRent = 1650;
  const estPiti = 980;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
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
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-destructive text-destructive")} />
              Favorite
            </Button>
            <Button variant="ghost" className="gap-2">
              <EyeOff className="h-4 w-4" />
              Hide
            </Button>
            <Button variant="ghost" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Image Gallery - Compact Layout */}
        <div className="flex gap-2 mb-6 h-[320px]">
          {/* Main Image - Takes ~60% width */}
          <div className="relative flex-[3] rounded-xl overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={deal.address}
              className="w-full h-full object-cover"
            />

            {/* For Sale Badge */}
            <Badge className="absolute top-3 left-3 bg-white text-foreground gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
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

            {/* Bottom Controls */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
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
                    See all 10 photos
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
            {/* Price & Specs */}
            <div>
              <div className="flex items-center gap-6 mb-2">
                <h1 className="text-3xl font-bold">${deal.price.toLocaleString()}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Home className="h-4 w-4" />
                    <strong className="text-foreground">{deal.beds}</strong> Beds
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Home className="h-4 w-4" />
                    <strong className="text-foreground">{deal.baths}</strong> Baths
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4" />
                    <strong className="text-foreground">{deal.sqft.toLocaleString()}</strong> Sqft
                  </span>
                </div>
              </div>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {deal.address}, {deal.city}, {deal.state} {deal.zip}
              </p>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 flex items-center gap-3">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{deal.propertyType}</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Built in {yearBuilt}</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{lotSize} Acres Lot</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">${deal.arv.toLocaleString()} ARV</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">${pricePerSqft}/sqft</span>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">${hoaFee}/mo HOA</span>
              </Card>
            </div>

            {/* Investment Analysis */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Investment Analysis</h2>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Asking Price
                  </div>
                  <p className="text-xl font-bold">${deal.price.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    ARV
                  </div>
                  <p className="text-xl font-bold">${deal.arv.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Wrench className="h-4 w-4" />
                    Est. Repairs
                  </div>
                  <p className="text-xl font-bold">${estRepairs.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    Profit
                  </div>
                  <p className={cn("text-xl font-bold", profit > 0 ? "text-success" : "text-destructive")}>
                    ${profit.toLocaleString()}
                  </p>
                </div>
              </div>

              <DealRiskMeter arvPercent={deal.arvPercent} />

              <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Est. Rent</p>
                  <p className="text-xl font-bold">${estRent.toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Est. PITI</p>
                  <p className="text-xl font-bold">${estPiti.toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cashflow</p>
                  <p className={cn("text-xl font-bold", (estRent - estPiti) >= 0 ? "text-success" : "text-destructive")}>
                    {(estRent - estPiti) >= 0 ? "+" : ""}${(estRent - estPiti).toLocaleString()}/mo
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cap Rate</p>
                  <p className={cn(
                    "text-xl font-bold",
                    ((estRent * 12 * 0.6) / deal.price * 100) >= 8 ? "text-success" : 
                    ((estRent * 12 * 0.6) / deal.price * 100) >= 5 ? "text-warning" : "text-muted-foreground"
                  )}>
                    {((estRent * 12 * 0.6) / deal.price * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

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
                        Launch Campaign to Similar Listings
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[220px]">
                      <p className="text-tiny">Send this message to multiple agents with similar listings in one click</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Only <span className="font-medium">HomesDaily</span> connects you to the Listing Agent.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
