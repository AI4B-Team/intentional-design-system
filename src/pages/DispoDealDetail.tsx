import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Mail,
  Eye,
  Users,
  Heart,
  DollarSign,
  Calendar,
  Loader2,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useDispoDeal, useDealInterests, useDealViews, useUpdateInterest } from '@/hooks/useDispoDeals';
import { formatDistanceToNow, format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500' },
  coming_soon: { label: 'Coming Soon', color: 'bg-amber-500' },
  under_contract: { label: 'Under Contract', color: 'bg-blue-500' },
  sold: { label: 'Sold', color: 'bg-purple-500' },
  draft: { label: 'Draft', color: 'bg-muted' },
};

const interestTypeLabels: Record<string, string> = {
  viewed: 'Just Browsing',
  interested: 'Interested',
  very_interested: 'Very Interested',
  made_offer: 'Made Offer',
};

const followUpStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-500' },
  contacted: { label: 'Contacted', color: 'bg-blue-500' },
  negotiating: { label: 'Negotiating', color: 'bg-purple-500' },
  accepted: { label: 'Accepted', color: 'bg-green-500' },
  declined: { label: 'Declined', color: 'bg-red-500' },
  no_response: { label: 'No Response', color: 'bg-muted' },
};

export default function DispoDealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interestFilter, setInterestFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');

  const { data: deal, isLoading: loadingDeal } = useDispoDeal(id);
  const { data: interests, isLoading: loadingInterests } = useDealInterests(id);
  const { data: views, isLoading: loadingViews } = useDealViews(id);
  const updateInterest = useUpdateInterest();

  if (loadingDeal) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!deal) {
    return (
      <PageLayout title="Deal Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">This deal could not be found.</p>
          <Button onClick={() => navigate('/dispo/deals')}>Back to Deals</Button>
        </div>
      </PageLayout>
    );
  }

  const status = statusConfig[deal.status || 'draft'];

  // Generate chart data from views
  const getChartData = () => {
    if (!views?.length) return [];

    const days = parseInt(dateRange);
    const now = new Date();
    const data: Record<string, number> = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = format(date, 'MMM d');
      data[key] = 0;
    }

    views.forEach((view) => {
      if (view.viewed_at) {
        const key = format(new Date(view.viewed_at), 'MMM d');
        if (data[key] !== undefined) {
          data[key]++;
        }
      }
    });

    return Object.entries(data).map(([date, count]) => ({ date, views: count }));
  };

  const filteredInterests = interests?.filter((i) => {
    if (interestFilter === 'all') return true;
    return i.interest_type === interestFilter;
  });

  const handleMarkContacted = (interestId: string) => {
    updateInterest.mutate({
      id: interestId,
      updates: {
        follow_up_status: 'contacted',
        last_contacted_at: new Date().toISOString(),
      },
    });
  };

  return (
    <PageLayout
      title={deal.address}
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dispo/deals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dispo/deals/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => window.open(`/deals/${deal.slug}`, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Page
          </Button>
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Send Blast
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge className={`${status.color} text-white border-0`}>
            {status.label}
          </Badge>
          <span className="text-muted-foreground">
            {deal.city}, {deal.state} • ${deal.asking_price?.toLocaleString()}
          </span>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{deal.view_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{deal.unique_views || deal.view_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Unique Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{deal.interest_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Interests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {interests?.filter((i) => i.interest_type === 'made_offer').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {deal.published_at
                      ? Math.floor(
                          (Date.now() - new Date(deal.published_at).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Days Listed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Views Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Views Over Time
            </CardTitle>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="interests" className="w-full">
          <TabsList>
            <TabsTrigger value="interests">
              Buyer Interest ({interests?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="views">Recent Views</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign History</TabsTrigger>
          </TabsList>

          <TabsContent value="interests" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Interested Buyers</CardTitle>
                <Select value={interestFilter} onValueChange={setInterestFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="made_offer">Made Offer</SelectItem>
                    <SelectItem value="very_interested">Very Interested</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="viewed">Just Browsing</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {loadingInterests ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !filteredInterests?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No interests yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Interest Level</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInterests.map((interest) => {
                        const followUpStatus =
                          followUpStatusLabels[interest.follow_up_status || 'pending'];
                        return (
                          <TableRow key={interest.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{interest.guest_name || 'Anonymous'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {interest.guest_email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">
                                  {interestTypeLabels[interest.interest_type] || interest.interest_type}
                                </span>
                                {interest.offer_amount && (
                                  <span className="text-sm text-green-600">
                                    Offer: ${interest.offer_amount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {interest.created_at
                                ? formatDistanceToNow(new Date(interest.created_at), {
                                    addSuffix: true,
                                  })
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${followUpStatus.color} text-white border-0`}>
                                {followUpStatus.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {interest.guest_phone && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      (window.location.href = `tel:${interest.guest_phone}`)
                                    }
                                  >
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                                {interest.guest_email && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      (window.location.href = `mailto:${interest.guest_email}`)
                                    }
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                )}
                                {interest.follow_up_status === 'pending' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkContacted(interest.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Contacted
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="views" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Views</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingViews ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !views?.length ? (
                  <div className="text-center py-8 text-muted-foreground">No views yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Visitor</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Time on Page</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {views.slice(0, 20).map((view) => (
                        <TableRow key={view.id}>
                          <TableCell>
                            {view.buyer_id ? (
                              <span className="font-medium">Registered Buyer</span>
                            ) : (
                              <span className="text-muted-foreground">Anonymous</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {view.viewed_at
                              ? formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {view.utm_source || view.referrer || 'Direct'}
                          </TableCell>
                          <TableCell>
                            {view.time_on_page_seconds
                              ? `${Math.floor(view.time_on_page_seconds / 60)}:${String(
                                  view.time_on_page_seconds % 60
                                ).padStart(2, '0')}`
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Email Campaigns</CardTitle>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Send New Blast
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns sent yet for this deal
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
