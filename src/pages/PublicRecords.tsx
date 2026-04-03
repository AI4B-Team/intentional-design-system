import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  RecordsSidebar,
  RecordsTable,
  TABS,
  generatePublicRecords,
  RECORD_CATEGORIES,
  type PublicRecord,
  type TabId,
} from "@/components/public-records";
import {
  Search,
  Download,
  Mail,
  Phone,
  RefreshCw,
  MapPin,
  Flame,
  TrendingUp,
  Calendar,
  FileText,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicRecords() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // County/location from search params or default
  const locationParam = searchParams.get("location") || "Bexar County";
  const stateParam = searchParams.get("state") || "TX";

  const [county, setCounty] = React.useState(locationParam);
  const [stateCode, setStateCode] = React.useState(stateParam);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<TabId>("live");

  // Filters
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    RECORD_CATEGORIES.map(c => c.id)
  );
  const [selectedFlags, setSelectedFlags] = React.useState<string[]>([]);
  const [minScore, setMinScore] = React.useState(0);
  const [minAmount, setMinAmount] = React.useState("");
  const [maxAmount, setMaxAmount] = React.useState("");

  // Table state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortField, setSortField] = React.useState("sellerScore");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [showSidebar, setShowSidebar] = React.useState(true);

  // Generate data
  const allRecords = React.useMemo(
    () => generatePublicRecords(county, stateCode, 200),
    [county, stateCode]
  );

  // Filtered records
  const filteredRecords = React.useMemo(() => {
    let records = allRecords;

    // Tab filter
    if (activeTab === "foreclosures") {
      records = records.filter(r => r.category === "Foreclosure / Trustee");
    } else if (activeTab === "tax") {
      records = records.filter(r => r.category === "Tax Delinquent");
    } else if (activeTab === "probate") {
      records = records.filter(r => r.category === "Probate / Heirship");
    }

    // Category filter
    records = records.filter(r => selectedCategories.includes(r.category));

    // Score filter
    records = records.filter(r => r.sellerScore >= minScore);

    // Amount filter
    if (minAmount) records = records.filter(r => (r.amountDue || 0) >= Number(minAmount));
    if (maxAmount) records = records.filter(r => (r.amountDue || 0) <= Number(maxAmount));

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter(r =>
        r.address.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        r.docType.toLowerCase().includes(q)
      );
    }

    // Sort
    records = [...records].sort((a, b) => {
      const av = (a as any)[sortField];
      const bv = (b as any)[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return records;
  }, [allRecords, activeTab, selectedCategories, minScore, minAmount, maxAmount, searchQuery, sortField, sortDir]);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of allRecords) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return counts;
  }, [allRecords]);

  // Stats
  const hotLeads = allRecords.filter(r => r.sellerScore >= 80).length;
  const avgScore = allRecords.length > 0
    ? Math.round(allRecords.reduce((s, r) => s + r.sellerScore, 0) / allRecords.length)
    : 0;
  const newThisWeek = allRecords.filter(r => r.daysOnFile <= 7).length;
  const totalExposure = allRecords.reduce((s, r) => s + (r.amountDue || 0), 0);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleAddToPipeline = (record: PublicRecord) => {
    toast({
      title: "Added to Pipeline",
      description: `${record.address} has been added to your pipeline.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Records",
      description: `Exporting ${filteredRecords.length} records to CSV...`,
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: `Pulling latest records for ${county}, ${stateCode}...`,
    });
  };

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Intel", href: "/intel" },
        { label: "Public Records" },
      ]}
      fullWidth
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-h2 font-bold text-content">
                {county} Property Intelligence
              </h1>
              <Badge variant="outline" className="text-content-secondary">
                {stateCode}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleRefresh} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Records", value: allRecords.length.toLocaleString(), sub: "showing", icon: FileText, color: "text-brand" },
            { label: "Score 80+", value: hotLeads.toString(), sub: "hot leads", icon: Flame, color: "text-red-400" },
            { label: "Avg Score", value: avgScore.toString(), sub: "motivated seller", icon: TrendingUp, color: "text-amber-400" },
            { label: "New This Week", value: newThisWeek.toString(), sub: "filings", icon: Calendar, color: "text-emerald-400" },
            { label: "Total Exposure", value: `$${(totalExposure / 1000).toFixed(0)}k`, sub: "amount due", icon: MapPin, color: "text-purple-400" },
          ].map(stat => (
            <Card key={stat.label} className="border-border-subtle">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-content-tertiary uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                </div>
                <p className="text-h3 font-bold text-content tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-content-tertiary">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border-subtle pb-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-small font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-brand text-content"
                  : "border-transparent text-content-tertiary hover:text-content-secondary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              placeholder="Search address, owner, doc type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </Button>

            <select className="text-tiny bg-surface border border-border-subtle rounded-lg px-2 py-1.5 text-content-secondary">
              <option>Seller Score ↓</option>
              <option>Newest First</option>
              <option>Amount Due ↓</option>
              <option>Equity % ↓</option>
            </select>

            <Button variant="secondary" size="sm" onClick={handleExport} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar */}
          {showSidebar && (
            <RecordsSidebar
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              selectedFlags={selectedFlags}
              onFlagsChange={setSelectedFlags}
              minScore={minScore}
              onMinScoreChange={setMinScore}
              minAmount={minAmount}
              maxAmount={maxAmount}
              onMinAmountChange={setMinAmount}
              onMaxAmountChange={setMaxAmount}
              categoryCounts={categoryCounts}
            />
          )}

          {/* Table */}
          <div className="flex-1 min-w-0">
            <RecordsTable
              records={filteredRecords}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onAddToPipeline={handleAddToPipeline}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  ← Prev
                </Button>
                <span className="text-tiny text-content-secondary">
                  Page 1 of {Math.ceil(filteredRecords.length / 50)}
                </span>
                <Button variant="ghost" size="sm">
                  Next →
                </Button>
              </div>
              <span className="text-tiny text-content-tertiary tabular-nums">
                1-{Math.min(50, filteredRecords.length)} of {filteredRecords.length.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
