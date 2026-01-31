import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Mail,
  MailOpen,
  MessageSquare,
  Percent,
  MoreHorizontal,
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useCampaigns,
  useCampaignStats,
  useUpdateCampaign,
  useDeleteCampaign,
} from "@/hooks/useCampaigns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  completed: "bg-info/10 text-info",
};

export default function Campaigns() {
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
    <PageLayout>
      <PageHeader
        title="MLS Campaigns"
        description="Manage bulk offer campaigns to agent-listed properties"
      />

      {/* Action Button */}
      <div className="flex justify-end mb-lg -mt-4">
        <Button
          variant="primary"
          icon={<Plus />}
          onClick={() => navigate("/campaigns/new")}
        >
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Active Campaigns</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.activeCampaigns || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Properties Targeted</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.totalProperties || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Total Responses</p>
              <p className="text-h3 font-semibold tabular-nums">{stats?.totalResponses || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
              <Percent className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Avg Response Rate</p>
              <p className="text-h3 font-semibold tabular-nums">
                {(stats?.avgResponseRate || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !campaigns || campaigns.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <Megaphone className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
          <h3 className="text-h3 font-medium text-content mb-2">No Campaigns Yet</h3>
          <p className="text-small text-content-secondary mb-4">
            Create your first campaign to send bulk offers to agent-listed properties.
          </p>
          <Button variant="primary" icon={<Plus />} onClick={() => navigate("/campaigns/new")}>
            Create Campaign
          </Button>
        </Card>
      ) : (
        <div className="rounded-medium border border-border-subtle overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Campaign
                  </th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Properties
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Sent
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Opened
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Responded
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                    Created
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {campaigns.map((campaign) => {
                  const responseRate =
                    campaign.sent_count > 0
                      ? ((campaign.responded_count / campaign.sent_count) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr
                      key={campaign.id}
                      className="hover:bg-surface-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-body font-medium text-content">{campaign.name}</p>
                          {campaign.description && (
                            <p className="text-small text-content-secondary line-clamp-1">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={cn("capitalize", statusColors[campaign.status])} size="sm">
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums">
                        {campaign.properties_count}
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums">
                        {campaign.sent_count}
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums">
                        {campaign.opened_count}
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums">
                        {campaign.responded_count}
                      </td>
                      <td className="px-4 py-3 text-right text-body tabular-nums font-medium">
                        {responseRate}%
                      </td>
                      <td className="px-4 py-3 text-right text-small text-content-secondary">
                        {format(parseISO(campaign.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-2" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-surface-tertiary rounded-small transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-content-tertiary" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white">
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
    </PageLayout>
  );
}
