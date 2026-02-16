import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { RentalBuyBoxTab } from "@/components/intel/RentalBuyBoxTab";
import { CampaignLauncherTab } from "@/components/intel/CampaignLauncherTab";
import { BuyerIntelTab } from "@/components/intel/BuyerIntelTab";

// ---------- Sample Data (Phase 1 static) ----------
const MARKET_DATA = {
  market: "Port Richey, FL",
  msa: "Tampa-St. Pete-Clearwater",
  updated: "Feb 16, 2026",
  summary: {
    totalSales: 554, cashSales: 422, retailSales: 132,
    medianPrice: 55112, dom: 83, cashRate: 76.2,
    inventory: 198, rent: 1210, capRate: 7.4,
    priceGrowth: 3.2, rentGrowth: 5.1,
  },
  scores: { market: 74, cash: 92, flip: 61, rental: 78, wholesale: 94 },
  zips: [
    { zip: "34668", name: "Port Richey", ts: 144, cs: 139, rs: 5, mp: 44900, dom: 77, cr: 96.5, score: 98, rent: 1150, cap: 8.2 },
    { zip: "34655", name: "New Port Richey", ts: 74, cs: 30, rs: 44, mp: 135000, dom: 78, cr: 40.5, score: 82, rent: 1450, cap: 5.8 },
    { zip: "34652", name: "Port Richey", ts: 73, cs: 55, rs: 18, mp: 45750, dom: 104, cr: 75.3, score: 91, rent: 1100, cap: 7.6 },
    { zip: "34691", name: "Holiday", ts: 73, cs: 67, rs: 6, mp: 41000, dom: 66, cr: 91.8, score: 95, rent: 1050, cap: 8.8 },
    { zip: "34667", name: "Hudson", ts: 66, cs: 32, rs: 34, mp: 100000, dom: 99, cr: 48.5, score: 78, rent: 1300, cap: 6.4 },
    { zip: "34653", name: "New Port Richey", ts: 56, cs: 49, rs: 7, mp: 57500, dom: 57, cr: 87.5, score: 93, rent: 1200, cap: 7.9 },
    { zip: "34690", name: "Holiday", ts: 41, cs: 38, rs: 3, mp: 49000, dom: 91, cr: 92.7, score: 90, rent: 1100, cap: 8.1 },
    { zip: "34654", name: "New Port Richey", ts: 27, cs: 12, rs: 15, mp: 105000, dom: 129, cr: 44.4, score: 72, rent: 1350, cap: 5.5 },
  ],
  priceRanges: [
    { range: "Under $50K", cash: 233, retail: 0 },
    { range: "$50-100K", cash: 147, retail: 42 },
    { range: "$100-150K", cash: 18, retail: 40 },
    { range: "$150-200K", cash: 5, retail: 28 },
    { range: "$200-250K", cash: 2, retail: 14 },
    { range: "$250-300K", cash: 1, retail: 8 },
    { range: "$300-350K", cash: 0, retail: 8 },
    { range: "$350K+", cash: 0, retail: 8 },
  ],
};

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
  accent: "#3B82F6",
  purple: "#8B5CF6",
};

// ---------- Tabs ----------
const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "activity", label: "Activity & Trends", icon: Activity },
  { key: "buyers", label: "Buyer Activity", icon: Users },
  { key: "rental", label: "Rental & Buy Box", icon: Home },
  { key: "campaign", label: "Campaign Launcher", icon: Megaphone },
] as const;

type TabKey = typeof TABS[number]["key"];

