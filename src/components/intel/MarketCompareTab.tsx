import React, { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend,
} from "recharts";
import { Plus, X, Search, Building, Clock, DollarSign, Users, Home, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

// Mock market data for comparison
const AVAILABLE_MARKETS = [
  {
    id: "port-richey",
    name: "Port Richey, FL",
    msa: "Tampa-St. Pete",
    inventory: 198,
    dom: 83,
    medianPrice: 55112,
    priceHigh: 350000,
    priceLow: 25000,
    totalSales: 554,
    cashSales: 422,
    retailSales: 132,
    cashRate: 76.2,
    avgRent: 1210,
    rentGrowth: 5.1,
    capRate: 7.4,
    priceGrowth: 3.2,
    score: 94,
  },
  {
    id: "holiday",
    name: "Holiday, FL",
    msa: "Tampa-St. Pete",
    inventory: 142,
    dom: 72,
    medianPrice: 45000,
    priceHigh: 280000,
    priceLow: 22000,
    totalSales: 380,
    cashSales: 312,
    retailSales: 68,
    cashRate: 82.1,
    avgRent: 1080,
    rentGrowth: 4.8,
    capRate: 8.2,
    priceGrowth: 4.1,
    score: 91,
  },
  {
    id: "hudson",
    name: "Hudson, FL",
    msa: "Tampa-St. Pete",
    inventory: 167,
    dom: 99,
    medianPrice: 100000,
    priceHigh: 420000,
    priceLow: 35000,
    totalSales: 290,
    cashSales: 148,
    retailSales: 142,
    cashRate: 51.0,
    avgRent: 1340,
    rentGrowth: 3.6,
    capRate: 6.1,
    priceGrowth: 2.8,
    score: 76,
  },
  {
    id: "new-port-richey",
    name: "New Port Richey, FL",
    msa: "Tampa-St. Pete",
    inventory: 215,
    dom: 88,
    medianPrice: 118000,
    priceHigh: 385000,
    priceLow: 30000,
    totalSales: 445,
    cashSales: 286,
    retailSales: 159,
    cashRate: 64.3,
    avgRent: 1380,
    rentGrowth: 4.2,
    capRate: 6.8,
    priceGrowth: 3.5,
    score: 83,
  },
  {
    id: "spring-hill",
    name: "Spring Hill, FL",
    msa: "Tampa-St. Pete",
    inventory: 310,
    dom: 62,
    medianPrice: 185000,
    priceHigh: 450000,
    priceLow: 80000,
    totalSales: 620,
    cashSales: 248,
    retailSales: 372,
    cashRate: 40.0,
    avgRent: 1520,
    rentGrowth: 3.9,
    capRate: 5.4,
    priceGrowth: 5.6,
    score: 68,
  },
  {
    id: "zephyrhills",
    name: "Zephyrhills, FL",
    msa: "Tampa-St. Pete",
    inventory: 178,
    dom: 74,
    medianPrice: 142000,
    priceHigh: 380000,
    priceLow: 45000,
    totalSales: 335,
    cashSales: 188,
    retailSales: 147,
    cashRate: 56.1,
    avgRent: 1290,
    rentGrowth: 4.5,
    capRate: 6.5,
    priceGrowth: 4.0,
    score: 79,
  },
];

const COMPARE_COLORS = ["#10B981", "#06B6D4", "#F59E0B", "#8B5CF6"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-muted-foreground text-[10px] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground text-[10px]">{p.name}: </span>
          <span className="text-foreground text-[10px] font-semibold">
            {typeof p.value === "number" && p.value > 999 ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface CompareMetricRowProps {
  label: string;
  icon: React.ElementType;
  markets: typeof AVAILABLE_MARKETS;
  getValue: (m: typeof AVAILABLE_MARKETS[0]) => string;
  getRaw?: (m: typeof AVAILABLE_MARKETS[0]) => number;
  info?: string;
  highlightBest?: "high" | "low";
}

function CompareMetricRow({ label, icon: Icon, markets, getValue, getRaw, info, highlightBest }: CompareMetricRowProps) {
  let bestIdx = -1;
  if (highlightBest && getRaw && markets.length > 1) {
    const vals = markets.map(getRaw);
    bestIdx = highlightBest === "high"
      ? vals.indexOf(Math.max(...vals))
      : vals.indexOf(Math.min(...vals));
  }

  return (
    <div className="flex items-center border-b border-border last:border-b-0">
      <div className="w-40 shrink-0 flex items-center gap-1.5 px-3 py-3">
        <Icon size={13} className="text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        {info && <InfoTooltip text={info} size={10} />}
      </div>
      {markets.map((m, i) => (
        <div key={m.id} className={cn("flex-1 text-center py-3 text-[13px] font-semibold",
          i === bestIdx ? "text-emerald-500" : "text-foreground")}>
          {getValue(m)}
          {i === bestIdx && <span className="ml-1 text-[9px]">★</span>}
        </div>
      ))}
    </div>
  );
}

function PickerDropdown({ showPicker, setShowPicker, children }: { showPicker: boolean; setShowPicker: (v: boolean) => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker, setShowPicker]);
  return <div className="relative" ref={ref}>{children}</div>;
}

export function MarketCompareTab() {
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["port-richey", "holiday"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const markets = selectedMarkets
    .map((id) => AVAILABLE_MARKETS.find((m) => m.id === id))
    .filter(Boolean) as typeof AVAILABLE_MARKETS;

  const availableToAdd = AVAILABLE_MARKETS.filter(
    (m) => !selectedMarkets.includes(m.id) && m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMarket = (id: string) => {
    if (selectedMarkets.length < 4) {
      setSelectedMarkets((prev) => [...prev, id]);
      setShowPicker(false);
      setSearchQuery("");
    }
  };

  const removeMarket = (id: string) => {
    if (selectedMarkets.length > 1) {
      setSelectedMarkets((prev) => prev.filter((m) => m !== id));
    }
  };

  // Bar chart data
  const barData = [
    { metric: "Inventory", ...Object.fromEntries(markets.map((m) => [m.name, m.inventory])) },
    { metric: "Avg DOM", ...Object.fromEntries(markets.map((m) => [m.name, m.dom])) },
    { metric: "Total Sales", ...Object.fromEntries(markets.map((m) => [m.name, m.totalSales])) },
    { metric: "Investor Sales", ...Object.fromEntries(markets.map((m) => [m.name, m.cashSales])) },
  ];

  // Radar data
  const radarData = [
    { metric: "Inv. Score", ...Object.fromEntries(markets.map((m) => [m.name, m.score])) },
    { metric: "Cash %", ...Object.fromEntries(markets.map((m) => [m.name, m.cashRate])) },
    { metric: "Cap Rate", ...Object.fromEntries(markets.map((m) => [m.name, m.capRate * 10])) },
    { metric: "Rent Growth", ...Object.fromEntries(markets.map((m) => [m.name, m.rentGrowth * 10])) },
    { metric: "Price Growth", ...Object.fromEntries(markets.map((m) => [m.name, m.priceGrowth * 10])) },
    { metric: "Speed", ...Object.fromEntries(markets.map((m) => [m.name, Math.max(0, 100 - m.dom)])) },
  ];

  return (
    <div className="space-y-4">
      {/* Market Selector Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[13px] font-bold text-foreground capitalize flex items-center gap-1.5">
              Compare Markets
              <InfoTooltip text="Select up to 4 cities/markets to compare key metrics side-by-side. Stars indicate the best value in each row." />
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Select up to 4 markets</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {markets.map((m, i) => (
            <div key={m.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/50">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COMPARE_COLORS[i] }} />
              <span className="text-xs font-semibold text-foreground">{m.name}</span>
              {selectedMarkets.length > 1 && (
                <button onClick={() => removeMarket(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {selectedMarkets.length < 4 && (
            <PickerDropdown showPicker={showPicker} setShowPicker={setShowPicker}>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setShowPicker(!showPicker)}>
                <Plus size={12} /> Add Market
              </Button>
              {showPicker && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search market..."
                      className="pl-7 h-7 text-xs"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-0.5">
                    {availableToAdd.map((m) => (
                      <button key={m.id} onClick={() => addMarket(m.id)}
                        className="w-full text-left px-2 py-1.5 rounded text-xs text-foreground hover:bg-muted transition-colors">
                        {m.name} <span className="text-muted-foreground text-[10px]">· {m.msa}</span>
                      </button>
                    ))}
                    {availableToAdd.length === 0 && (
                      <p className="text-muted-foreground text-[10px] px-2 py-1">No markets found</p>
                    )}
                  </div>
                </div>
              )}
            </PickerDropdown>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center border-b border-border bg-muted/30">
          <div className="w-40 shrink-0 px-3 py-2.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Metric</span>
          </div>
          {markets.map((m, i) => (
            <div key={m.id} className="flex-1 text-center py-2.5">
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: COMPARE_COLORS[i] }} />
                <span className="text-[11px] font-bold text-foreground">{m.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Section: Inventory & Speed */}
        <div className="px-3 py-1.5 bg-muted/20 border-b border-border">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Inventory & Speed</span>
        </div>
        <CompareMetricRow label="Active Listings" icon={Building} markets={markets}
          getValue={(m) => m.inventory.toString()} getRaw={(m) => m.inventory}
          info="Number of currently active listings" highlightBest="high" />
        <CompareMetricRow label="Avg DOM" icon={Clock} markets={markets}
          getValue={(m) => `${m.dom} days`} getRaw={(m) => m.dom}
          info="Average days on market" highlightBest="low" />

        {/* Section: Price */}
        <div className="px-3 py-1.5 bg-muted/20 border-b border-border">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Price Range</span>
        </div>
        <CompareMetricRow label="Median Price" icon={DollarSign} markets={markets}
          getValue={(m) => `$${m.medianPrice.toLocaleString()}`} getRaw={(m) => m.medianPrice}
          info="Median sale price" highlightBest="low" />
        <CompareMetricRow label="Price Range" icon={DollarSign} markets={markets}
          getValue={(m) => `$${(m.priceLow / 1000).toFixed(0)}K – $${(m.priceHigh / 1000).toFixed(0)}K`} />
        <CompareMetricRow label="Price Growth" icon={TrendingUp} markets={markets}
          getValue={(m) => `${m.priceGrowth}%`} getRaw={(m) => m.priceGrowth}
          info="Year-over-year price appreciation" highlightBest="high" />

        {/* Section: Buyer Activity */}
        <div className="px-3 py-1.5 bg-muted/20 border-b border-border">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Buyer Transactions</span>
        </div>
        <CompareMetricRow label="Total Sales" icon={Users} markets={markets}
          getValue={(m) => m.totalSales.toString()} getRaw={(m) => m.totalSales}
          info="Total closed transactions" highlightBest="high" />
        <CompareMetricRow label="Investor Sales" icon={Users} markets={markets}
          getValue={(m) => m.cashSales.toString()} getRaw={(m) => m.cashSales}
          info="Cash/investor purchases" highlightBest="high" />
        <CompareMetricRow label="Retail Sales" icon={Users} markets={markets}
          getValue={(m) => m.retailSales.toString()} getRaw={(m) => m.retailSales} />
        <CompareMetricRow label="Investor %" icon={Users} markets={markets}
          getValue={(m) => `${m.cashRate}%`} getRaw={(m) => m.cashRate}
          info="Percentage of investor transactions" highlightBest="high" />

        {/* Section: Rental Activity */}
        <div className="px-3 py-1.5 bg-muted/20 border-b border-border">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Rental Activity</span>
        </div>
        <CompareMetricRow label="Avg Rent" icon={Home} markets={markets}
          getValue={(m) => `$${m.avgRent.toLocaleString()}/mo`} getRaw={(m) => m.avgRent}
          info="Average monthly rent" highlightBest="high" />
        <CompareMetricRow label="Rent Growth" icon={TrendingUp} markets={markets}
          getValue={(m) => `${m.rentGrowth}%`} getRaw={(m) => m.rentGrowth}
          info="Year-over-year rent growth" highlightBest="high" />
        <CompareMetricRow label="Cap Rate" icon={DollarSign} markets={markets}
          getValue={(m) => `${m.capRate}%`} getRaw={(m) => m.capRate}
          info="Capitalization rate" highlightBest="high" />

        {/* Section: Score */}
        <div className="px-3 py-1.5 bg-muted/20 border-b border-border">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Overall</span>
        </div>
        <CompareMetricRow label="Investor Score" icon={TrendingUp} markets={markets}
          getValue={(m) => m.score.toString()} getRaw={(m) => m.score}
          highlightBest="high" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Volume Comparison */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5 capitalize">
            Volume Comparison
            <InfoTooltip text="Side-by-side comparison of key volume metrics across selected markets." />
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Legend iconSize={7} wrapperStyle={{ fontSize: 10 }} />
              {markets.map((m, i) => (
                <Bar key={m.id} dataKey={m.name} fill={COMPARE_COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Comparison */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5 capitalize">
            Market Profile Radar
            <InfoTooltip text="Multi-dimensional comparison of market strengths. Larger area = stronger overall market profile." />
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              {markets.map((m, i) => (
                <Radar key={m.id} name={m.name} dataKey={m.name}
                  stroke={COMPARE_COLORS[i]} fill={COMPARE_COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Legend iconSize={7} wrapperStyle={{ fontSize: 10 }} />
              <RechartsTooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
