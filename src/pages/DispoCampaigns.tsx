import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Mail,
  Send,
  Eye,
  MousePointer,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Loader2,
  FileText,
  CheckCircle,
  Clock,
  Megaphone,
  Building2,
  MessageSquare,
  Percent,
  Pencil,
  Pause,
  Play,
} from 'lucide-react';
import {
  useDispoCampaigns,
  useDispoCampaignStats,
  useDeleteDispoCampaign,
} from '@/hooks/useDispoCampaigns';
import {
  useCampaigns,
  useCampaignStats,
  useUpdateCampaign,
  useDeleteCampaign,
} from '@/hooks/useCampaigns';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: 'Draft', icon: <FileText className="h-3 w-3" />, color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', icon: <Clock className="h-3 w-3" />, color: 'bg-blue-500 text-white' },
  sending: { label: 'Sending', icon: <Loader2 className="h-3 w-3 animate-spin" />, color: 'bg-amber-500 text-white' },
  sent: { label: 'Sent', icon: <CheckCircle className="h-3 w-3" />, color: 'bg-green-500 text-white' },
};

const mlsStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  completed: "bg-info/10 text-info",
};

export default function DispoCampaigns() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('email');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteMLSId, setDeleteMLSId] = useState<string | null>(null);

  // Email Campaigns
  const { data: campaigns, isLoading } = useDispoCampaigns({ status: statusFilter });
  const { data: stats } = useDispoCampaignStats();
  const deleteCampaign = useDeleteDispoCampaign();

  // MLS Campaigns
  const { data: mlsCampaigns, isLoading: mlsLoading } = useCampaigns();
  const { data: mlsStats } = useCampaignStats();
  const updateMLSCampaign = useUpdateCampaign();
  const deleteMLSCampaign = useDeleteCampaign();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign.mutateAsync(id);
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dispo/campaigns/new?duplicate=${id}`);
  };

  const handleMLSToggleStatus = async (campaign: { id: string; status: string }) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await updateMLSCampaign.mutateAsync({
      id: campaign.id,
      updates: {
        status: newStatus,
        started_at: newStatus === "active" ? new Date().toISOString() : undefined,
      },
    });
  };

  const handleMLSDelete = async () => {
    if (deleteMLSId) {
      await deleteMLSCampaign.mutateAsync(deleteMLSId);
      setDeleteMLSId(null);
    }
  };

  return (
    <PageLayout
      title="Campaigns"
      headerActions={
        activeTab === 'email' ? (
          <Button onClick={() => navigate('/dispo/campaigns/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Email Campaign
          </Button>
        ) : (
          <Button onClick={() => navigate('/campaigns/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New MLS Campaign
          </Button>
        )
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="mls" className="gap-2">
            <Megaphone className="h-4 w-4" />
            MLS
          </TabsTrigger>
        </TabsList>

        {/* Email Campaigns Tab */}
        <TabsContent value="email" className="space-y-6">
          <p className="text-muted-foreground -mt-4">
            Send deal announcements to your buyer list
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Send className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalCampaigns || 0}</p>
                    <p className="text-xs text-muted-foreground">Campaigns Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalEmails?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Emails</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Eye className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.avgOpenRate?.toFixed(0) || 0}%</p>
                    <p className="text-xs text-muted-foreground">Avg Open Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <MousePointer className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.avgClickRate?.toFixed(0) || 0}%</p>
                    <p className="text-xs text-muted-foreground">Avg Click Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !campaigns?.length ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Email Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first email campaign to announce deals to buyers
                  </p>
                  <Button onClick={() => navigate('/dispo/campaigns/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Deal</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: any) => {
                      const status = statusConfig[campaign.status] || statusConfig.draft;
                      const openRate = campaign.sent_count > 0 
                        ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(0) 
                        : '-';
                      const clickRate = campaign.sent_count > 0 
                        ? ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(0) 
                        : '-';

                      return (
                        <TableRow
                          key={campaign.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/dispo/campaigns/${campaign.id}`)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {campaign.subject}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {campaign.deal ? (
                              <div className="flex items-center gap-2">
                                {campaign.deal.primary_photo_url && (
                                  <img
                                    src={campaign.deal.primary_photo_url}
                                    alt=""
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                )}
                                <span className="truncate max-w-[150px]">
                                  {campaign.deal.address}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">General</span>
                            )}
                          </TableCell>
                          <TableCell>{campaign.recipient_count || '-'}</TableCell>
                          <TableCell>
                            {campaign.sent_at
                              ? format(new Date(campaign.sent_at), 'MMM d')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {openRate !== '-' ? `${openRate}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {clickRate !== '-' ? `${clickRate}%` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} border-0 gap-1`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/dispo/campaigns/${campaign.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleDuplicate(campaign.id, e as any)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => handleDelete(campaign.id, e as any)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* MLS Campaigns Tab */}
        <TabsContent value="mls" className="space-y-6">
          <p className="text-muted-foreground -mt-4">
            Manage bulk offer campaigns to agent-listed properties
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Campaigns</p>
                    <p className="text-2xl font-semibold tabular-nums">{mlsStats?.activeCampaigns || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Properties Targeted</p>
                    <p className="text-2xl font-semibold tabular-nums">{mlsStats?.totalProperties || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Responses</p>
                    <p className="text-2xl font-semibold tabular-nums">{mlsStats?.totalResponses || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Response Rate</p>
                    <p className="text-2xl font-semibold tabular-nums">
                      {(mlsStats?.avgResponseRate || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MLS Campaigns Table */}
          {mlsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !mlsCampaigns || mlsCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No MLS Campaigns Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first campaign to send bulk offers to agent-listed properties.
                </p>
                <Button onClick={() => navigate("/campaigns/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create MLS Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Campaign
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Properties
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Sent
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Opened
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Responded
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Rate
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Created
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mlsCampaigns.map((campaign) => {
                      const responseRate =
                        campaign.sent_count > 0
                          ? ((campaign.responded_count / campaign.sent_count) * 100).toFixed(1)
                          : "0.0";

                      return (
                        <tr
                          key={campaign.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              {campaign.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {campaign.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={cn("capitalize", mlsStatusColors[campaign.status])} variant="secondary">
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {campaign.properties_count}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {campaign.sent_count}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {campaign.opened_count}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {campaign.responded_count}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">
                            {responseRate}%
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            {format(parseISO(campaign.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="px-2" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 hover:bg-muted rounded transition-colors">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {campaign.status !== "completed" && (
                                  <DropdownMenuItem onClick={() => handleMLSToggleStatus(campaign)}>
                                    {campaign.status === "active" ? (
                                      <>
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Resume
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteMLSId(campaign.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete MLS Confirmation */}
      <AlertDialog open={!!deleteMLSId} onOpenChange={() => setDeleteMLSId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMLSDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