// ---------- Main Component ----------
export default function Intel() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("cr");
  const [timeRange, setTimeRange] = useState("6M");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const toggleZip = (zip: string) =>
    setSelectedZips((prev) => prev.includes(zip) ? prev.filter((z) => z !== zip) : [...prev, zip]);

  const sortedZips = useMemo(
    () => [...MARKET_DATA.zips].sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]),
    [sortBy]
  );

  const D = MARKET_DATA;

  return (
    <PageLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-foreground">Market Intelligence</h1>
              <p className="text-muted-foreground">Real-time investor analytics</p>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-[340px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, zip, or MSA..."
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Analyze
              </Button>
            </div>
            <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
              {["1M", "3M", "6M", "1Y"].map((t) => (
                <button key={t} onClick={() => setTimeRange(t)}
                  className={cn("px-2 py-1 rounded-md text-[10px] font-semibold transition-colors",
                    timeRange === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Market Info */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" />
              <h2 className="text-xl font-bold text-foreground">{D.market}</h2>
              <span className="bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded-full text-[10px] font-semibold">Hot Market</span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">
              MSA: {D.msa} · Updated {D.updated} · {D.summary.totalSales} transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Download className="h-3 w-3" />}>Export</Button>
            <Button variant="secondary" size="sm" icon={<Star className="h-3 w-3" />}>Watchlist</Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border pb-0 overflow-x-auto">
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
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <h3 className="text-[13px] font-bold text-foreground capitalize">Market Scores</h3>
                <InfoTooltip text="Composite scores (0-100) measuring market attractiveness for each investment strategy. Based on transaction volume, pricing trends, investor activity, and rental yields." />
              </div>
              <div className="flex items-center justify-around flex-wrap gap-4">
              <ScoreGauge score={D.scores.market} label="Market" icon={BarChart3} color={COLORS.primary} large />
              <div className="w-px h-11 bg-border hidden sm:block" />
              <ScoreGauge score={D.scores.cash} label="Inventory" icon={DollarSign} color={COLORS.cyan} />
              <ScoreGauge score={D.scores.wholesale} label="Days On Market" icon={Zap} color={COLORS.primary} />
              <ScoreGauge score={D.scores.flip} label="Flip" icon={Home} color={COLORS.warning} />
              <ScoreGauge score={D.scores.rental} label="Rental" icon={Building} color={COLORS.accent} />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
              <MetricCard label="Inventory" value={D.summary.inventory} suffix=" active" change={-2.0} icon={Building} color={COLORS.cyan} info="Number of currently active listings. Lower inventory often means stronger seller position." />
              <MetricCard label="Median Price" value={D.summary.medianPrice} prefix="$" change={D.summary.priceGrowth} icon={DollarSign} info="Middle sale price across all transactions in the selected time range." />
              <MetricCard label="Total Sales" value={D.summary.totalSales} change={2.8} icon={Activity} color={COLORS.accent} info="Total number of closed transactions (cash + retail) in this market." />
              <MetricCard label="Investor %" value={`${D.summary.cashRate}%`} icon={Users} color={COLORS.cyan} info="Percentage of transactions that were investor purchases — higher means more investor activity." />
              <MetricCard label="Avg DOM" value={D.summary.dom} suffix=" days" change={-5.2} icon={Clock} color={COLORS.warning} info="Average Days on Market before a property sells. Lower = faster-moving market." />
              <MetricCard label="Cap Rate" value={`${D.summary.capRate}%`} change={0.3} icon={Percent} color={COLORS.purple} info="Capitalization rate — annual net rental income divided by property price. Higher = better rental returns." />
              <MetricCard label="Avg Rent" value={D.summary.rent} prefix="$" suffix="/mo" change={D.summary.rentGrowth} icon={Home} info="Average monthly rent for properties in this market." />
            </div>

            {/* Zip Code Table */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-[15px] font-bold text-foreground flex items-center gap-1.5 capitalize">Top Zip Codes by Investor Activity <InfoTooltip text="Ranked zip codes showing transaction counts, investor ratios, and investor scores. Click rows to select zips for campaign targeting." /></h3>
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
                    <option value="ts">Sort: Sales</option>
                    <option value="score">Sort: Score</option>
                    <option value="cap">Sort: Cap Rate</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["", "ZIP", "AREA", "SALES", "INVESTOR", "RETAIL", "INV %", "MEDIAN", "DOM", "CAP", "RENT", "SCORE"].map((h, i) => (
                        <th key={i} className={cn("px-2.5 py-2 text-muted-foreground text-[10px] font-semibold",
                          i < 3 ? "text-left" : i === 11 ? "text-center" : "text-right")}>{h}</th>
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
                          <td className="px-2.5 py-2 text-right font-semibold">{z.ts}</td>
                          <td className="px-2.5 py-2 text-right font-semibold text-cyan-500">{z.cs}</td>
                          <td className="px-2.5 py-2 text-right text-amber-500">{z.rs}</td>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-sm font-bold text-foreground mb-3 capitalize">Sales by Price Range</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={D.priceRanges} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} angle={-25} textAnchor="end" height={45} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Legend iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="cash" name="Investor Sales" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="retail" name="Retail Sales" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
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
                      <div className="text-[10px] text-muted-foreground">Investors</div>
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
          </>
        )}

        {activeTab === "activity" && <ActivityTrendsTab />}
        {activeTab === "buyers" && <BuyerIntelTab />}
        {activeTab === "rental" && <RentalBuyBoxTab />}
        {activeTab === "campaign" && <CampaignLauncherTab />}
      </div>
    </PageLayout>
  );
}
