import * as React from "react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  TrendingUp,
  Loader2,
  Sparkles,
  LineChart,
} from "lucide-react";
import {
  generateMockMetrics,
  generatePriceHistory,
  generateInventoryData,
  generateDOMDistribution,
  generateRentalData,
  generateInvestmentMetrics,
  generateRecentSales,
  type MarketAlerts,
} from "./market-trends/types";
import { MetricCard } from "./market-trends/MetricCard";
import { PriceTrendsChart } from "./market-trends/PriceTrendsChart";
import { InventoryChart } from "./market-trends/InventoryChart";
import { DaysOnMarketChart } from "./market-trends/DaysOnMarketChart";
import { RentalMarketTable } from "./market-trends/RentalMarketTable";
import { InvestmentMetricsCard } from "./market-trends/InvestmentMetricsCard";
import { RecentSalesTable } from "./market-trends/RecentSalesTable";
import { MarketAlertsCard } from "./market-trends/MarketAlertsCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function MarketTrendsTab() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasData, setHasData] = React.useState(false);
  const [location, setLocation] = React.useState("");
  const [currentLocation, setCurrentLocation] = React.useState("Austin, TX 78701");
  const [period, setPeriod] = React.useState("12");
  const [alerts, setAlerts] = React.useState<MarketAlerts>({
    priceChange: false,
    inventoryChange: false,
    weeklySummary: false,
  });

  // Mock data - in production, this would come from an API
  const metrics = React.useMemo(() => generateMockMetrics(), []);
  const priceHistory = React.useMemo(() => generatePriceHistory(), []);
  const inventoryData = React.useMemo(() => generateInventoryData(), []);
  const domDistribution = React.useMemo(() => generateDOMDistribution(), []);
  const rentalData = React.useMemo(() => generateRentalData(), []);
  const investmentMetrics = React.useMemo(() => generateInvestmentMetrics(), []);
  const recentSales = React.useMemo(() => generateRecentSales(), []);

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentLocation(location);
    setHasData(true);
    setIsLoading(false);
    toast.success("Market data loaded!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <LineChart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-h3 font-bold text-foreground">Market Trends</h2>
            <p className="text-small text-muted-foreground">
              Track local market conditions
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="location" className="text-small">Location</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                className="pl-9"
                placeholder="Search city, zip, or county..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
          
          {hasData && (
            <div className="md:w-48">
              <Label className="text-small">Current</Label>
              <div className="mt-1 h-9 px-3 flex items-center bg-surface-secondary rounded-md text-small font-medium">
                {currentLocation}
              </div>
            </div>
          )}

          <div className="md:w-40">
            <Label className="text-small">Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
                <SelectItem value="24">Last 24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {!hasData && !isLoading && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-h3 font-semibold text-foreground mb-2">
            Enter a Location to Analyze
          </h3>
          <p className="text-body text-muted-foreground max-w-md">
            Get comprehensive market data including pricing trends, inventory levels, days on market, and rental analysis.
          </p>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-h3 font-semibold text-foreground mb-2">
            Analyzing Market...
          </h3>
          <p className="text-body text-muted-foreground">
            Gathering pricing, inventory, and trend data
          </p>
        </Card>
      )}

      {/* Results */}
      {hasData && !isLoading && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-6">
            <PriceTrendsChart data={priceHistory} />
            <InventoryChart data={inventoryData} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            <DaysOnMarketChart
              currentDOM={18}
              yearAgoDOM={24}
              distribution={domDistribution}
            />
            <RentalMarketTable data={rentalData} vacancyRate={5.2} />
          </div>

          {/* Investment Metrics & Alerts */}
          <div className="grid md:grid-cols-2 gap-6">
            <InvestmentMetricsCard metrics={investmentMetrics} />
            <MarketAlertsCard alerts={alerts} onAlertsChange={setAlerts} />
          </div>

          {/* Recent Sales */}
          <RecentSalesTable
            sales={recentSales}
            onViewMap={() => toast.info("Map view coming soon")}
            onExport={() => {
              toast("Exporting market data...");
              try {
                const wb = XLSX.utils.book_new();

                // Sheet 1: Price Trends
                const priceSheet = XLSX.utils.json_to_sheet(
                  priceHistory.map((p) => ({
                    Month: p.month,
                    Median_Price: p.price,
                  }))
                );
                XLSX.utils.book_append_sheet(wb, priceSheet, "Price Trends");

                // Sheet 2: Inventory
                const invSheet = XLSX.utils.json_to_sheet(
                  inventoryData.map((d) => ({
                    Month: d.month,
                    Active_Listings: d.activeListings,
                    Months_of_Supply: d.monthsOfSupply,
                  }))
                );
                XLSX.utils.book_append_sheet(wb, invSheet, "Inventory");

                // Sheet 3: Market Metrics (DOM + key stats)
                const metricsSheet = XLSX.utils.json_to_sheet([
                  ...domDistribution.map((d) => ({
                    DOM_Range: d.range,
                    Percentage: d.percentage,
                  })),
                ]);
                XLSX.utils.book_append_sheet(wb, metricsSheet, "Market Metrics");

                // Sheet 4: Rental Market
                const rentalSheet = XLSX.utils.json_to_sheet(
                  rentalData.map((r) => ({
                    Property_Type: r.beds,
                    Avg_Rent: r.rent,
                    Price_Per_SqFt: r.pricePerSqft,
                    YoY_Change: r.yoyChange,
                  }))
                );
                XLSX.utils.book_append_sheet(wb, rentalSheet, "Rental Market");

                const dateSuffix = new Date().toISOString().slice(0, 10);
                const safeName = currentLocation.replace(/[^a-zA-Z0-9]/g, "-");
                XLSX.writeFile(wb, `market-trends-${safeName}-${dateSuffix}.xlsx`);
                toast.success("Export complete");
              } catch (err) {
                console.error("Export error:", err);
                toast.error("Export failed");
              }
            }}
          />
        </>
      )}
    </div>
  );
}
