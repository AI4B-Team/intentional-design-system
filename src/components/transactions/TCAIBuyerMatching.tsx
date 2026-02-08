import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Users,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Send,
  Eye,
  MessageSquare,
  Zap,
  RefreshCcw,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface MatchedBuyer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  matchScore: number;
  buyingCriteria: {
    maxPrice: number;
    propertyTypes: string[];
    markets: string[];
    closeDays: number;
  };
  recentActivity: {
    dealsViewed: number;
    dealsPurchased: number;
    avgCloseTime: number;
  };
  status: "new" | "contacted" | "interested" | "passed";
  lastContactedAt?: Date;
}

interface TCAIBuyerMatchingProps {
  propertyAddress: string;
  askingPrice: number;
  arv: number;
  propertyType: string;
  market: string;
  className?: string;
}

// Mock matched buyers based on property criteria
const generateMockBuyers = (askingPrice: number): MatchedBuyer[] => [
  {
    id: "b1",
    name: "Marcus Williams",
    company: "Tampa Bay Investments",
    email: "marcus@tampabayinv.com",
    phone: "(813) 555-0142",
    matchScore: 95,
    buyingCriteria: {
      maxPrice: askingPrice * 1.2,
      propertyTypes: ["Single Family", "Duplex"],
      markets: ["Tampa", "Brandon", "Riverview"],
      closeDays: 14,
    },
    recentActivity: {
      dealsViewed: 24,
      dealsPurchased: 8,
      avgCloseTime: 12,
    },
    status: "new",
  },
  {
    id: "b2",
    name: "Jennifer Chen",
    company: "Sunshine State Holdings",
    email: "jchen@sunshinestate.com",
    phone: "(813) 555-0198",
    matchScore: 88,
    buyingCriteria: {
      maxPrice: askingPrice * 1.1,
      propertyTypes: ["Single Family"],
      markets: ["Tampa", "St. Petersburg"],
      closeDays: 21,
    },
    recentActivity: {
      dealsViewed: 18,
      dealsPurchased: 5,
      avgCloseTime: 18,
    },
    status: "contacted",
    lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "b3",
    name: "David Rodriguez",
    company: "FlipMasters LLC",
    email: "david@flipmasters.com",
    matchScore: 82,
    buyingCriteria: {
      maxPrice: askingPrice * 0.95,
      propertyTypes: ["Single Family", "Townhouse"],
      markets: ["Tampa", "Brandon"],
      closeDays: 10,
    },
    recentActivity: {
      dealsViewed: 45,
      dealsPurchased: 12,
      avgCloseTime: 9,
    },
    status: "interested",
    lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "b4",
    name: "Sarah Thompson",
    email: "sarah.t@gmail.com",
    phone: "(727) 555-0156",
    matchScore: 76,
    buyingCriteria: {
      maxPrice: askingPrice * 1.05,
      propertyTypes: ["Single Family"],
      markets: ["Tampa"],
      closeDays: 30,
    },
    recentActivity: {
      dealsViewed: 8,
      dealsPurchased: 2,
      avgCloseTime: 25,
    },
    status: "new",
  },
];

