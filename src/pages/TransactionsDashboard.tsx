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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Sparkles,
  FileSignature,
  Scale,
  Megaphone,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays, addDays } from "date-fns";
import { 
  TransactionStageId, 
  TRANSACTION_STAGES, 
  ACTIVE_STAGES,
  getStageConfig,
} from "@/lib/transaction-stages";
import { TCStageCompact } from "@/components/transactions/TCPipelineProgress";

// Mock transaction data - now uses TC stages (under contract and beyond)
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
    stage: "contract_signed" as TransactionStageId,
    contractDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    closingDate: addDays(new Date(), 28),
    nextDeadline: {
      label: "Earnest Money Due",
      date: addDays(new Date(), 1),
    },
    buyersMatched: 4,
    buyersInterested: 1,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    seller: {
      name: "Sarah Mitchell",
      phone: "(512) 555-0147",
      email: "sarah.mitchell@premierrealty.com",
    },
    hasUnreadMessages: false,
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
    stage: "due_diligence" as TransactionStageId,
    contractDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    closingDate: addDays(new Date(), 21),
    nextDeadline: {
      label: "Inspection Deadline",
      date: addDays(new Date(), 3),
    },
    buyersMatched: 6,
    buyersInterested: 2,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    seller: {
      name: "Mike Johnson",
      phone: "(512) 555-0199",
      email: "mike.johnson@realestate.com",
    },
    hasUnreadMessages: true,
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
    stage: "marketing" as TransactionStageId,
    contractDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    closingDate: addDays(new Date(), 14),
    nextDeadline: {
      label: "Find End Buyer",
      date: addDays(new Date(), 7),
    },
    buyersMatched: 8,
    buyersInterested: 3,
    lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    seller: {
      name: "Linda Williams",
      phone: "(512) 555-0211",
      email: "linda.williams@homes.com",
    },
    hasUnreadMessages: false,
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
    stage: "closing" as TransactionStageId,
    contractDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    closingDate: addDays(new Date(), 5),
    nextDeadline: {
      label: "Closing Date",
      date: addDays(new Date(), 5),
    },
    buyersMatched: 5,
    buyersInterested: 1,
    endBuyer: {
      name: "Marcus Williams",
      company: "Tampa Bay Investments",
    },
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    seller: {
      name: "Robert Brown",
      phone: "(512) 555-0222",
      email: "robert.brown@email.com",
    },
    hasUnreadMessages: false,
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
    stage: "sold" as TransactionStageId,
    contractDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    closingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    closedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    buyersMatched: 7,
    buyersInterested: 2,
    endBuyer: {
      name: "Jennifer Chen",
      company: "Sunshine State Holdings",
    },
    lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    seller: {
      name: "Jessica Davis",
      phone: "(512) 555-0188",
      email: "jessica.davis@remax.com",
    },
    hasUnreadMessages: false,
  },
];

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
  const [showDeadlinesModal, setShowDeadlinesModal] = useState(false);

  // Filter transactions
  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    const matchesSearch =
      tx.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === "all" || tx.stage === stageFilter;
    
    const matchesTab =
      activeTab === "active"
        ? tx.stage !== "sold" && tx.stage !== "cancelled"
        : activeTab === "closed"
        ? tx.stage === "sold"
        : tx.stage === "cancelled";
    
    return matchesSearch && matchesStage && matchesTab;
  });

  // Stats
  const activeTransactions = MOCK_TRANSACTIONS.filter(
    (tx) => tx.stage !== "sold" && tx.stage !== "cancelled"
  );
  const stats = {
    active: activeTransactions.length,
    dueDiligence: MOCK_TRANSACTIONS.filter(tx => tx.stage === "due_diligence").length,
    marketing: MOCK_TRANSACTIONS.filter(tx => tx.stage === "marketing").length,
    closing: MOCK_TRANSACTIONS.filter(tx => tx.stage === "closing").length,
    sold: MOCK_TRANSACTIONS.filter(tx => tx.stage === "sold").length,
    totalVolume: MOCK_TRANSACTIONS.filter(tx => tx.stage === "sold").reduce(
      (sum, tx) => sum + tx.contractPrice,
      0
    ),
    totalFees: MOCK_TRANSACTIONS.filter(tx => tx.stage === "sold").reduce(
      (sum, tx) => sum + tx.assignmentFee,
      0
    ),
  };

  // Upcoming deadlines (top 3 for banner)
  const upcomingDeadlines = activeTransactions
    .filter(tx => tx.nextDeadline)
    .sort((a, b) => 
      new Date(a.nextDeadline!.date).getTime() - new Date(b.nextDeadline!.date).getTime()
    )
    .slice(0, 3);

  // All deadlines for modal
  const allDeadlines = activeTransactions
    .filter(tx => tx.nextDeadline)
    .sort((a, b) => 
      new Date(a.nextDeadline!.date).getTime() - new Date(b.nextDeadline!.date).getTime()
    );

  const handleViewTransaction = (tx: typeof MOCK_TRANSACTIONS[0]) => {
    navigate(`/transactions/${tx.propertyId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transaction Coordinator</h1>
            <p className="text-muted-foreground">
              Manage deals under contract through closing
            </p>
          </div>
        </div>

        {/* AI Alert Banner */}
        {upcomingDeadlines.length > 0 && differenceInDays(new Date(upcomingDeadlines[0].nextDeadline!.date), new Date()) <= 2 && (
          <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  AI Deadline Alert
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                  <strong>{upcomingDeadlines[0].nextDeadline!.label}</strong> for{" "}
                  {upcomingDeadlines[0].address} is due{" "}
                  {formatDistanceToNow(new Date(upcomingDeadlines[0].nextDeadline!.date), { addSuffix: true })}.
                  {upcomingDeadlines.length > 1 && ` ${upcomingDeadlines.length - 1} more deadlines this week.`}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => setShowDeadlinesModal(true)}
              >
                View All Deadlines
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-primary/10 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-purple-500/10 mb-2">
                <Search className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">{stats.dueDiligence}</p>
              <p className="text-xs text-muted-foreground">Due Diligence</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-amber-500/10 mb-2">
                <Megaphone className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold">{stats.marketing}</p>
              <p className="text-xs text-muted-foreground">Marketing</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-emerald-500/10 mb-2">
                <Key className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold">{stats.closing}</p>
              <p className="text-xs text-muted-foreground">Closing</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-success/10 mb-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <p className="text-2xl font-bold">{stats.sold}</p>
              <p className="text-xs text-muted-foreground">Closed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-success/10 mb-2">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <p className="text-xl font-bold">{formatCurrency(stats.totalVolume)}</p>
              <p className="text-xs text-muted-foreground">Volume</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 rounded-lg bg-primary/10 mb-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xl font-bold">{formatCurrency(stats.totalFees)}</p>
              <p className="text-xs text-muted-foreground">Fees Earned</p>
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
                Closed ({stats.sold})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-2 border border-border bg-background data-[state=active]:bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4" />
                Cancelled (0)
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
                  <SelectItem value="contract_signed">Contract Signed</SelectItem>
                  <SelectItem value="due_diligence">Due Diligence</SelectItem>
                  <SelectItem value="title_escrow">Title & Escrow</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
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
                    ? "Get a deal under contract to start tracking here"
                    : activeTab === "closed"
                    ? "No closed transactions yet"
                    : "No cancelled transactions"}
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
                {filteredTransactions.map((tx) => (
                  <TransactionCard 
                    key={tx.id}
                    transaction={tx}
                    onClick={() => handleViewTransaction(tx)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* All Deadlines Modal */}
      <Dialog open={showDeadlinesModal} onOpenChange={setShowDeadlinesModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              All Upcoming Deadlines
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {allDeadlines.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming deadlines
                </p>
              ) : (
                allDeadlines.map((tx) => {
                  const deadlineDays = differenceInDays(new Date(tx.nextDeadline!.date), new Date());
                  const isUrgent = deadlineDays <= 2;
                  const isOverdue = deadlineDays < 0;
                  
                  return (
                    <Card 
                      key={tx.id} 
                      className={cn(
                        "p-3 cursor-pointer hover:shadow-md transition-shadow",
                        isOverdue && "border-destructive/50 bg-destructive/5",
                        isUrgent && !isOverdue && "border-amber-300 bg-amber-50"
                      )}
                      onClick={() => {
                        setShowDeadlinesModal(false);
                        navigate(`/transactions/${tx.propertyId}`);
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{tx.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.city}, {tx.state}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn(
                            "text-sm font-semibold",
                            isOverdue && "text-destructive",
                            isUrgent && !isOverdue && "text-amber-600"
                          )}>
                            {isOverdue 
                              ? `${Math.abs(deadlineDays)}d overdue`
                              : deadlineDays === 0 
                              ? "Today"
                              : `${deadlineDays}D Left`
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.nextDeadline!.label}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

interface TransactionCardProps {
  transaction: typeof MOCK_TRANSACTIONS[0];
  onClick: () => void;
}

function TransactionCard({ transaction: tx, onClick }: TransactionCardProps) {
  const daysToClose = tx.closingDate ? differenceInDays(new Date(tx.closingDate), new Date()) : null;
  const deadlineDays = tx.nextDeadline ? differenceInDays(new Date(tx.nextDeadline.date), new Date()) : null;

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
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
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span>
              Contract: <strong>{formatCurrency(tx.contractPrice)}</strong>
            </span>
            <span className="text-primary">
              Fee: <strong>{formatCurrency(tx.assignmentFee)}</strong>
            </span>
            {tx.buyersMatched && tx.buyersMatched > 0 && (
              <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                <Users className="h-3 w-3 mr-1" />
                {tx.buyersMatched} Buyers Matched
              </Badge>
            )}
            {tx.buyersInterested && tx.buyersInterested > 0 && (
              <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 bg-success/10 text-success border-success/30">
                <Users className="h-3 w-3 mr-1" />
                {tx.buyersInterested} Buyers Interested
              </Badge>
            )}
          </div>
        </div>

        {/* Deadline & Stage */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Next Deadline */}
          {tx.nextDeadline && deadlineDays !== null && (
            <div className="text-right">
              <p className={cn(
                "text-sm font-medium",
                deadlineDays <= 2 && "text-amber-600",
                deadlineDays < 0 && "text-destructive"
              )}>
                {deadlineDays < 0 
                  ? `${Math.abs(deadlineDays)}d overdue`
                  : deadlineDays === 0 
                  ? "Today"
                  : `${deadlineDays}D Left`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {tx.nextDeadline.label}
              </p>
            </div>
          )}

          {/* Days to Close */}
          {daysToClose !== null && tx.stage !== "sold" && (
            <div className="text-right">
              <p className="text-sm font-medium">
                {daysToClose}d
              </p>
              <p className="text-xs text-muted-foreground">To Close</p>
            </div>
          )}

          {/* Stage Badge */}
          <TCStageCompact stage={tx.stage} />

          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}
