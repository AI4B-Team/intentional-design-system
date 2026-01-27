import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMailCampaigns, useDeleteMailCampaign } from "@/hooks/useMailCampaigns";
import { 
  Mail, 
  Plus, 
  Search, 
  MoreHorizontal,
  Eye,
  Trash2,
  Pause,
  Play,
  Copy,
} from "lucide-react";
import { NoDataState, NoResultsState } from "@/components/ui/empty-state";
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
import { format } from "date-fns";

export default function MailCampaigns() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useMailCampaigns();
  const deleteCampaign = useDeleteMailCampaign();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const filteredCampaigns = React.useMemo(() => {
    if (!campaigns) return [];
    if (!searchQuery) return campaigns;
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "success" | "outline" | "destructive"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      scheduled: { variant: "outline", label: "Scheduled" },
      sending: { variant: "default", label: "Sending" },
      paused: { variant: "outline", label: "Paused" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        title="Mail Campaigns"
        description="Manage your direct mail campaigns"
        action={
          <Button variant="primary" asChild>
            <Link to="/mail/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-brand" />
                    </div>
                    <div>
                      <Link 
                        to={`/mail/campaigns/${campaign.id}`}
                        className="text-body font-semibold hover:text-brand transition-colors"
                      >
                        {campaign.name}
                      </Link>
                      {campaign.description && (
                        <p className="text-small text-content-secondary mt-0.5">
                          {campaign.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-tiny text-content-tertiary">
                        <span>{campaign.total_recipients} recipients</span>
                        <span>{campaign.total_sent} sent</span>
                        <span>{campaign.total_delivered} delivered</span>
                        {campaign.scheduled_date && (
                          <span>
                            Scheduled: {format(new Date(campaign.scheduled_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/mail/campaigns/${campaign.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {campaign.status === "sending" && (
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {campaign.status === "paused" && (
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchQuery ? (
        <NoResultsState query={searchQuery} onClear={() => setSearchQuery("")} />
      ) : (
        <NoDataState
          entityName="campaigns"
          onAdd={() => navigate("/mail/campaigns/new")}
          addLabel="Create Campaign"
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this campaign and all associated mail pieces. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
