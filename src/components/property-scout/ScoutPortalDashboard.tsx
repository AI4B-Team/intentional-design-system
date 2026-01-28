import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Home,
  DollarSign,
  TrendingUp,
  MapPin,
  Eye,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Sparkles
} from 'lucide-react';
import { PropertyLead, ScoutProfile, BuyBox, LeadStatus } from '@/types/property-scout';

interface ScoutPortalDashboardProps {
  scout: ScoutProfile;
  leads: PropertyLead[];
  buyBoxes: BuyBox[];
  onNewLead: () => void;
  onViewLead: (leadId: string) => void;
}

const STATUS_VARIANTS: Record<LeadStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_review: 'secondary',
  under_review: 'secondary',
  qualified: 'default',
  contacted_owner: 'secondary',
  offer_made: 'secondary',
  under_contract: 'default',
  closed: 'default',
  disqualified: 'destructive',
  archived: 'outline'
};

export const ScoutPortalDashboard: React.FC<ScoutPortalDashboardProps> = ({
  scout,
  leads,
  buyBoxes,
  onNewLead,
  onViewLead
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case 'qualified':
      case 'closed':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending_review':
      case 'under_review':
        return <Clock className="h-3 w-3" />;
      case 'disqualified':
        return <XCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.address.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = leads.filter(l => l.status === 'pending_review').length;
  const qualifiedCount = leads.filter(l => l.status === 'qualified').length;
  const closedCount = leads.filter(l => l.status === 'closed').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {scout.name}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your submitted leads and earnings
            </p>
          </div>
          <Button onClick={onNewLead} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Submit New Lead
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{scout.stats.totalSubmissions}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Qualified Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{scout.stats.qualifiedLeads}</p>
                  <p className="text-xs text-muted-foreground">
                    {scout.stats.totalSubmissions > 0
                      ? `${Math.round((scout.stats.qualifiedLeads / scout.stats.totalSubmissions) * 100)}% success rate`
                      : 'No submissions yet'}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deals Closed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{scout.stats.dealsClosed}</p>
                  <p className="text-xs text-muted-foreground">Properties sold</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    ${scout.stats.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Commissions earned</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Buy Boxes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Available Buy Boxes</CardTitle>
            <CardDescription>
              Properties matching these criteria will get priority review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {buyBoxes.map(buyBox => (
                <Card key={buyBox.id} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{buyBox.name}</CardTitle>
                      {buyBox.isActive && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {buyBox.criteria.states && buyBox.criteria.states.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {buyBox.criteria.states.join(', ')}
                        </div>
                      )}
                      {buyBox.criteria.minPrice && buyBox.criteria.maxPrice && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            ${buyBox.criteria.minPrice.toLocaleString()} - ${buyBox.criteria.maxPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {buyBox.criteria.propertyTypes && buyBox.criteria.propertyTypes.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Home className="h-4 w-4" />
                          {buyBox.criteria.propertyTypes.map(t => t.replace('_', ' ')).join(', ')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leads Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
                All Leads ({leads.length})
              </TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setStatusFilter('pending_review')}>
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="qualified" onClick={() => setStatusFilter('qualified')}>
                Qualified ({qualifiedCount})
              </TabsTrigger>
              <TabsTrigger value="closed" onClick={() => setStatusFilter('closed')}>
                Closed ({closedCount})
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            {filteredLeads.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No leads found</p>
                    <p className="text-muted-foreground mt-1">
                      Start by submitting your first property lead
                    </p>
                    <Button onClick={onNewLead} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit New Lead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map(lead => (
                  <Card
                    key={lead.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onViewLead(lead.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{lead.address.street}</h3>
                            <Badge variant={STATUS_VARIANTS[lead.status]}>
                              {getStatusIcon(lead.status)}
                              <span className="ml-1 capitalize">{lead.status.replace(/_/g, ' ')}</span>
                            </Badge>
                            {lead.buyBoxMatches ? (
                              <Badge variant="outline" className="text-primary border-primary">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Buy Box Match
                              </Badge>
                            ) : (
                              <Badge variant="secondary">No Match</Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {lead.address.city}, {lead.address.state} {lead.address.zipCode}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Property Type</p>
                              <p className="font-medium capitalize">{lead.propertyType.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Estimated Value</p>
                              <p className="font-medium">
                                {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Condition</p>
                              <p className="font-medium capitalize">{lead.condition || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitted</p>
                              <p className="font-medium">
                                {new Date(lead.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {lead.ownerInfo?.motivationLevel && (
                            <div className="pt-1">
                              <Badge
                                variant={lead.ownerInfo.motivationLevel === 'high' ? 'default' : 'secondary'}
                              >
                                {lead.ownerInfo.motivationLevel.toUpperCase()} Motivation
                              </Badge>
                            </div>
                          )}
                        </div>

                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <LeadsList
              leads={filteredLeads}
              onViewLead={onViewLead}
              onNewLead={onNewLead}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="qualified" className="mt-0">
            <LeadsList
              leads={filteredLeads}
              onViewLead={onViewLead}
              onNewLead={onNewLead}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="closed" className="mt-0">
            <LeadsList
              leads={filteredLeads}
              onViewLead={onViewLead}
              onNewLead={onNewLead}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper component to avoid repetition
const LeadsList: React.FC<{
  leads: PropertyLead[];
  onViewLead: (id: string) => void;
  onNewLead: () => void;
  getStatusIcon: (status: LeadStatus) => React.ReactNode;
}> = ({ leads, onViewLead, onNewLead, getStatusIcon }) => {
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No leads found</p>
            <p className="text-muted-foreground mt-1">
              Start by submitting your first property lead
            </p>
            <Button onClick={onNewLead} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Submit New Lead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map(lead => (
        <Card
          key={lead.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewLead(lead.id)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{lead.address.street}</h3>
                  <Badge variant={STATUS_VARIANTS[lead.status]}>
                    {getStatusIcon(lead.status)}
                    <span className="ml-1 capitalize">{lead.status.replace(/_/g, ' ')}</span>
                  </Badge>
                  {lead.buyBoxMatches ? (
                    <Badge variant="outline" className="text-primary border-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Buy Box Match
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No Match</Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {lead.address.city}, {lead.address.state} {lead.address.zipCode}
                </p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{lead.propertyType.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Value</p>
                    <p className="font-medium">
                      {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Condition</p>
                    <p className="font-medium capitalize">{lead.condition || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {new Date(lead.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {lead.ownerInfo?.motivationLevel && (
                  <div className="pt-1">
                    <Badge
                      variant={lead.ownerInfo.motivationLevel === 'high' ? 'default' : 'secondary'}
                    >
                      {lead.ownerInfo.motivationLevel.toUpperCase()} Motivation
                    </Badge>
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
