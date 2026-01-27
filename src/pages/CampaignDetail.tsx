import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  ArrowLeft,
  Play,
  Pause,
  Pencil,
  Trash2,
  MoreHorizontal,
  Building2,
  Mail,
  MailOpen,
  MessageSquare,
  Send,
  User,
  ThermometerSun,
  ThermometerSnowflake,
  Flame,
  ArrowRight,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useCampaign,
  useCampaignProperties,
  useUpdateCampaign,
  useDeleteCampaign,
  useUpdateCampaignProperty,
  type CampaignProperty,
} from "@/hooks/useCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  completed: "bg-info/10 text-info",
  pending: "bg-muted text-muted-foreground",
  queued: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info",
  opened: "bg-warning/10 text-warning",
  responded: "bg-success/10 text-success",
  no_response: "bg-destructive/10 text-destructive",
};

const responseColors: Record<string, string> = {
  interested: "bg-success/10 text-success",
  not_interested: "bg-destructive/10 text-destructive",
  counter: "bg-warning/10 text-warning",
  pending: "bg-muted text-muted-foreground",
};

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getTemperature(responseStatus: string | null): "hot" | "warm" | "cold" {
  if (responseStatus === "interested") return "hot";
  if (responseStatus === "counter") return "warm";
  return "cold";
}

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: campaign, isLoading } = useCampaign(id);
  const { data: properties, isLoading: propsLoading } = useCampaignProperties(id);
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const updateProperty = useUpdateCampaignProperty();

  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");
  const [statusFilter, setStatusFilter] = useState("all");
  const [responseFilter, setResponseFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const handleToggleStatus = async () => {
    if (!campaign) return;
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await updateCampaign.mutateAsync({
      id: campaign.id,
      updates: {
        status: newStatus,
        started_at: newStatus === "active" && !campaign.started_at ? new Date().toISOString() : campaign.started_at,
      },
    });
  };

  const handleDelete = async () => {
    if (!campaign) return;
    await deleteCampaign.mutateAsync(campaign.id);
    navigate("/campaigns");
  };

  const handleMarkSent = async (propId: string) => {
    await updateProperty.mutateAsync({
      id: propId,
      updates: { status: "sent", sent_at: new Date().toISOString() },
    });
  };

  const handleBulkSend = async () => {
    const queuedIds = selectedIds.filter((id) => {
      const prop = properties?.find((p) => p.id === id);
      return prop?.status === "pending" || prop?.status === "queued";
    });

    for (const propId of queuedIds) {
      await updateProperty.mutateAsync({
        id: propId,
        updates: { status: "sent", sent_at: new Date().toISOString() },
      });
    }
    setSelectedIds([]);
    toast.success(`Marked ${queuedIds.length} emails as sent`);
  };

  const handleMarkNoResponse = async () => {
    const sentIds = selectedIds.filter((id) => {
      const prop = properties?.find((p) => p.id === id);
      return prop?.status === "sent";
    });

    for (const propId of sentIds) {
      await updateProperty.mutateAsync({
        id: propId,
        updates: { status: "no_response" },
      });
    }
    setSelectedIds([]);
    toast.success(`Marked ${sentIds.length} as no response`);
  };

  const handleConvertToLead = async (prop: CampaignProperty) => {
    if (!user) return;
    setConvertingId(prop.id);

    try {
      const { data: newProperty, error } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          zip: prop.zip,
          estimated_value: prop.list_price,
          source: "campaign",
          status: "new",
          notes: `Converted from campaign. Agent: ${prop.agent_name || "Unknown"} (${prop.agent_email || "No email"})`,
        })
        .select()
        .single();

      if (error) throw error;

      await updateProperty.mutateAsync({
        id: prop.id,
        updates: { property_id: newProperty.id },
      });

      toast.success("Converted to active lead");
      navigate(`/properties/${newProperty.id}`);
    } catch (error) {
      console.error("Error converting to lead:", error);
      toast.error("Failed to convert to lead");
    } finally {
      setConvertingId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!filteredProperties) return;
    if (selectedIds.length === filteredProperties.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProperties.map((p) => p.id));
    }
  };

  const filteredProperties = properties?.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (responseFilter !== "all" && p.response_status !== responseFilter) return false;
    return true;
  });

  const respondedProperties = properties?.filter(
    (p) => p.status === "responded" || (p.response_status && p.response_status !== "pending")
  );

  const sentByDay = properties
    ?.filter((p) => p.sent_at)
    .reduce((acc, p) => {
      const day = format(parseISO(p.sent_at!), "MMM d");
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const performanceData = Object.entries(sentByDay || {}).map(([date, count]) => ({
    date,
    sent: count,
  }));

  const funnelData = [
    { name: "Sent", value: campaign?.sent_count || 0, fill: "hsl(var(--brand))" },
    { name: "Opened", value: campaign?.opened_count || 0, fill: "hsl(var(--warning))" },
    { name: "Responded", value: campaign?.responded_count || 0, fill: "hsl(var(--success))" },
    {
      name: "Interested",
      value: properties?.filter((p) => p.response_status === "interested").length || 0,
      fill: "hsl(var(--info))",
    },
  ];

  if (isLoading) {
    return (
      <PageLayout>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 mb-6" />
        <Skeleton className="h-96" />
      </PageLayout>
    );
  }

  if (!campaign) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-medium text-content">Campaign not found</h2>
          <Button variant="secondary" className="mt-4" onClick={() => navigate("/campaigns")}>
            Back to Campaigns
          </Button>
        </div>
      </PageLayout>
    );
  }

  const responseRate =
    campaign.sent_count > 0 ? ((campaign.responded_count / campaign.sent_count) * 100).toFixed(1) : "0.0";
  const openRate =
    campaign.sent_count > 0 ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : "0.0";
  const interestedCount = properties?.filter((p) => p.response_status === "interested").length || 0;

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-lg">
        <button
          onClick={() => navigate("/campaigns")}
          className="flex items-center gap-2 text-content-secondary hover:text-content mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-h1 font-bold text-content">{campaign.name}</h1>
              <Badge className={cn("capitalize", statusColors[campaign.status])}>{campaign.status}</Badge>
            </div>
            {campaign.description && <p className="text-body text-content-secondary">{campaign.description}</p>}
            <p className="text-small text-content-tertiary mt-2">
              Created {format(parseISO(campaign.created_at), "MMM d, yyyy")}
              {campaign.started_at && ` • Started ${format(parseISO(campaign.started_at), "MMM d, yyyy")}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {campaign.status !== "completed" && (
              <Button
                variant={campaign.status === "active" ? "secondary" : "primary"}
                icon={campaign.status === "active" ? <Pause /> : <Play />}
                onClick={handleToggleStatus}
              >
                {campaign.status === "active" ? "Pause" : "Start"}
              </Button>
            )}
            <Button variant="secondary" icon={<Pencil />} onClick={() => setActiveTab("settings")}>
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem className="text-destructive" onClick={() => setShowDelete(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-lg">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Properties</p>
              <p className="text-h3 font-semibold tabular-nums">{campaign.properties_count}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-info/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Sent</p>
              <p className="text-h3 font-semibold tabular-nums">{campaign.sent_count}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-warning/10 flex items-center justify-center">
              <MailOpen className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Opened</p>
              <p className="text-h3 font-semibold tabular-nums">
                {campaign.opened_count}{" "}
                <span className="text-small font-normal text-content-tertiary">({openRate}%)</span>
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-success/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Responded</p>
              <p className="text-h3 font-semibold tabular-nums">
                {campaign.responded_count}{" "}
                <span className="text-small font-normal text-content-tertiary">({responseRate}%)</span>
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-medium bg-brand-accent/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-tiny text-content-tertiary uppercase tracking-wide">Interested</p>
              <p className="text-h3 font-semibold tabular-nums">{interestedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="responses">Responses ({respondedProperties?.length || 0})</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="mt-lg">
          <Card variant="default" padding="none">
            <div className="p-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Queued</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="opened">Opened</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="no_response">No Response</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={responseFilter} onValueChange={setResponseFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Response" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Responses</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">Not Interested</SelectItem>
                    <SelectItem value="counter">Counter</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-small text-content-secondary">{selectedIds.length} selected</span>
                  <Button variant="secondary" size="sm" onClick={handleBulkSend}>
                    Mark as Sent
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleMarkNoResponse}>
                    Mark No Response
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {propsLoading ? (
              <div className="p-lg">
                <Skeleton className="h-64" />
              </div>
            ) : !filteredProperties || filteredProperties.length === 0 ? (
              <div className="p-lg text-center">
                <Building2 className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
                <h3 className="text-h3 font-medium text-content mb-2">No properties found</h3>
                <p className="text-small text-content-secondary">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={selectedIds.length === filteredProperties.length && filteredProperties.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Property
                      </th>
                      <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Agent
                      </th>
                      <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        List Price
                      </th>
                      <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Offer
                      </th>
                      <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-tertiary">
                        Response
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-surface-secondary/50 transition-colors">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.includes(prop.id)}
                            onCheckedChange={() => toggleSelect(prop.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-body font-medium text-content">{prop.address}</p>
                          <p className="text-small text-content-secondary">
                            {prop.city}, {prop.state} {prop.zip}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-surface-secondary flex items-center justify-center">
                              <User className="h-4 w-4 text-content-tertiary" />
                            </div>
                            <div>
                              <p className="text-small font-medium text-content">{prop.agent_name || "Unknown"}</p>
                              <p className="text-tiny text-content-tertiary">{prop.agent_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-body tabular-nums">
                          {formatCurrency(prop.list_price)}
                        </td>
                        <td className="px-4 py-3 text-right text-body tabular-nums font-medium text-brand">
                          {formatCurrency(prop.offer_amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={cn("capitalize", statusColors[prop.status])} size="sm">
                            {prop.status === "pending" ? "Queued" : prop.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={cn("capitalize", responseColors[prop.response_status || "pending"])}
                            size="sm"
                          >
                            {prop.response_status?.replace("_", " ") || "Pending"}
                          </Badge>
                        </td>
                        <td className="px-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 hover:bg-surface-tertiary rounded-small transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-content-tertiary" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white">
                              {prop.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleMarkSent(prop.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Mark as Sent
                                </DropdownMenuItem>
                              )}
                              {prop.agent_email && (
                                <DropdownMenuItem
                                  onClick={() => (window.location.href = `mailto:${prop.agent_email}`)}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                              )}
                              {prop.response_status === "interested" && !prop.property_id && (
                                <DropdownMenuItem onClick={() => handleConvertToLead(prop)}>
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  Convert to Lead
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="mt-lg">
          {!respondedProperties || respondedProperties.length === 0 ? (
            <Card variant="default" padding="lg" className="text-center">
              <MessageSquare className="h-12 w-12 text-content-tertiary/50 mx-auto mb-4" />
              <h3 className="text-h3 font-medium text-content mb-2">No responses yet</h3>
              <p className="text-small text-content-secondary">
                Responses will appear here as agents reply to your outreach.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {respondedProperties.map((prop) => {
                const temp = getTemperature(prop.response_status);
                return (
                  <Card key={prop.id} variant="default" padding="md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-body font-medium text-content">{prop.address}</h3>
                          {temp === "hot" && (
                            <Badge className="bg-success/10 text-success">
                              <Flame className="h-3 w-3 mr-1" />
                              Hot
                            </Badge>
                          )}
                          {temp === "warm" && (
                            <Badge className="bg-warning/10 text-warning">
                              <ThermometerSun className="h-3 w-3 mr-1" />
                              Warm
                            </Badge>
                          )}
                          {temp === "cold" && (
                            <Badge className="bg-info/10 text-info">
                              <ThermometerSnowflake className="h-3 w-3 mr-1" />
                              Cold
                            </Badge>
                          )}
                        </div>
                        <p className="text-small text-content-secondary mb-2">
                          {prop.agent_name} • {prop.agent_email}
                        </p>
                        {prop.response_content && (
                          <div className="p-3 bg-surface-secondary rounded-medium mt-3">
                            <p className="text-small text-content italic">"{prop.response_content}"</p>
                          </div>
                        )}
                        {prop.responded_at && (
                          <p className="text-tiny text-content-tertiary mt-2">
                            Responded {format(parseISO(prop.responded_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {prop.agent_email && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => (window.location.href = `mailto:${prop.agent_email}`)}
                          >
                            Reply
                          </Button>
                        )}
                        {prop.response_status === "interested" && !prop.property_id && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConvertToLead(prop)}
                            loading={convertingId === prop.id}
                          >
                            Convert to Lead
                          </Button>
                        )}
                        {prop.property_id && (
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/properties/${prop.property_id}`)}>
                            View Lead
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-lg space-y-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <Card variant="default" padding="md">
              <h3 className="text-body font-medium text-content mb-4">Emails Sent Over Time</h3>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--content-tertiary))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--content-tertiary))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="sent" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-content-tertiary">No data yet</div>
              )}
            </Card>

            <Card variant="default" padding="md">
              <h3 className="text-body font-medium text-content mb-4">Campaign Funnel</h3>
              <div className="space-y-3">
                {funnelData.map((item) => {
                  const maxValue = Math.max(...funnelData.map((d) => d.value), 1);
                  const width = (item.value / maxValue) * 100;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-small">
                        <span className="text-content">{item.name}</span>
                        <span className="font-medium tabular-nums">{item.value}</span>
                      </div>
                      <div className="h-6 bg-surface-secondary rounded-small overflow-hidden">
                        <div
                          className="h-full rounded-small transition-all"
                          style={{ width: `${width}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card variant="default" padding="md">
            <h3 className="text-body font-medium text-content mb-4">Conversion Rates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-surface-secondary rounded-medium">
                <p className="text-h2 font-bold text-brand tabular-nums">{openRate}%</p>
                <p className="text-small text-content-secondary">Open Rate</p>
              </div>
              <div className="text-center p-4 bg-surface-secondary rounded-medium">
                <p className="text-h2 font-bold text-success tabular-nums">{responseRate}%</p>
                <p className="text-small text-content-secondary">Response Rate</p>
              </div>
              <div className="text-center p-4 bg-surface-secondary rounded-medium">
                <p className="text-h2 font-bold text-warning tabular-nums">
                  {campaign.responded_count > 0
                    ? ((interestedCount / campaign.responded_count) * 100).toFixed(1)
                    : "0.0"}
                  %
                </p>
                <p className="text-small text-content-secondary">Interest Rate</p>
              </div>
              <div className="text-center p-4 bg-surface-secondary rounded-medium">
                <p className="text-h2 font-bold text-info tabular-nums">
                  {properties?.filter((p) => p.property_id).length || 0}
                </p>
                <p className="text-small text-content-secondary">Converted</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-lg">
          <Card variant="default" padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-h3 font-medium text-content">Offer Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Offer Formula</span>
                    <span className="text-small font-medium text-content capitalize">
                      {campaign.offer_formula_type === "percentage"
                        ? `${campaign.offer_percentage}% of list price`
                        : campaign.offer_formula_type === "fixed"
                        ? `$${campaign.offer_fixed_discount?.toLocaleString()} discount`
                        : "Custom per property"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Earnest Money</span>
                    <span className="text-small font-medium text-content">
                      {campaign.include_earnest_money ? formatCurrency(campaign.earnest_money) : "Not included"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Closing Timeline</span>
                    <span className="text-small font-medium text-content">{campaign.closing_timeline}</span>
                  </div>
                </div>

                <h3 className="text-h3 font-medium text-content pt-4">Schedule Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Batch Size</span>
                    <span className="text-small font-medium text-content">
                      {campaign.batch_size_per_day || 50} emails/day
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-subtle">
                    <span className="text-small text-content-secondary">Follow-ups</span>
                    <span className="text-small font-medium text-content">
                      {campaign.followup_enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  {campaign.scheduled_start && (
                    <div className="flex justify-between py-2 border-b border-border-subtle">
                      <span className="text-small text-content-secondary">Scheduled Start</span>
                      <span className="text-small font-medium text-content">
                        {format(parseISO(campaign.scheduled_start), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-h3 font-medium text-content">Email Template</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-small font-medium text-content-secondary mb-1">Subject Line</p>
                    <p className="text-body text-content">{campaign.email_subject || "—"}</p>
                  </div>
                  <div>
                    <p className="text-small font-medium text-content-secondary mb-1">Email Body</p>
                    <pre className="text-small text-content whitespace-pre-wrap font-sans p-4 bg-surface-secondary rounded-medium max-h-64 overflow-y-auto">
                      {campaign.email_body || "No template set"}
                    </pre>
                  </div>
                </div>

                {campaign.followup_enabled && campaign.followup_sequences && Array.isArray(campaign.followup_sequences) && campaign.followup_sequences.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-h3 font-medium text-content pt-4">Follow-up Sequences</h3>
                    {(campaign.followup_sequences as Array<{ days_after: number; subject: string; body: string }>).map((seq, idx) => (
                      <div key={idx} className="p-3 bg-surface-secondary rounded-medium">
                        <p className="text-small font-medium text-content">
                          Follow-up {idx + 1} ({seq.days_after} days after)
                        </p>
                        <p className="text-tiny text-content-secondary mt-1">{seq.subject}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaign.name}"? This will also remove all associated property data.
              This action cannot be undone.
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
