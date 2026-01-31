import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, FileText, User } from 'lucide-react';

// Import tab content components
import { CampaignsTab } from '@/components/campaigns/CampaignsTab';
import { TemplatesTab } from '@/components/campaigns/TemplatesTab';
import { BuyerProfilesTab } from '@/components/campaigns/BuyerProfilesTab';

export default function CampaignsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'campaigns';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <PageLayout title="Campaigns">
      <div className="space-y-6">
        <p className="text-muted-foreground -mt-4">
          Manage your offer campaigns, templates, and buyer profiles
        </p>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="campaigns" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="profiles" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Buyer Profiles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignsTab />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <TemplatesTab />
          </TabsContent>

          <TabsContent value="profiles" className="mt-6">
            <BuyerProfilesTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
