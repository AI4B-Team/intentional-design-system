import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockDeals, MarketplaceDeal } from "@/hooks/useMockDeals";

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
  const [message, setMessage] = useState("Hi Carolina, I would like to know more about this listing.");
  const [isFavorite, setIsFavorite] = useState(false);

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

        {/* Image Gallery */}
        <div className="flex gap-3 mb-6">
          {/* Main Image */}
          <div className="flex-[2] relative rounded-xl overflow-hidden">
            <div className="aspect-[4/3]">
              <img
                src={images[currentImageIndex]}
                alt={deal.address}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="bg-white/90 hover:bg-white gap-2">
                  <Rotate3d className="h-4 w-4" />
                  3D Tour
                </Button>
                <Button variant="secondary" className="bg-white/90 hover:bg-white gap-2">
                  <Video className="h-4 w-4" />
                  Videos
                </Button>
                <Button variant="secondary" className="bg-white/90 hover:bg-white gap-2">
                  <MapPin className="h-4 w-4" />
                  Street View
                </Button>
              </div>
              <div className="bg-white/90 px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium">
                <Camera className="h-4 w-4" />
                {currentImageIndex + 1}/{images.length}
              </div>
            </div>
          </div>

          {/* Side Images Grid - 2x2 grid that matches main image height */}
          <div className="hidden lg:flex flex-col flex-1 gap-3">
            <div className="flex gap-3 flex-1">
              {images.slice(1, 3).map((img, idx) => (
                <div
                  key={idx}
                  className="relative flex-1 rounded-xl overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => setCurrentImageIndex(idx + 1)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-1">
              {images.slice(3, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="relative flex-1 rounded-xl overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => setCurrentImageIndex(idx + 3)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {idx === 1 && images.length > 5 && (
                    <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium">
                      <Camera className="h-4 w-4" />
                      {images.length} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
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

          {/* Sidebar - Agent Card */}
          <div>
            <Card className="p-6 sticky top-6">
              <p className="text-sm text-muted-foreground mb-1">Listing Agent</p>
              <h3 className="text-lg font-semibold mb-4">{mockAgent.name}</h3>

              <div className="space-y-3 mb-6">
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

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                className="min-h-[100px] mb-4"
              />

              <Button variant="primary" className="w-full">
                Send Message
              </Button>

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
