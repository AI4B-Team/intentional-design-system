import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMailCampaign,
  useMailPieces,
  useUpdateMailCampaign,
} from "@/hooks/useMailCampaigns";
import {
  ArrowLeft,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  X,
  Mail,
  Send,
  CheckCircle,
  RotateCcw,
  MessageSquare,
  Clock,
  Truck,
  Phone,
  LinkIcon,
  Calendar,
  Plus,
  Download,
  Search,
  Eye,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: "default" | "secondary" | "success" | "warning" | "destructive"; label: string; className?: string }> = {
    draft: { variant: "secondary", label: "Draft" },
    scheduled: { variant: "default", label: "Scheduled" },
    sending: { variant: "warning", label: "Sending", className: "animate-pulse" },
    paused: { variant: "warning", label: "Paused" },
    completed: { variant: "success", label: "Completed" },
    cancelled: { variant: "destructive", label: "Cancelled" },
  };
  const c = config[status] || { variant: "secondary", label: status };
  return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
};

const getPieceStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4 text-content-tertiary" />,
    sent: <Send className="h-4 w-4 text-info" />,
    in_transit: <Truck className="h-4 w-4 text-warning" />,
    delivered: <CheckCircle className="h-4 w-4 text-success" />,
    returned: <RotateCcw className="h-4 w-4 text-destructive" />,
  };
  return icons[status] || icons.pending;
};

const getPieceStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    sent: "Sent",
    in_transit: "In Transit",
    delivered: "Delivered",
    returned: "Returned",
  };
  return labels[status] || status;
};

