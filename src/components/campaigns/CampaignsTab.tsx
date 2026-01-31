import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import {
  useDispoCampaigns,
  useDispoCampaignStats,
  useDeleteDispoCampaign,
} from '@/hooks/useDispoCampaigns';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: 'Draft', icon: <FileText className="h-3 w-3" />, color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', icon: <Clock className="h-3 w-3" />, color: 'bg-blue-500 text-white' },
  sending: { label: 'Sending', icon: <Loader2 className="h-3 w-3 animate-spin" />, color: 'bg-amber-500 text-white' },
  sent: { label: 'Sent', icon: <CheckCircle className="h-3 w-3" />, color: 'bg-green-500 text-white' },
};

export function CampaignsTab() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: campaigns, isLoading } = useDispoCampaigns({ status: statusFilter });
  const { data: stats } = useDispoCampaignStats();
  const deleteCampaign = useDeleteDispoCampaign();

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

  return (
    <div className="space-y-6">
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

      {/* Filter & Actions */}
      <div className="flex items-center justify-between gap-4">
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
        
        <Button onClick={() => navigate('/dispo/campaigns/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
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
              <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
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
    </div>
  );
}
