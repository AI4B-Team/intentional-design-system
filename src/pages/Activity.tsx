import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { useActivityLog, formatActivityMessage, type ActivityLogEntry, type EntityType, type ActivityAction } from "@/hooks/useActivityLog";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Spinner } from "@/components/ui/spinner";
import { format, formatDistanceToNow } from "date-fns";
import {
  Activity,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Plus,
  Pencil,
  UserPlus,
  ArrowRight,
  DollarSign,
  Phone,
  FileText,
} from "lucide-react";

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "assigned", label: "Assigned" },
  { value: "status_changed", label: "Status Changed" },
  { value: "offer_made", label: "Offers Made" },
  { value: "appointment_scheduled", label: "Appointments" },
  { value: "call_logged", label: "Calls Logged" },
];

const ENTITY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "property", label: "Properties" },
  { value: "offer", label: "Offers" },
  { value: "appointment", label: "Appointments" },
  { value: "outreach", label: "Outreach" },
  { value: "buyer", label: "Buyers" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getActionIcon(action: string) {
  switch (action) {
    case "created":
      return <Plus className="h-4 w-4" />;
    case "updated":
      return <Pencil className="h-4 w-4" />;
    case "assigned":
    case "unassigned":
      return <UserPlus className="h-4 w-4" />;
    case "status_changed":
      return <ArrowRight className="h-4 w-4" />;
    case "offer_made":
      return <DollarSign className="h-4 w-4" />;
    case "appointment_scheduled":
      return <Calendar className="h-4 w-4" />;
    case "call_logged":
      return <Phone className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getActionBadgeVariant(action: string): "default" | "success" | "warning" | "info" | "secondary" {
  switch (action) {
    case "created":
      return "success";
    case "offer_made":
      return "warning";
    case "assigned":
      return "info";
    default:
      return "secondary";
  }
}

export default function ActivityPage() {
  const navigate = useNavigate();
  const { organization, members } = useOrganization();
  const { canViewAllActivity } = usePermissions();
  
  const [memberFilter, setMemberFilter] = React.useState("all");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [entityFilter, setEntityFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Redirect if no permission
  React.useEffect(() => {
    if (!canViewAllActivity && organization) {
      navigate("/dashboard");
    }
  }, [canViewAllActivity, organization, navigate]);

  const { data: activities, isLoading } = useActivityLog({
    userId: memberFilter !== "all" ? memberFilter : undefined,
    entityType: entityFilter !== "all" ? entityFilter as EntityType : undefined,
    limit: 100,
  });

  // Filter activities client-side for action and search
  const filteredActivities = React.useMemo(() => {
    if (!activities) return [];
    
    return activities.filter((activity) => {
      // Action filter
      if (actionFilter !== "all" && activity.action !== actionFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const message = formatActivityMessage(activity).toLowerCase();
        const entityName = (activity.entity_name || "").toLowerCase();
        return message.includes(query) || entityName.includes(query);
      }
      
      return true;
    });
  }, [activities, actionFilter, searchQuery]);

  const handleExport = () => {
    if (!filteredActivities.length) return;
    
    const csv = [
      ["Time", "Member", "Action", "Entity Type", "Entity Name", "Details"].join(","),
      ...filteredActivities.map((a) => [
        format(new Date(a.created_at), "yyyy-MM-dd HH:mm:ss"),
        a.user?.full_name || a.user?.email || "Unknown",
        a.action,
        a.entity_type,
        a.entity_name || "",
        formatActivityMessage(a),
      ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!canViewAllActivity) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-semibold text-content">Team Activity</h1>
            <p className="text-body text-content-secondary mt-1">
              Track all team actions across your organization
            </p>
          </div>
          
          <Button 
            variant="outline" 
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            disabled={filteredActivities.length === 0}
          >
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card variant="default" padding="md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <Input
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={memberFilter} onValueChange={setMemberFilter}>
              <SelectTrigger className="w-[180px]">
                <User className="h-4 w-4 mr-2 text-content-tertiary" />
                <SelectValue placeholder="Team Member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {members.filter((m) => m.status === "active").map((member) => (
                  <SelectItem key={member.id} value={member.user_id}>
                    {member.user?.full_name || member.user?.email || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2 text-content-tertiary" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Activity Table */}
        <Card variant="default" padding="none">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-3 text-content-tertiary opacity-50" />
              <p className="text-body text-content-secondary">No activity found</p>
              <p className="text-small text-content-tertiary mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Time</TableHead>
                  <TableHead className="w-[180px]">Member</TableHead>
                  <TableHead className="w-[140px]">Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => {
                  const userName = activity.user?.full_name || activity.user?.email || "Unknown";
                  const message = formatActivityMessage(activity);

                  return (
                    <TableRow key={activity.id} className="group">
                      <TableCell>
                        <div>
                          <p className="text-small text-content">
                            {format(new Date(activity.created_at), "h:mm a")}
                          </p>
                          <p className="text-tiny text-content-tertiary">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-tiny bg-brand-accent/10 text-brand-accent">
                              {getInitials(userName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-small font-medium text-content truncate max-w-[120px]">
                            {userName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getActionBadgeVariant(activity.action)} 
                          size="sm"
                          className="gap-1"
                        >
                          {getActionIcon(activity.action)}
                          <span className="capitalize">{activity.action.replace("_", " ")}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-small text-content">{message}</p>
                          {activity.entity_name && (
                            <p className="text-tiny text-content-tertiary">
                              {activity.entity_type}: {activity.entity_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