export default function MailCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useMailCampaign(id);
  const { data: pieces, isLoading: piecesLoading } = useMailPieces(id);
  const updateCampaign = useUpdateMailCampaign();

  const [activeTab, setActiveTab] = React.useState("overview");
  const [showAddResponseModal, setShowAddResponseModal] = React.useState(false);
  const [recipientSearch, setRecipientSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [responseFilter, setResponseFilter] = React.useState("all");

  // All derived state and memoization must be before any early returns
  const template = campaign?.mail_templates;
  const totalRecipients = campaign?.total_recipients || 0;
  const totalSent = campaign?.total_sent || 0;
  const totalDelivered = campaign?.total_delivered || 0;
  const totalReturned = campaign?.total_returned || 0;
  const totalResponses = campaign?.total_responses || 0;
  const sentPercent = totalRecipients > 0 ? (totalSent / totalRecipients) * 100 : 0;
  const deliveredPercent = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  const returnedPercent = totalSent > 0 ? (totalReturned / totalSent) * 100 : 0;
  const responseRate = totalDelivered > 0 ? (totalResponses / totalDelivered) * 100 : 0;
  const costPerResponse = totalResponses > 0 ? (campaign?.total_cost || 0) / totalResponses : 0;

  const filteredPieces = React.useMemo(() => {
    if (!pieces) return [];
    return pieces.filter((p) => {
      const matchesSearch =
        !recipientSearch ||
        p.recipient_name?.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        p.recipient_address?.toLowerCase().includes(recipientSearch.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesResponse =
        responseFilter === "all" ||
        (responseFilter === "responded" && p.response_received) ||
        (responseFilter === "no_response" && !p.response_received);
      return matchesSearch && matchesStatus && matchesResponse;
    });
  }, [pieces, recipientSearch, statusFilter, responseFilter]);

  const respondedPieces = React.useMemo(() => {
    return pieces?.filter((p) => p.response_received) || [];
  }, [pieces]);

  const handlePause = async () => {
    if (!campaign) return;
    await updateCampaign.mutateAsync({ id: campaign.id, status: "paused" });
    toast.success("Campaign paused");
  };

  const handleResume = async () => {
    if (!campaign) return;
    await updateCampaign.mutateAsync({ id: campaign.id, status: "sending" });
    toast.success("Campaign resumed");
  };

  const handleCancel = async () => {
    if (!campaign) return;
    await updateCampaign.mutateAsync({ id: campaign.id, status: "cancelled" });
    toast.success("Campaign cancelled");
  };

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </PageLayout>
    );
  }

  // Not found state
  if (!campaign) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-content-tertiary mb-4" />
          <h2 className="text-h3 font-semibold mb-2">Campaign not found</h2>
          <Button variant="secondary" onClick={() => navigate("/mail/campaigns")}>
            Back to Campaigns
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Timeline events
  const timelineEvents = [
    { type: "created", date: campaign.created_at, label: "Campaign created" },
    ...(campaign.scheduled_date
      ? [{ type: "scheduled", date: campaign.scheduled_date, label: "Campaign scheduled" }]
      : []),
    ...(campaign.status !== "draft"
      ? [{ type: "launched", date: campaign.updated_at, label: "Campaign launched" }]
      : []),
    ...(totalSent > 0
      ? [{ type: "sent", date: campaign.updated_at, label: `${totalSent} pieces sent` }]
      : []),
    ...(totalDelivered > 0
      ? [{ type: "delivered", date: campaign.updated_at, label: "First delivery confirmed" }]
      : []),
    ...(totalResponses > 0
      ? [{ type: "response", date: campaign.updated_at, label: "First response received! 🎉" }]
      : []),
  ];

  // Mock chart data
  const deliveryChartData = Array.from({ length: 14 }, (_, i) => ({
    date: format(new Date(Date.now() - (13 - i) * 86400000), "MMM d"),
    sent: Math.floor(Math.random() * 100),
    delivered: Math.floor(Math.random() * 80),
    returned: Math.floor(Math.random() * 10),
  }));

  const responseChartData = Array.from({ length: 14 }, (_, i) => ({
    date: format(new Date(Date.now() - (13 - i) * 86400000), "MMM d"),
    responses: Math.floor(i * 3 + Math.random() * 5),
  }));

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col gap-1 pb-lg border-b border-border-subtle mb-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/mail/campaigns" className="text-content-secondary hover:text-content text-small mb-1 inline-block">
            ← All Campaigns
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-h1 text-foreground">{campaign.name}</h1>
            {getStatusBadge(campaign.status)}
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {campaign.status === "scheduled" && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/mail/campaigns/${campaign.id}/edit`)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={handleCancel}>Cancel</Button>
            </>
          )}
          {campaign.status === "sending" && (
            <>
              <Button variant="secondary" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-2" />Pause
              </Button>
              <Button variant="destructive" onClick={handleCancel}>Cancel</Button>
            </>
          )}
          {campaign.status === "paused" && (
            <>
              <Button variant="primary" onClick={handleResume}>
                <Play className="h-4 w-4 mr-2" />Resume
              </Button>
              <Button variant="destructive" onClick={handleCancel}>Cancel</Button>
            </>
          )}
          {campaign.status === "completed" && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/mail/campaigns/new?duplicate=${campaign.id}`)}>
                <Copy className="h-4 w-4 mr-2" />Duplicate
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/mail/campaigns/new?template=${campaign.id}`)}>
                Create Similar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-display font-bold">{totalRecipients.toLocaleString()}</div>
            <p className="text-small text-content-secondary">Total Recipients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-display font-bold">{totalSent.toLocaleString()}</div>
            <Progress value={sentPercent} className="h-2 mt-2" />
            <p className="text-small text-content-secondary mt-1">Sent to Lob</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-baseline gap-2">
              <span className="text-display font-bold">{totalDelivered.toLocaleString()}</span>
              <span className="text-small text-content-secondary">({deliveredPercent.toFixed(1)}%)</span>
            </div>
            <p className="text-small text-content-secondary">Delivered</p>
          </CardContent>
        </Card>
        <Card className={returnedPercent > 5 ? "border-destructive/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-display font-bold", returnedPercent > 5 && "text-destructive")}>
                {totalReturned.toLocaleString()}
              </span>
              <span className={cn("text-small", returnedPercent > 5 ? "text-destructive" : "text-content-secondary")}>
                ({returnedPercent.toFixed(1)}%)
              </span>
            </div>
            <p className="text-small text-content-secondary">Returned</p>
          </CardContent>
        </Card>
        <Card className="border-success/50">
          <CardContent className="pt-6">
            <div className="flex items-baseline gap-2">
              <span className="text-display font-bold text-success">{totalResponses.toLocaleString()}</span>
              <span className="text-small text-success">({responseRate.toFixed(1)}% rate)</span>
            </div>
            <p className="text-small text-content-secondary">Responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress for active campaigns */}
      {["sending", "scheduled", "paused"].includes(campaign.status) && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">
                  {totalSent.toLocaleString()} of {totalRecipients.toLocaleString()} sent ({sentPercent.toFixed(0)}%)
                </p>
                {campaign.is_drip && (
                  <p className="text-small text-content-secondary">
                    Sending {(campaign.drip_settings as any)?.piecesPerDay || 50} pieces per day
                  </p>
                )}
              </div>
              {campaign.scheduled_date && (
                <div className="text-right text-small text-content-secondary">
                  <p>Started: {format(new Date(campaign.scheduled_date), "MMMM d, yyyy")}</p>
                </div>
              )}
            </div>
            <Progress value={sentPercent} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Completed banner */}
      {campaign.status === "completed" && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium">Campaign completed</p>
                <p className="text-small text-content-secondary">
                  Finished on {format(new Date(campaign.updated_at), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Template</CardTitle></CardHeader>
                <CardContent>
                  {template ? (
                    <div className="flex gap-4">
                      <div className="w-32 shrink-0 bg-white rounded-lg overflow-hidden border">
                        <AspectRatio ratio={3 / 2}>
                          <div
                            className="p-1 text-[6px]"
                            style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}
                            dangerouslySetInnerHTML={{ __html: template.front_html || "" }}
                          />
                        </AspectRatio>
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <Badge variant="secondary" size="sm" className="mt-1">
                          {template.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-content-secondary">No template selected</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Campaign Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-content-secondary">Send Type</span>
                    <span className="font-medium">
                      {campaign.is_drip ? "Drip Campaign" : "Single Send"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-content-secondary">Schedule</span>
                    <span className="font-medium">
                      {campaign.scheduled_date ? format(new Date(campaign.scheduled_date), "MMMM d, yyyy") : "Not scheduled"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-content-secondary flex items-center gap-2">
                      <Phone className="h-4 w-4" />Tracking Phone
                    </span>
                    <span className="font-medium">{campaign.tracking_phone || "Not enabled"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-content-secondary flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />Tracking URL
                    </span>
                    <span className="font-medium">{campaign.tracking_url || "Not enabled"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {timelineEvents.map((event, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10",
                          event.type === "response" ? "bg-success text-white" : "bg-surface-secondary border"
                        )}>
                          {event.type === "created" && <Plus className="h-4 w-4" />}
                          {event.type === "launched" && <Play className="h-4 w-4" />}
                          {event.type === "sent" && <Send className="h-4 w-4" />}
                          {event.type === "delivered" && <CheckCircle className="h-4 w-4" />}
                          {event.type === "response" && <PartyPopper className="h-4 w-4" />}
                          {event.type === "scheduled" && <Calendar className="h-4 w-4" />}
                        </div>
                        <div className="pt-1">
                          <p className="font-medium">{event.label}</p>
                          <p className="text-tiny text-content-tertiary">
                            {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    placeholder="Search by name or address..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={responseFilter} onValueChange={setResponseFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="no_response">No Response</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="secondary" size="sm">
                    <Download className="h-4 w-4 mr-2" />Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {piecesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : filteredPieces.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPieces.slice(0, 50).map((piece) => (
                      <TableRow key={piece.id}>
                        <TableCell className="font-medium">{piece.recipient_name || "—"}</TableCell>
                        <TableCell className="text-small text-content-secondary">
                          {piece.recipient_address}, {piece.recipient_city}, {piece.recipient_state} {piece.recipient_zip}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPieceStatusIcon(piece.status)}
                            <span className="text-small">{getPieceStatusLabel(piece.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-small">
                          {piece.sent_at ? format(new Date(piece.sent_at), "MMM d") : "—"}
                        </TableCell>
                        <TableCell className="text-small">
                          {piece.delivered_at ? format(new Date(piece.delivered_at), "MMM d") : "—"}
                        </TableCell>
                        <TableCell>
                          {piece.response_received ? (
                            <Badge variant="success" size="sm">Yes</Badge>
                          ) : (
                            <span className="text-content-tertiary">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {piece.property_id && (
                                <DropdownMenuItem onClick={() => navigate(`/properties/${piece.property_id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />View Property
                                </DropdownMenuItem>
                              )}
                              {!piece.response_received && (
                                <DropdownMenuItem>
                                  <CheckCircle className="h-4 w-4 mr-2" />Mark as Responded
                                </DropdownMenuItem>
                              )}
                              {piece.status === "returned" && (
                                <DropdownMenuItem>
                                  <X className="h-4 w-4 mr-2" />Add to Suppression
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-content-tertiary mb-4" />
                  <p className="font-medium">No recipients found</p>
                  <p className="text-small text-content-secondary">
                    {recipientSearch || statusFilter !== "all" || responseFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Recipients will appear here once the campaign starts"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{totalResponses} Responses</CardTitle>
                <CardDescription>Leads generated from this campaign</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />Export
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowAddResponseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />Add Response Manually
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {respondedPieces.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {respondedPieces.map((piece) => (
                    <Card key={piece.id} className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-lg">{piece.recipient_name || "Unknown"}</p>
                            <p className="text-small text-content-secondary">
                              {piece.recipient_address}, {piece.recipient_city}
                            </p>
                          </div>
                          <Badge variant="success">Responded</Badge>
                        </div>
                        <div className="space-y-2 text-small">
                          <div className="flex items-center gap-2 text-content-secondary">
                            <Calendar className="h-4 w-4" />
                            {piece.response_date
                              ? format(new Date(piece.response_date), "MMMM d, yyyy 'at' h:mm a")
                              : "Date unknown"}
                          </div>
                          <div className="flex items-center gap-2 text-content-secondary">
                            <Phone className="h-4 w-4" />Tracking Phone
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {piece.property_id ? (
                            <Button variant="secondary" size="sm" asChild>
                              <Link to={`/properties/${piece.property_id}`}>View Property</Link>
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm">
                              <Plus className="h-4 w-4 mr-2" />Create Property
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-content-tertiary mb-4" />
                  <p className="font-medium">No responses yet</p>
                  <p className="text-small text-content-secondary max-w-md mx-auto mt-2">
                    Responses typically start coming in 5-7 days after delivery.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Delivery Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={deliveryChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-tiny" />
                      <YAxis className="text-tiny" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="sent" stackId="1" stroke="hsl(var(--brand))" fill="hsl(var(--brand) / 0.3)" name="Sent" />
                      <Area type="monotone" dataKey="delivered" stackId="2" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.3)" name="Delivered" />
                      <Area type="monotone" dataKey="returned" stackId="3" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.3)" name="Returned" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Response Rate Over Time</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-tiny" />
                      <YAxis className="text-tiny" />
                      <Tooltip />
                      <Line type="monotone" dataKey="responses" stroke="hsl(var(--success))" strokeWidth={2} name="Cumulative Responses" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-display font-bold">{deliveredPercent.toFixed(1)}%</p>
                  <p className="text-small text-content-secondary">Delivery Rate</p>
                  <p className="text-tiny text-content-tertiary mt-1">Benchmark: 95%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-display font-bold text-success">{responseRate.toFixed(1)}%</p>
                  <p className="text-small text-content-secondary">Response Rate</p>
                  <p className="text-tiny text-content-tertiary mt-1">Benchmark: 1-2%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-display font-bold">${costPerResponse.toFixed(2)}</p>
                  <p className="text-small text-content-secondary">Cost per Response</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-display font-bold">
                    ${totalDelivered > 0 ? ((campaign.total_cost || 0) / totalDelivered).toFixed(2) : "0.00"}
                  </p>
                  <p className="text-small text-content-secondary">Cost per Delivered</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Response Modal */}
      <Dialog open={showAddResponseModal} onOpenChange={setShowAddResponseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Response Manually</DialogTitle>
            <DialogDescription>Attribute a response to a recipient from this campaign</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Recipient</Label>
              <Input placeholder="Search by name or address..." />
            </div>
            <div className="space-y-2">
              <Label>Response Date</Label>
              <Input type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
            </div>
            <div className="space-y-2">
              <Label>Response Channel</Label>
              <Select defaultValue="phone">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="walkin">Walk-in</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Any additional notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddResponseModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { toast.success("Response added"); setShowAddResponseModal(false); }}>
              Add Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
