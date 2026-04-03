import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Search, MapPin, DollarSign, Home, Clock, Users, Zap, Check,
  Download, Star, ArrowUpRight, ArrowDownRight, BarChart3, Activity,
  Building, Percent, Rocket, TrendingUp, Brain, Megaphone, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/intel/InfoTooltip";
import { ActivityTrendsTab } from "@/components/intel/ActivityTrendsTab";
import { CampaignLauncherTab } from "@/components/intel/CampaignLauncherTab";
import { BuyerIntelTab } from "@/components/intel/BuyerIntelTab";
import { MarketCompareTab } from "@/components/intel/MarketCompareTab";
import { HotSpotsView } from "@/components/intel/HotSpotsView";
import { VelocityView } from "@/components/intel/VelocityView";
import { FlipTrackerView } from "@/components/intel/FlipTrackerView";
import { RentalIntelView } from "@/components/intel/RentalIntelView";
import { AIBuyBoxView } from "@/components/intel/AIBuyBoxView";
import { Flame, Repeat } from "lucide-react";

// ---------- Seeded random for consistent per-market dummy data ----------
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function generateMarketData(marketName: string, timeRange: string = "6M") {
  const rand = seededRandom(marketName.toLowerCase() + timeRange);
  const r = (min: number, max: number) => Math.round(min + rand() * (max - min));
  const rf = (min: number, max: number, dec = 1) => parseFloat((min + rand() * (max - min)).toFixed(dec));
  const timeMultiplier = timeRange === "1M" ? 0.2 : timeRange === "3M" ? 0.5 : timeRange === "6M" ? 1 : 1.8;

  const totalSales = Math.round(r(200, 900) * timeMultiplier);
  const cashRate = rf(30, 85);
  const cashSales = Math.round(totalSales * cashRate / 100);
  const retailSales = totalSales - cashSales;
  const medianPrice = r(40000, 350000);
  const dom = r(20, 130);
  const inventory = Math.round(r(80, 500) * timeMultiplier);
  const rent = r(800, 2200);
  const capRate = rf(4.0, 10.0);

  // MSA lookup (simplified)
  const msaMap: Record<string, string> = {
    tampa: "Tampa-St. Pete-Clearwater", miami: "Miami-Fort Lauderdale-Pompano Beach",
    orlando: "Orlando-Kissimmee-Sanford", jacksonville: "Jacksonville, FL",
    atlanta: "Atlanta-Sandy Springs-Alpharetta", houston: "Houston-The Woodlands-Sugar Land",
    dallas: "Dallas-Fort Worth-Arlington", phoenix: "Phoenix-Mesa-Chandler",
    charlotte: "Charlotte-Concord-Gastonia", austin: "Austin-Round Rock-Georgetown",
  };
  const key = marketName.toLowerCase().split(",")[0].trim();
  const msa = msaMap[key] || `${marketName} Metropolitan Area`;

  // Generate zip codes
  const baseZip = r(10000, 99000);
  const neighborhoodNames = ["Downtown", "Midtown", "Westside", "Eastside", "North End", "Southport", "Lakewood", "Riverside"];
  const zips = neighborhoodNames.map((name, i) => {
    const ts = r(20, 180);
    const cr = rf(30, 97);
    const cs = Math.round(ts * cr / 100);
    return {
      zip: String(baseZip + i * r(1, 15)),
      name,
      ts, cs, rs: ts - cs,
      mp: r(35000, 300000),
      dom: r(15, 140),
      cr,
      score: r(55, 99),
      rent: r(750, 2400),
      cap: rf(4.0, 10.0),
    };
  });

  const priceRanges = [
    { range: "Under $50K", cash: r(0, 250), retail: r(0, 20) },
    { range: "$50-100K", cash: r(20, 180), retail: r(10, 60) },
    { range: "$100-150K", cash: r(10, 80), retail: r(15, 70) },
    { range: "$150-200K", cash: r(5, 40), retail: r(15, 50) },
    { range: "$200-250K", cash: r(2, 20), retail: r(10, 40) },
    { range: "$250-300K", cash: r(0, 10), retail: r(5, 25) },
    { range: "$300-350K", cash: r(0, 5), retail: r(3, 15) },
    { range: "$350K+", cash: r(0, 3), retail: r(2, 20) },
  ];

  return {
    market: marketName,
    msa,
    updated: "Feb 20, 2026",
    summary: {
      totalSales, cashSales, retailSales,
      medianPrice, dom, cashRate,
      inventory, rent, capRate,
      priceGrowth: rf(-2, 8), rentGrowth: rf(0, 9),
    },
    scores: {
      market: r(40, 95), cash: r(40, 98), flip: r(30, 90),
      rental: r(40, 95), wholesale: r(40, 98),
    },
    zips,
    priceRanges,
  };
}

