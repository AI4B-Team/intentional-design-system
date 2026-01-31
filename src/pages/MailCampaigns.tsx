import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  useMailCampaigns, 
  useDeleteMailCampaign, 
  useMailCampaignStats 
} from "@/hooks/useMailCampaigns";
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
  Send,
  CheckCircle,
  DollarSign,
  MessageSquare,
  FileText,
  XCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "success" | "outline" | "destructive"; label: string; className?: string }> = {
  draft: { variant: "secondary", label: "Draft" },
  scheduled: { variant: "outline", label: "Scheduled" },
  sending: { variant: "default", label: "Sending...", className: "animate-pulse" },
  paused: { variant: "outline", label: "Paused", className: "border-warning text-warning" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled", className: "line-through" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  postcard_4x6: Mail,
  postcard_6x9: Mail,
  postcard_6x11: Mail,
  letter: FileText,
  yellow_letter: FileText,
};

export default function MailCampaigns() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useMailCampaigns();
  const { data: stats, isLoading: statsLoading } = useMailCampaignStats();
  const deleteCampaign = useDeleteMailCampaign();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const filteredCampaigns = React.useMemo(() => {
    if (!campaigns) return [];
    let result = campaigns;
    
    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }
    
    return result;
  }, [campaigns, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCampaign.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Direct Mail Campaigns"
        description="Send postcards and letters to property owners"
        action={
          <Button variant="primary" asChild>
            <Link to="/mail/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium text-content-secondary">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-h2 font-bold">{stats?.totalSent.toLocaleString() || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium text-content-secondary">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-h2 font-bold">{stats?.totalDelivered.toLocaleString() || 0}</div>
                <p className="text-tiny text-content-tertiary">
                  {stats?.deliveryRate.toFixed(1)}% delivery rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium text-content-secondary">Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-h2 font-bold">{stats?.totalResponses.toLocaleString() || 0}</div>
                <p className="text-tiny text-content-tertiary">
                  {stats?.responseRate.toFixed(1)}% response rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium text-content-secondary">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-content-tertiary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-h2 font-bold">{formatCurrency(stats?.totalSpend || 0)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="text-right">Recipients</TableHead>
                <TableHead className="text-right">Sent / Delivered</TableHead>
                <TableHead className="text-right">Responses</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => {
                const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                const TemplateIcon = TYPE_ICONS[campaign.mail_templates?.type || "letter"] || FileText;
                const responseRate = campaign.total_delivered > 0 
                  ? ((campaign.total_responses / campaign.total_delivered) * 100).toFixed(1)
                  : "0.0";

                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Link 
                        to={`/mail/campaigns/${campaign.id}`}
                        className="font-medium hover:text-brand transition-colors"
                      >
                        {campaign.name}
                      </Link>
                      {campaign.description && (
                        <p className="text-tiny text-content-tertiary truncate max-w-[200px]">
                          {campaign.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusConfig.variant}
                        className={cn(statusConfig.className)}
                      >
                        {campaign.status === "scheduled" && campaign.scheduled_date
                          ? `Scheduled ${format(new Date(campaign.scheduled_date), "MMM d")}`
                          : statusConfig.label
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.mail_templates ? (
                        <div className="flex items-center gap-2">
                          <TemplateIcon className="h-4 w-4 text-content-tertiary" />
                          <span className="text-small">{campaign.mail_templates.name}</span>
                        </div>
                      ) : (
                        <span className="text-content-tertiary text-small">No template</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.total_recipients.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{campaign.total_sent.toLocaleString()}</span>
                      <span className="text-content-tertiary"> / </span>
                      <span className="text-success">{campaign.total_delivered.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{campaign.total_responses}</span>
                      <span className="text-content-tertiary text-tiny ml-1">({responseRate}%)</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(campaign.total_cost)}
                    </TableCell>
                    <TableCell className="text-content-tertiary text-small">
                      {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                          {campaign.status === "scheduled" && (
                            <DropdownMenuItem>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : searchQuery || statusFilter !== "all" ? (
        <NoResultsState 
          query={searchQuery || statusFilter} 
          onClear={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-24 w-24 rounded-full bg-brand/10 flex items-center justify-center mb-6">
            <Mail className="h-12 w-12 text-brand" />
          </div>
          <h3 className="text-h2 font-semibold mb-2">No Campaigns Yet</h3>
          <p className="text-content-secondary mb-6 max-w-sm">
            Send your first direct mail campaign to property owners.
          </p>
          <Button variant="primary" asChild>
            <Link to="/mail/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
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
