import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Megaphone, ListFilter, AtSign, Phone, Mail, Globe } from 'lucide-react';

// Import tab content components
import { LeadsTab } from '@/components/campaigns/LeadsTab';
import { MLSTab } from '@/components/campaigns/MLSTab';
import { ListsTab } from '@/components/campaigns/ListsTab';
import { EmailTab } from '@/components/campaigns/EmailTab';
import { DialerTab } from '@/components/campaigns/DialerTab';
import { DirectMailTab } from '@/components/campaigns/DirectMailTab';
import { WebsiteTab } from '@/components/campaigns/WebsiteTab';

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
          <TabsList className="flex w-full max-w-3xl overflow-x-auto">
            <TabsTrigger value="leads" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="lists" className="gap-2">
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Lists</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <AtSign className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="dialer" className="gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Dialer</span>
            </TabsTrigger>
            <TabsTrigger value="mail" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Direct Mail</span>
            </TabsTrigger>
            <TabsTrigger value="mls" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">MLS</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Website</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <LeadsTab />
          </TabsContent>

          <TabsContent value="lists" className="mt-6">
            <ListsTab />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailTab />
          </TabsContent>

          <TabsContent value="dialer" className="mt-6">
            <DialerTab />
          </TabsContent>

          <TabsContent value="mail" className="mt-6">
            <DirectMailTab />
          </TabsContent>

          <TabsContent value="mls" className="mt-6">
            <MLSTab />
          </TabsContent>

          <TabsContent value="website" className="mt-6">
            <WebsiteTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
