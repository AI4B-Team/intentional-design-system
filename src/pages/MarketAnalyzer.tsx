import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  TrendingUp,
  Plus,
  Zap,
  BarChart3,
  Search,
  Home,
  Hammer,
  LineChart,
} from "lucide-react";
import {
  DealAnalyzerTab,
  CreateAnalysisModal,
  QuickARVModal,
  CompSearchTab,
  RentalCalculatorTab,
  RepairEstimatorTab,
  MarketTrendsTab,
} from "@/components/market-analyzer";

const tabs = [
  { value: "deals", label: "Deal Analyzer", icon: BarChart3 },
  { value: "comps", label: "Comp Search", icon: Search },
  { value: "rental", label: "Rental Calculator", icon: Home },
  { value: "repairs", label: "Repair Estimator", icon: Hammer },
  { value: "trends", label: "Market Trends", icon: LineChart },
];

export default function MarketAnalyzer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "deals";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showARVModal, setShowARVModal] = useState(false);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-h2 font-bold text-foreground">Market Analyzer</h1>
              <p className="text-small text-muted-foreground">
                Analyze deals, find comps, and evaluate markets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Zap />} onClick={() => setShowARVModal(true)}>
              Quick ARV
            </Button>
            <Button size="sm" icon={<Plus />} onClick={() => setShowCreateModal(true)}>
              New Analysis
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6 h-auto p-1 bg-surface-secondary/50 w-full justify-start overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-4 py-2"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="deals" className="mt-0">
            <DealAnalyzerTab onCreateAnalysis={() => setShowCreateModal(true)} />
          </TabsContent>

          <TabsContent value="comps" className="mt-0">
            <CompSearchTab />
          </TabsContent>

          <TabsContent value="rental" className="mt-0">
            <RentalCalculatorTab />
          </TabsContent>

          <TabsContent value="repairs" className="mt-0">
            <RepairEstimatorTab />
          </TabsContent>

          <TabsContent value="trends" className="mt-0">
            <MarketTrendsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateAnalysisModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <QuickARVModal
        open={showARVModal}
        onOpenChange={setShowARVModal}
        onCreateFullAnalysis={(address, arv) => {
          setShowARVModal(false);
          setShowCreateModal(true);
        }}
      />
    </PageLayout>
  );
}
