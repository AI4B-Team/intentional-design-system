import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Megaphone } from 'lucide-react';

// Import tab content components
import { LeadsTab } from '@/components/campaigns/LeadsTab';
import { MLSTab } from '@/components/campaigns/MLSTab';

export default function CampaignsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'leads';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <PageLayout title="Campaigns">
      <div className="space-y-6">
        <p className="text-muted-foreground -mt-4">
          Manage your lead sources and marketing campaigns
        </p>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="leads" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="mls" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">MLS</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <LeadsTab />
          </TabsContent>

          <TabsContent value="mls" className="mt-6">
            <MLSTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
