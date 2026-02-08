import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Home,
  DollarSign,
  Users,
  Building,
  Shield,
  GraduationCap,
  MapPin,
  BarChart3,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketplaceDeal } from "@/hooks/useMockDeals";
import { PropertySummaryHeader } from "./PropertySummaryHeader";

interface MarketTabProps {
  deal: MarketplaceDeal;
  viewMode: "flip" | "hold";
}

export function MarketTab({ deal, viewMode }: MarketTabProps) {
  // Mock market data
  const marketData = {
    medianPrice: 285000,
    medianPriceChange: 4.2,
    daysOnMarket: 18,
    domChange: -12,
    inventory: 342,
    inventoryChange: -8,
    listToSaleRatio: 98.2,
    newListings: 124,
    pendingSales: 89,
    closedSales: 156,
    pricePerSqft: 152,
    absorption: 2.4,
    marketHealth: 78,
  };

  // Rental market data for Hold mode
  const rentalMarketData = {
    medianRent: 1650,
    rentChange: 5.8,
    avgVacancy: 4.2,
    vacancyChange: -1.5,
    avgDaysToLease: 21,
    rentToPrice: ((1650 * 12) / deal.price * 100).toFixed(2),
    capRateArea: 6.8,
    grossYield: 7.2,
    avgRentPerSqft: 1.12,
  };

  const neighborhoodData = {
    walkScore: 72,
    transitScore: 45,
    bikeScore: 58,
    crimeIndex: 32,
    schoolRating: 7.8,
    avgHouseholdIncome: 68500,
    population: 45200,
    populationGrowth: 2.8,
    renterOccupied: 38,
    ownerOccupied: 62,
  };

  const schools = [
    { name: "Westwood Elementary", type: "Elementary", rating: 8, distance: 0.4 },
    { name: "Central Middle School", type: "Middle", rating: 7, distance: 1.2 },
    { name: "Tampa Bay High", type: "High", rating: 8, distance: 1.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Property Summary Header */}
      <PropertySummaryHeader deal={deal} />
      
      {/* Market Health Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {viewMode === "hold" ? "Rental Market Health" : "Market Health"}
            </h2>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm font-semibold",
              marketData.marketHealth >= 70 ? "border-success text-success bg-success/10" :
              marketData.marketHealth >= 50 ? "border-warning text-warning bg-warning/10" :
              "border-destructive text-destructive bg-destructive/10"
            )}
          >
            {marketData.marketHealth >= 70 ? "Strong" : marketData.marketHealth >= 50 ? "Moderate" : "Weak"}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Market Score</span>
            <span className="font-semibold">{marketData.marketHealth}/100</span>
          </div>
          <Progress value={marketData.marketHealth} className="h-3" />
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {viewMode === "hold" 
            ? `${deal.city} has a strong rental market with ${rentalMarketData.avgVacancy}% vacancy rate and rents growing ${rentalMarketData.rentChange}% year-over-year.`
            : `${deal.city} is experiencing a seller's market with properties selling quickly. Demand outpaces supply with a ${marketData.absorption}-month absorption rate.`
          }
        </p>
      </Card>

      {/* Rental Market Metrics - Only show in Hold mode */}
      {viewMode === "hold" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Median Rent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${rentalMarketData.medianRent.toLocaleString()}</span>
              <span className="text-xs font-medium flex items-center gap-0.5 text-success">
                <TrendingUp className="h-3 w-3" />
                +{rentalMarketData.rentChange}%
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Vacancy Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{rentalMarketData.avgVacancy}%</span>
              <span className={cn(
                "text-xs font-medium flex items-center gap-0.5",
                rentalMarketData.vacancyChange <= 0 ? "text-success" : "text-destructive"
              )}>
                {rentalMarketData.vacancyChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {rentalMarketData.vacancyChange}%
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Days to Lease</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{rentalMarketData.avgDaysToLease}</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Area Cap Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{rentalMarketData.capRateArea}%</span>
            </div>
          </Card>
        </div>
      )}

      {/* Rental Yield Metrics - Only show in Hold mode */}
      {viewMode === "hold" && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Rental Yield Analysis</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">Rent-to-Price Ratio</span>
              <span className="font-semibold">{rentalMarketData.rentToPrice}%</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">Gross Yield</span>
              <span className="font-semibold text-success">{rentalMarketData.grossYield}%</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">Rent/SqFt</span>
              <span className="font-semibold">${rentalMarketData.avgRentPerSqft}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-foreground">
              <span className="font-medium text-success">Strong Rental Demand:</span> This area has {neighborhoodData.renterOccupied}% renter-occupied units with growing population (+{neighborhoodData.populationGrowth}%), indicating sustained rental demand.
            </p>
          </div>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Median Price</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${(marketData.medianPrice / 1000).toFixed(0)}K</span>
            <span className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              marketData.medianPriceChange >= 0 ? "text-success" : "text-destructive"
            )}>
              {marketData.medianPriceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {marketData.medianPriceChange >= 0 ? "+" : ""}{marketData.medianPriceChange}%
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Days on Market</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{marketData.daysOnMarket}</span>
            <span className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              marketData.domChange <= 0 ? "text-success" : "text-destructive"
            )}>
              {marketData.domChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {marketData.domChange}%
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active Listings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{marketData.inventory}</span>
            <span className={cn(
              "text-xs font-medium flex items-center gap-0.5",
              marketData.inventoryChange <= 0 ? "text-warning" : "text-success"
            )}>
              {marketData.inventoryChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {marketData.inventoryChange}%
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">List/Sale Ratio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{marketData.listToSaleRatio}%</span>
          </div>
        </Card>
      </div>

      {/* Market Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Market Activity (Last 30 Days)</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{marketData.newListings}</p>
            <p className="text-sm text-muted-foreground">New Listings</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-warning">{marketData.pendingSales}</p>
            <p className="text-sm text-muted-foreground">Pending Sales</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-success">{marketData.closedSales}</p>
            <p className="text-sm text-muted-foreground">Closed Sales</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">Avg. Price/SqFt</span>
            <span className="font-semibold">${marketData.pricePerSqft}</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">Absorption Rate</span>
            <span className="font-semibold">{marketData.absorption} months</span>
          </div>
        </div>
      </Card>

      {/* Neighborhood Scores */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Neighborhood</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-primary">{neighborhoodData.walkScore}</p>
            <p className="text-sm text-muted-foreground">Walk Score</p>
            <p className="text-xs text-muted-foreground mt-1">Very Walkable</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-primary">{neighborhoodData.transitScore}</p>
            <p className="text-sm text-muted-foreground">Transit Score</p>
            <p className="text-xs text-muted-foreground mt-1">Some Transit</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-primary">{neighborhoodData.bikeScore}</p>
            <p className="text-sm text-muted-foreground">Bike Score</p>
            <p className="text-xs text-muted-foreground mt-1">Bikeable</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-success">{neighborhoodData.crimeIndex}</p>
            <p className="text-sm text-muted-foreground">Crime Index</p>
            <p className="text-xs text-muted-foreground mt-1">Below Avg (Good)</p>
          </div>
        </div>
      </Card>

      {/* Demographics */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Demographics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">Population</span>
            <span className="font-semibold">{neighborhoodData.population.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">Population Growth</span>
            <span className="font-semibold text-success">+{neighborhoodData.populationGrowth}%</span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm text-muted-foreground">Avg. Household Income</span>
            <span className="font-semibold">${neighborhoodData.avgHouseholdIncome.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Schools */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Nearby Schools</h2>
        </div>
        <div className="space-y-3">
          {schools.map((school, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{school.name}</p>
                <p className="text-sm text-muted-foreground">{school.type} • {school.distance} mi</p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-semibold",
                  school.rating >= 8 ? "border-success text-success bg-success/10" :
                  school.rating >= 6 ? "border-warning text-warning bg-warning/10" :
                  "border-muted-foreground"
                )}
              >
                {school.rating}/10
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Crime & Safety */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Crime & Safety</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Crime Rate</span>
              <span className="font-semibold text-success">32% below national avg</span>
            </div>
            <Progress value={32} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Violent Crime</p>
              <p className="font-semibold text-success">Low</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Property Crime</p>
              <p className="font-semibold text-warning">Moderate</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
