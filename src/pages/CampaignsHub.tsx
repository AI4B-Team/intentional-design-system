import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Home, Megaphone, ListFilter, AtSign, Phone, Mail, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import tab content components
import { LeadsTab } from '@/components/campaigns/LeadsTab';
import { MLSTab } from '@/components/campaigns/MLSTab';
import { ListsTab } from '@/components/campaigns/ListsTab';
import { EmailTab } from '@/components/campaigns/EmailTab';
import { DialerTab } from '@/components/campaigns/DialerTab';
import { DirectMailTab } from '@/components/campaigns/DirectMailTab';
import { WebsiteTab } from '@/components/campaigns/WebsiteTab';

const tabs = [
  { value: 'leads', label: 'Leads', icon: Home },
  { value: 'mls', label: 'MLS', icon: Megaphone },
  { value: 'lists', label: 'Lists', icon: ListFilter },
  { value: 'email', label: 'Email', icon: AtSign },
  { value: 'dialer', label: 'Dialer', icon: Phone },
  { value: 'mail', label: 'Direct Mail', icon: Mail },
  { value: 'website', label: 'Website', icon: Globe },
];

export default function CampaignsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'leads';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadsTab />;
      case 'lists':
        return <ListsTab />;
      case 'email':
        return <EmailTab />;
      case 'dialer':
        return <DialerTab />;
      case 'mail':
        return <DirectMailTab />;
      case 'mls':
        return <MLSTab />;
      case 'website':
        return <WebsiteTab />;
      default:
        return <LeadsTab />;
    }
  };

  return (
    <PageLayout title="Campaigns">
      <div className="space-y-6">
        <div className="-mt-4">
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground">
            All your marketing channels in one place — track leads, run campaigns, and grow your pipeline
          </p>
        </div>

        {/* Individual Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <Button
                key={tab.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  'gap-2',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </PageLayout>
  );
}