// Default fallback data
const DEFAULT_MARKET = "Port Richey, FL";

// ---------- Gauge Component ----------
function ScoreGauge({ score, label, icon: Icon, color, large = false }: {
  score: number; label: string; icon: React.ElementType; color: string; large?: boolean;
}) {
  const size = large ? 96 : 60;
  const strokeWidth = large ? 7 : 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : "C";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-border" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold" style={{ color, fontSize: large ? 22 : 15 }}>{score}</span>
          {large && <span className="text-muted-foreground text-[9px]">{grade}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Icon size={11} className="text-muted-foreground" />
        <span className={cn("text-muted-foreground", large ? "text-[11px]" : "text-[9px]")}>{label}</span>
      </div>
    </div>
  );
}

// ---------- Metric Card ----------
function MetricCard({ label, value, change, prefix = "", suffix = "", icon: Icon, color = "hsl(var(--primary))", info }: {
  label: string; value: string | number; change?: number; prefix?: string; suffix?: string;
  icon?: React.ElementType; color?: string; info?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wider">
          {label}
          {info && <InfoTooltip text={info} size={11} />}
        </span>
        {Icon && <Icon size={13} style={{ color }} />}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-foreground text-xl font-bold">
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </span>
        {change !== undefined && (
          <span className={cn("flex items-center gap-0.5 pb-0.5 text-[10px] font-semibold",
            change > 0 ? "text-emerald-500" : "text-red-500")}>
            {change > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ---------- Custom Tooltip ----------
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-muted-foreground text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground text-[10px]">{p.name}: </span>
          <span className="text-foreground text-[10px] font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Colors ----------
const COLORS = {
  primary: "hsl(var(--primary))",
  cyan: "#06B6D4",
  warning: "#F59E0B",
  danger: "#EF4444",
  accent: "#3B82F6",
  purple: "#8B5CF6",
};

// ---------- Tabs ----------
const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "activity", label: "Activity & Trends", icon: Activity },
  { key: "buyers", label: "Buyer Activity", icon: Users },
  { key: "compare", label: "Compare Markets", icon: TrendingUp },
  { key: "campaign", label: "Campaign Launcher", icon: Megaphone },
  { key: "public-records", label: "Public Records", icon: Eye },
] as const;

type TabKey = typeof TABS[number]["key"];

const OVERVIEW_SUBTABS = [
  { key: "summary", label: "Summary" },
  { key: "hotspots", label: "Hot Spots" },
  { key: "velocity", label: "Velocity" },
  { key: "flips", label: "Flip Intel" },
  { key: "rental", label: "Rental Intel" },
  { key: "buybox", label: "AI Buy Box" },
] as const;

type OverviewSubTab = typeof OVERVIEW_SUBTABS[number]["key"];

// ---------- Main Component ----------
export default function Intel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addressParam = searchParams.get("address") || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("cr");
  const [timeRange, setTimeRange] = useState("6M");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [overviewSubTab, setOverviewSubTab] = useState<OverviewSubTab>("summary");

  // Generate market data based on search query
  const displayMarket = addressParam
    ? addressParam.charAt(0).toUpperCase() + addressParam.slice(1)
    : DEFAULT_MARKET;

  const MARKET_DATA = useMemo(() => generateMarketData(displayMarket, timeRange), [displayMarket, timeRange]);

  const toggleZip = (zip: string) =>
    setSelectedZips((prev) => prev.includes(zip) ? prev.filter((z) => z !== zip) : [...prev, zip]);

  const sortedZips = useMemo(
    () => [...MARKET_DATA.zips].sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]),
    [sortBy, MARKET_DATA.zips]
  );

  const D = MARKET_DATA;

  return (
    <PageLayout fullWidth>
      <div className="space-y-4 p-4 lg:p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Market Intelligence</h1>
          <p className="text-muted-foreground text-sm">Real-time market analysis</p>
        </div>

        {/* Market Info Banner */}
        <div className="bg-[hsl(45,100%,95%)] border border-[hsl(40,90%,65%)] rounded-xl px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-warning" />
              <h2 className="text-base font-bold text-foreground">{displayMarket}</h2>
              <span className="bg-warning/20 text-warning px-2 py-0.5 rounded-full text-[10px] font-semibold">Hot Market</span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">
              MSA: {D.msa} · Updated {D.updated} · {D.summary.totalSales} transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["1M", "3M", "6M", "1Y"].map((t) => (
              <Button key={t} variant={timeRange === t ? "default" : "secondary"} size="sm"
                onClick={() => setTimeRange(t)}>
                {t}
              </Button>
            ))}
            <Button variant="secondary" size="sm" icon={<Download className="h-3 w-3" />}>Export</Button>
            <Button variant="secondary" size="sm" icon={<Star className="h-3 w-3" />}>Watchlist</Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border pb-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
                activeTab === tab.key
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Scores */}
            <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-3">
                <h3 className="text-[13px] font-bold text-foreground capitalize">Market Scores</h3>
                <InfoTooltip text="Composite scores (0-100) measuring market attractiveness for each investment strategy. Based on transaction volume, pricing trends, investor activity, and rental yields." />
              </div>
              <div className="flex items-center justify-around flex-wrap gap-4">
              <ScoreGauge score={D.scores.market} label="Market" icon={BarChart3} color={COLORS.primary} large />
              <div className="w-px h-11 bg-border hidden sm:block" />
              <ScoreGauge score={D.scores.cash} label="Inventory" icon={DollarSign} color={COLORS.cyan} />
              <ScoreGauge score={D.scores.wholesale} label="Days On Market" icon={Zap} color={D.summary.dom <= 30 ? COLORS.primary : D.summary.dom <= 60 ? COLORS.warning : COLORS.danger} />
              <ScoreGauge score={D.scores.flip} label="Flippers" icon={Home} color="#10B981" />
              <ScoreGauge score={D.scores.rental} label="Landlords" icon={Building} color={COLORS.warning} />
              </div>
            </div>

            {/* Overview Sub-tabs */}
            <div className="flex gap-1.5 overflow-x-auto">
              {OVERVIEW_SUBTABS.map((st) => (
                <button key={st.key} onClick={() => setOverviewSubTab(st.key)}
                  className={cn("px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border",
                    overviewSubTab === st.key
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20")}>
                  {st.label}
                </button>
              ))}
            </div>

            {overviewSubTab === "summary" && (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <MetricCard label="Inventory" value={D.summary.inventory} suffix=" active" change={-2.0} icon={Building} color={COLORS.cyan} info="Number of currently active listings. Lower inventory often means stronger seller position." />
                  <MetricCard label="Median Price" value={D.summary.medianPrice} prefix="$" change={D.summary.priceGrowth} icon={DollarSign} info="Middle sale price across all transactions in the selected time range." />
                  <MetricCard label="Total Transactions" value={D.summary.totalSales} change={2.8} icon={Activity} color={COLORS.accent} info="Total number of closed transactions (cash + retail) in this market." />
                  <MetricCard label="Investor %" value={`${D.summary.cashRate}%`} icon={Users} color={COLORS.cyan} info="Percentage of transactions that were investor purchases — higher means more investor activity." />
                  <MetricCard label="Avg DOM" value={D.summary.dom} suffix=" days" change={-5.2} icon={Clock} color={COLORS.warning} info="Average Days on Market before a property sells. Lower = faster-moving market." />
                  <MetricCard label="Cap Rate" value={`${D.summary.capRate}%`} change={0.3} icon={Percent} color={COLORS.purple} info="Capitalization rate — annual net rental income divided by property price. Higher = better rental returns." />
                  <MetricCard label="Avg Rent" value={D.summary.rent} prefix="$" suffix="/mo" change={D.summary.rentGrowth} icon={Home} info="Average monthly rent for properties in this market." />
                </div>

                {/* Zip Code Table */}
                <div className="bg-card border border-border rounded-xl p-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <h3 className="text-[15px] font-bold text-foreground flex items-center gap-1.5 capitalize">Top Zip Codes By Buyer Activity <InfoTooltip text="Ranked zip codes showing transaction counts, investor ratios, and investor scores. Click rows to select zips for campaign targeting." /></h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Click rows to select for campaigns</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedZips.length > 0 && (
                        <>
                          <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-500 hover:bg-cyan-500/10" icon={<Eye className="h-3 w-3" />}
                            onClick={() => navigate(`/marketplace?zips=${selectedZips.join(",")}`)}>
                            View Listings ({selectedZips.length})
                          </Button>
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" icon={<Rocket className="h-3 w-3" />}
                            onClick={() => setActiveTab("campaign")}>
                            Launch Campaign ({selectedZips.length})
                          </Button>
                        </>
                      )}
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border rounded-md text-muted-foreground text-[10px] px-2 py-1.5">
                        <option value="cr">Sort: Investor %</option>
                        <option value="ts">Sort: Transactions</option>
                        <option value="score">Sort: Score</option>
                        <option value="cap">Sort: Cap Rate</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {["", "ZIP", "AREA", "TRANSACTIONS", "INVESTOR", "RETAIL", "INV %", "MEDIAN", "DOM", "CAP", "RENT", "SCORE"].map((h, i) => (
                            <th key={i} className={cn("px-2.5 py-2 text-muted-foreground text-[10px] font-semibold",
                              i < 3 ? "text-left" : (i >= 3 && i <= 5) || i === 11 ? "text-center" : "text-right")}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedZips.map((z) => {
                          const selected = selectedZips.includes(z.zip);
                          return (
                            <tr key={z.zip} onClick={() => toggleZip(z.zip)}
                              className={cn("border-b border-border cursor-pointer transition-colors",
                                selected ? "bg-emerald-500/10" : "hover:bg-muted/50")}>
                              <td className="px-2.5 py-2">
                                <div className={cn("w-[18px] h-[18px] rounded flex items-center justify-center border-2",
                                  selected ? "border-emerald-500 bg-emerald-500" : "border-slate-500")}>
                                  {selected && <Check size={11} className="text-white" />}
                                </div>
                              </td>
                              <td className="px-2.5 py-2 font-bold text-emerald-500">{z.zip}</td>
                              <td className="px-2.5 py-2 text-muted-foreground">{z.name}</td>
                              <td className="px-2.5 py-2 text-center font-semibold">{z.ts}</td>
                              <td className="px-2.5 py-2 text-center font-semibold text-cyan-500">{z.cs}</td>
                              <td className="px-2.5 py-2 text-center text-amber-500">{z.rs}</td>
                              <td className="px-2.5 py-2 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <div className="w-10 h-[5px] rounded-full bg-border overflow-hidden">
                                    <div className="h-full rounded-full" style={{
                                      width: `${z.cr}%`,
                                      background: z.cr > 80 ? COLORS.primary : z.cr > 50 ? COLORS.warning : "#EF4444",
                                    }} />
                                  </div>
                                  <span className={cn("font-semibold text-[11px]",
                                    z.cr > 80 ? "text-emerald-500" : z.cr > 50 ? "text-amber-500" : "text-red-500")}>{z.cr}%</span>
                                </div>
                              </td>
                              <td className="px-2.5 py-2 text-right">${z.mp.toLocaleString()}</td>
                              <td className={cn("px-2.5 py-2 text-right",
                                z.dom < 80 ? "text-emerald-500" : z.dom < 100 ? "text-amber-500" : "text-red-500")}>{z.dom}d</td>
                              <td className={cn("px-2.5 py-2 text-right", z.cap > 7 ? "text-emerald-500" : "text-muted-foreground")}>{z.cap}%</td>
                              <td className="px-2.5 py-2 text-right">${z.rent}</td>
                              <td className="px-2.5 py-2 text-center">
                                <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold",
                                  z.score >= 90 ? "bg-emerald-500/15 text-emerald-500" :
                                  z.score >= 75 ? "bg-amber-500/15 text-amber-500" :
                                  "bg-red-500/15 text-red-500")}>{z.score}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 animate-fade-in" style={{ animationDelay: '450ms' }}>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3 capitalize">Transactions By Price Range</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={D.priceRanges} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} angle={-25} textAnchor="end" height={45} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Legend iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="cash" name="Investor Transactions" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="retail" name="Retail Transactions" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3 capitalize">Market Composition</h3>
                    <div className="flex items-center gap-5">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie data={[
                            { name: "Cash", value: D.summary.cashSales },
                            { name: "Retail", value: D.summary.retailSales },
                          ]} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value">
                            <Cell fill={COLORS.cyan} />
                            <Cell fill={COLORS.warning} />
                          </Pie>
                          <RechartsTooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 flex flex-col gap-2.5">
                        <div className="bg-cyan-500/10 rounded-lg p-3">
                          <div className="text-[10px] text-muted-foreground">Investor Buyers</div>
                          <div className="text-xl font-bold text-cyan-500">{D.summary.cashSales}</div>
                          <div className="text-[11px] text-cyan-500">{D.summary.cashRate}% of market</div>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3">
                          <div className="text-[10px] text-muted-foreground">Retail Buyers</div>
                          <div className="text-xl font-bold text-amber-500">{D.summary.retailSales}</div>
                          <div className="text-[11px] text-amber-500">{(100 - D.summary.cashRate).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investor Concentration & Price Gap */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 animate-fade-in" style={{ animationDelay: '600ms' }}>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Investor Concentration <InfoTooltip text="Number of investor purchases per zip code. Higher bars indicate zip codes where investors are most actively buying." /></h3>
                    <p className="text-[11px] text-muted-foreground mb-3">Higher bars = more investor activity</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={[...MARKET_DATA.zips].sort((a, b) => b.cs - a.cs)} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="cs" name="Investor" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="rs" name="Retail" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Investor Vs Retail Price Gap <InfoTooltip text="Compares average investor price vs retail price per zip. The spread represents your potential margin opportunity." /></h3>
                    <p className="text-[11px] text-muted-foreground mb-3">The spread = your margin opportunity</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={MARKET_DATA.zips} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                        <RechartsTooltip content={<ChartTooltip />} />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="mp" name="Investor Avg" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="rent" name="Retail Avg" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* DOM Investor vs Retail */}
                <div className="bg-card border border-border rounded-xl p-4 animate-fade-in" style={{ animationDelay: '750ms' }}>
                  <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">Days on Market: Investor vs Retail <InfoTooltip text="Compares how quickly investors close vs traditional financed buyers." /></h3>
                  <p className="text-[11px] text-muted-foreground mb-3">Investors close significantly faster</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={MARKET_DATA.zips} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="dom" name="Avg DOM" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* What Investors Are Paying */}
                <div className="bg-card border border-border rounded-xl p-4 animate-fade-in" style={{ animationDelay: '900ms' }}>
                  <h3 className="text-sm font-bold text-foreground mb-0.5 flex items-center gap-1.5 capitalize">What Investors Are Paying <InfoTooltip text="Average acquisition price investors are paying in each zip code." /></h3>
                  <p className="text-[11px] text-muted-foreground mb-3">Average acquisition price by zip</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={[...MARKET_DATA.zips].sort((a, b) => a.mp - b.mp)} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="zip" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Bar dataKey="mp" name="Avg Investor Price" fill="#334155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {overviewSubTab === "hotspots" && <HotSpotsView />}
            {overviewSubTab === "velocity" && <VelocityView />}
            {overviewSubTab === "flips" && <FlipTrackerView />}
            {overviewSubTab === "rental" && <RentalIntelView />}
            {overviewSubTab === "buybox" && <AIBuyBoxView />}
          </>
        )}

        {activeTab === "activity" && <ActivityTrendsTab />}
        {activeTab === "buyers" && <BuyerIntelTab />}
        {activeTab === "compare" && <MarketCompareTab />}
        {activeTab === "campaign" && <CampaignLauncherTab />}
        {activeTab === "public-records" && (
          <div className="py-8 text-center">
            <p className="text-body text-content-secondary mb-4">Full county records intelligence view</p>
            <a href="/intel/public-records" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
              <Eye size={16} />
              Open Public Records Intelligence
            </a>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
