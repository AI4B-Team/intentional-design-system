import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  DollarSign,
  Users,
  FileCheck,
  Key,
  Target,
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  Home,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Mail,
  Phone,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: "tx-1",
    propertyId: "deal-1",
    address: "1234 Oak Street",
    city: "Tampa",
    state: "FL",
    zip: "33527",
    propertyType: "Single Family",
    offerAmount: 185000,
    arv: 285000,
    stage: "negotiation",
    status: "counter_received",
    counterOffer: 195000,
    offerSentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sellerName: "Sarah Mitchell",
    sellerEmail: "sarah@example.com",
    hasUnreadMessages: true,
    agent: {
      name: "Sarah Mitchell",
      phone: "(512) 555-0147",
      email: "sarah.mitchell@premierrealty.com",
    },
  },
  {
    id: "tx-2",
    propertyId: "deal-2",
    address: "567 Pine Avenue",
    city: "Brandon",
    state: "FL",
    zip: "33511",
    propertyType: "Townhouse",
    offerAmount: 145000,
    arv: 220000,
    stage: "due_diligence",
    status: "inspection_scheduled",
    acceptedOffer: 150000,
    offerSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sellerName: "Mike Johnson",
    sellerEmail: "mike@example.com",
    hasUnreadMessages: false,
    agent: {
      name: "Mike Johnson",
      phone: "(512) 555-0199",
      email: "mike.johnson@realestate.com",
    },
  },
  {
    id: "tx-3",
    propertyId: "deal-3",
    address: "890 Maple Drive",
    city: "Riverview",
    state: "FL",
    zip: "33578",
    propertyType: "Single Family",
    offerAmount: 210000,
    arv: 320000,
    stage: "closing",
    status: "docs_signed",
    acceptedOffer: 215000,
    offerSentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    closingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    sellerName: "Linda Williams",
    sellerEmail: "linda@example.com",
    hasUnreadMessages: false,
    agent: {
      name: "Linda Williams",
      phone: "(512) 555-0211",
      email: "linda.williams@homes.com",
    },
  },
  {
    id: "tx-4",
    propertyId: "deal-4",
    address: "321 Cedar Lane",
    city: "Valrico",
    state: "FL",
    zip: "33594",
    propertyType: "Single Family",
    offerAmount: 175000,
    arv: 260000,
    stage: "offer_sent",
    status: "awaiting_response",
    offerSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sellerName: "Robert Brown",
    sellerEmail: "robert@example.com",
    hasUnreadMessages: false,
    agent: null,
  },
  {
    id: "tx-5",
    propertyId: "deal-5",
    address: "456 Birch Court",
    city: "Tampa",
    state: "FL",
    zip: "33612",
    propertyType: "Duplex",
    offerAmount: 295000,
    arv: 420000,
    stage: "closed",
    status: "completed",
    acceptedOffer: 300000,
    offerSentAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    sellerName: "Jessica Davis",
    sellerEmail: "jessica@example.com",
    hasUnreadMessages: false,
    agent: {
      name: "Jessica Davis",
      phone: "(512) 555-0188",
      email: "jessica.davis@remax.com",
    },
  },
];

type TransactionStage = "offer_sent" | "negotiation" | "due_diligence" | "closing" | "closed" | "lost";