export function TCAIBuyerMatching({
  propertyAddress,
  askingPrice,
  arv,
  propertyType,
  market,
  className,
}: TCAIBuyerMatchingProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [buyers, setBuyers] = useState<MatchedBuyer[]>(() => 
    generateMockBuyers(askingPrice)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAutoOutreach = async () => {
    setIsAnalyzing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newBuyers = buyers.filter(b => b.status === "new");
    setBuyers(prev => 
      prev.map(b => 
        b.status === "new" 
          ? { ...b, status: "contacted" as const, lastContactedAt: new Date() }
          : b
      )
    );
    
    toast.success(`${newBuyers.length} buyer outreach messages sent to Inbox`, {
      description: "AI has drafted personalized messages for each matching buyer"
    });
    setIsAnalyzing(false);
  };

  const handleRefreshMatches = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBuyers(generateMockBuyers(askingPrice));
    toast.success("Buyer matches refreshed");
    setIsAnalyzing(false);
  };

  const handleContactBuyer = (buyer: MatchedBuyer) => {
    setBuyers(prev =>
      prev.map(b =>
        b.id === buyer.id
          ? { ...b, status: "contacted" as const, lastContactedAt: new Date() }
          : b
      )
    );
    toast.success(`Message draft created for ${buyer.name}`, {
      description: "Check your Inbox to send"
    });
  };

  const interestedCount = buyers.filter(b => b.status === "interested").length;
  const contactedCount = buyers.filter(b => b.status === "contacted").length;
  const newCount = buyers.filter(b => b.status === "new").length;

  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Buyer Matching</h3>
            <p className="text-sm text-muted-foreground">
              {buyers.length} buyers match this deal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshMatches}
            disabled={isAnalyzing}
            className="gap-1.5"
          >
            <RefreshCcw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleAutoOutreach}
            disabled={isAnalyzing || newCount === 0}
            className="gap-1.5"
          >
            <Zap className="h-4 w-4" />
            Auto-Outreach ({newCount})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span>New Matches</span>
          </div>
          <p className="text-xl font-bold">{newCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10">
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
            <Send className="h-4 w-4" />
            <span>Contacted</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{contactedCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-success/10">
          <div className="flex items-center gap-2 text-sm text-success mb-1">
            <Target className="h-4 w-4" />
            <span>Interested</span>
          </div>
          <p className="text-xl font-bold text-success">{interestedCount}</p>
        </div>
      </div>

      {/* AI Insight */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary">AI Recommendation</p>
            <p className="text-muted-foreground mt-0.5">
              Based on recent activity, <strong>Marcus Williams</strong> and{" "}
              <strong>David Rodriguez</strong> have the highest close probability. 
              They've purchased {buyers[0].recentActivity.dealsPurchased + buyers[2].recentActivity.dealsPurchased} deals 
              in the last 90 days at an average of {Math.round((buyers[0].recentActivity.avgCloseTime + buyers[2].recentActivity.avgCloseTime) / 2)} days to close.
            </p>
          </div>
        </div>
      </div>

      {/* Buyer List */}
      <div className="space-y-2">
        {buyers.slice(0, 4).map((buyer) => (
          <BuyerCard 
            key={buyer.id} 
            buyer={buyer} 
            askingPrice={askingPrice}
            onContact={handleContactBuyer}
          />
        ))}
      </div>

      {buyers.length > 4 && (
        <Button variant="ghost" className="w-full mt-2 gap-2">
          View All {buyers.length} Matching Buyers
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}

interface BuyerCardProps {
  buyer: MatchedBuyer;
  askingPrice: number;
  onContact: (buyer: MatchedBuyer) => void;
}

function BuyerCard({ buyer, askingPrice, onContact }: BuyerCardProps) {
  const getStatusBadge = () => {
    switch (buyer.status) {
      case "interested":
        return (
          <Badge className="bg-success/10 text-success border-success/20 gap-1">
            <Target className="h-3 w-3" />
            Interested
          </Badge>
        );
      case "contacted":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 gap-1">
            <Clock className="h-3 w-3" />
            Contacted
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            New Match
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {buyer.name.split(" ").map(n => n[0]).join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{buyer.name}</span>
          {getStatusBadge()}
        </div>
        {buyer.company && (
          <p className="text-sm text-muted-foreground truncate">{buyer.company}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Max: {formatCurrency(buyer.buyingCriteria.maxPrice)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {buyer.buyingCriteria.closeDays}d close
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {buyer.recentActivity.dealsPurchased} deals
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Match Score */}
        <div className="text-center">
          <div className={cn(
            "text-lg font-bold",
            buyer.matchScore >= 90 && "text-success",
            buyer.matchScore >= 75 && buyer.matchScore < 90 && "text-primary",
            buyer.matchScore < 75 && "text-amber-600"
          )}>
            {buyer.matchScore}%
          </div>
          <p className="text-xs text-muted-foreground">Match</p>
        </div>

        {buyer.status === "new" ? (
          <Button 
            size="sm" 
            onClick={() => onContact(buyer)}
            className="gap-1"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            View
          </Button>
        )}
      </div>
    </div>
  );
}
