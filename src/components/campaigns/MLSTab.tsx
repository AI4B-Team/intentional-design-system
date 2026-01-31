import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Megaphone,
  Building2,
  MessageSquare,
  Percent,
  MoreHorizontal,
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
  Loader2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useCampaigns,
  useCampaignStats,
  useUpdateCampaign,
  useDeleteCampaign,
} from '@/hooks/useCampaigns';

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  completed: "bg-info/10 text-info",
};

export function MLSTab() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useCampaigns();
  const { data: stats } = useCampaignStats();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleToggleStatus = async (campaign: { id: string; status: string }) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await updateCampaign.mutateAsync({
      id: campaign.id,
      updates: {
        status: newStatus,
        started_at: newStatus === "active" ? new Date().toISOString() : undefined,
      },
    });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCampaign.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
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
                <p className="text-2xl font-semibold tabular-nums">{stats?.activeCampaigns || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Properties Targeted</p>
                <p className="text-2xl font-semibold tabular-nums">{stats?.totalProperties || 0}</p>
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
                <p className="text-2xl font-semibold tabular-nums">{stats?.totalResponses || 0}</p>
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
                  {(stats?.avgResponseRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => navigate("/campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New MLS Campaign
        </Button>
      </div>

      {/* MLS Campaigns Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
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
                {campaigns.map((campaign) => {
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
                        <Badge className={cn("capitalize", statusColors[campaign.status])} variant="secondary">
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
                              <DropdownMenuItem onClick={() => handleToggleStatus(campaign)}>
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
                              onClick={() => setDeleteId(campaign.id)}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