const STAGE_CONFIG: Record<TransactionStage, { label: string; icon: React.ReactNode; color: string }> = {
  offer_sent: {
    label: "Offer Sent",
    icon: <Mail className="h-4 w-4" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  negotiation: {
    label: "Negotiation",
    icon: <MessageSquare className="h-4 w-4" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
  },
  due_diligence: {
    label: "Due Diligence",
    icon: <FileCheck className="h-4 w-4" />,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
  closing: {
    label: "Closing",
    icon: <Key className="h-4 w-4" />,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  },
  closed: {
    label: "Closed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-success/10 text-success border-success/20",
  },
  lost: {
    label: "Lost",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TransactionsDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("active");

  // Filter transactions
  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    const matchesSearch =
      tx.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === "all" || tx.stage === stageFilter;
    
    const matchesTab =
      activeTab === "active"
        ? tx.stage !== "closed" && tx.stage !== "lost"
        : activeTab === "closed"
        ? tx.stage === "closed"
        : tx.stage === "lost";
    
    return matchesSearch && matchesStage && matchesTab;
  });

  // Stats
  const stats = {
    active: MOCK_TRANSACTIONS.filter(
      (tx) => tx.stage !== "closed" && tx.stage !== "lost"
    ).length,
    pendingResponse: MOCK_TRANSACTIONS.filter(
      (tx) => tx.stage === "offer_sent"
    ).length,
    inNegotiation: MOCK_TRANSACTIONS.filter(
      (tx) => tx.stage === "negotiation"
    ).length,
    closingSoon: MOCK_TRANSACTIONS.filter(
      (tx) => tx.stage === "closing"
    ).length,
    closed: MOCK_TRANSACTIONS.filter((tx) => tx.stage === "closed").length,
    totalVolume: MOCK_TRANSACTIONS.filter((tx) => tx.stage === "closed").reduce(
      (sum, tx) => sum + (tx.acceptedOffer || tx.offerAmount),
      0
    ),
  };

  const handleViewTransaction = (tx: typeof MOCK_TRANSACTIONS[0]) => {
    navigate(`/transactions/${tx.propertyId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
              Manage your active offers and transactions through closing
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingResponse}</p>
                <p className="text-xs text-muted-foreground">Pending Response</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inNegotiation}</p>
                <p className="text-xs text-muted-foreground">Negotiating</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Key className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.closingSoon}</p>
                <p className="text-xs text-muted-foreground">Closing Soon</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.closed}</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.totalVolume)}</p>
                <p className="text-xs text-muted-foreground">Closed Volume</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent gap-2 p-0">
              <TabsTrigger value="active" className="gap-2 border border-border bg-background data-[state=active]:bg-muted rounded-lg">
                <TrendingUp className="h-4 w-4" />
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="closed" className="gap-2 border border-border bg-background data-[state=active]:bg-muted rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                Closed ({stats.closed})
              </TabsTrigger>
              <TabsTrigger value="lost" className="gap-2 border border-border bg-background data-[state=active]:bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4" />
                Lost (0)
              </TabsTrigger>
            </TabsList>
            
            <div className="ml-auto">
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="offer_sent">Offer Sent</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="due_diligence">Due Diligence</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-4">
            {filteredTransactions.length === 0 ? (
              <Card className="p-12 text-center">
                <Home className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="font-semibold mt-4">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "active"
                    ? "Send offers to start tracking transactions here"
                    : activeTab === "closed"
                    ? "No closed transactions yet"
                    : "No lost transactions"}
                </p>
                {activeTab === "active" && (
                  <Button
                    onClick={() => navigate("/marketplace/deals")}
                    className="mt-4 gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Find Deals
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => {
                  const stageConfig = STAGE_CONFIG[tx.stage as TransactionStage];
                  
                  return (
                    <Card
                      key={tx.id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewTransaction(tx)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Property Image Placeholder */}
                        <div className="w-20 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Home className="h-6 w-6 text-muted-foreground/50" />
                        </div>

                        {/* Property Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{tx.address}</h3>
                            {tx.hasUnreadMessages && (
                              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {tx.city}, {tx.state} {tx.zip}
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{tx.propertyType}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span>
                              Offer: <strong>{formatCurrency(tx.offerAmount)}</strong>
                            </span>
                            {tx.counterOffer && (
                              <>
                                <span className="text-muted-foreground/50">→</span>
                                <span className="text-amber-600">
                                  Counter: <strong>{formatCurrency(tx.counterOffer)}</strong>
                                </span>
                              </>
                            )}
                            {tx.acceptedOffer && (
                              <>
                                <span className="text-muted-foreground/50">→</span>
                                <span className="text-success">
                                  Accepted: <strong>{formatCurrency(tx.acceptedOffer)}</strong>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Stage & Actions */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <Badge className={cn("gap-1", stageConfig.color)}>
                              {stageConfig.icon}
                              {stageConfig.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(tx.lastActivity), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
