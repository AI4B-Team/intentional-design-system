import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  ArrowLeft,
  MoreHorizontal,
  Search,
  Pencil,
  Copy,
  Layers,
  Download,
  Archive,
  Trash2,
  Phone,
  Mail,
  FileSpreadsheet,
  Plus,
  Target,
  Users,
  Flame,
  TrendingUp,
  ListFilter,
  Upload,
  Layers3,
  PenLine,
  Settings2,
  Eye,
  UserPlus,
  Ban,
  MapPin,
  Building2,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { RecordDetailSheet } from "@/components/lists/record-detail-sheet";
import { BulkActionsBar } from "@/components/lists/bulk-actions-bar";
import { ExportListModal } from "@/components/lists/export-list-modal";
import { ListSettingsSheet } from "@/components/lists/list-settings-sheet";

type ListType = "criteria" | "uploaded" | "stacked" | "manual";

interface ListRecord {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  owner_name: string | null;
  owner_type: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
  is_absentee: boolean | null;
  phone: string | null;
  email: string | null;
  motivation_score: number | null;
  list_match_count: number | null;
  source_lists: string[] | null;
  status: string | null;
  distress_indicators: string[] | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  estimated_value: number | null;
  estimated_equity_percent: number | null;
  mailing_address: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  created_at: string;
}

const listTypeConfig: Record<ListType, { label: string; icon: React.ElementType; color: string }> = {
  criteria: { label: "Criteria", icon: ListFilter, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  uploaded: { label: "Uploaded", icon: Upload, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  stacked: { label: "Stacked", icon: Layers3, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  manual: { label: "Manual", icon: PenLine, color: "bg-muted text-muted-foreground border-border" },
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  skip_traced: "bg-blue-500/10 text-blue-600",
  mailed: "bg-purple-500/10 text-purple-600",
  removed: "bg-destructive/10 text-destructive",
  contacted: "bg-orange-500/10 text-orange-600",
};

export default function ListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [motivationFilter, setMotivationFilter] = useState("all");
  const [absenteeFilter, setAbsenteeFilter] = useState("all");
  const [hasPhoneFilter, setHasPhoneFilter] = useState("all");
  const [matchCountFilter, setMatchCountFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fetch list details
  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ["list", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Fetch list records
  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["list-records", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("list_records")
        .select("*")
        .eq("list_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ListRecord[];
    },
    enabled: !!id && !!user,
  });

  // Fetch source list names for stacked lists
  const { data: sourceListNames = {} } = useQuery({
    queryKey: ["source-list-names", list?.stacked_from],
    queryFn: async () => {
      if (!list?.stacked_from || !Array.isArray(list.stacked_from) || list.stacked_from.length === 0) return {};
      const { data } = await supabase
        .from("lists")
        .select("id, name")
        .in("id", list.stacked_from as string[]);
      return Object.fromEntries((data || []).map(l => [l.id, l.name]));
    },
    enabled: !!list?.stacked_from && Array.isArray(list.stacked_from) && (list.stacked_from as string[]).length > 0,
  });

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.address?.toLowerCase().includes(query) ||
          r.owner_name?.toLowerCase().includes(query) ||
          r.city?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Motivation filter
    if (motivationFilter !== "all") {
      result = result.filter((r) => {
        const score = r.motivation_score || 0;
        if (motivationFilter === "high") return score >= 700;
        if (motivationFilter === "medium") return score >= 400 && score < 700;
        if (motivationFilter === "low") return score < 400;
        return true;
      });
    }

    // Absentee filter
    if (absenteeFilter !== "all") {
      result = result.filter((r) =>
        absenteeFilter === "yes" ? r.is_absentee : !r.is_absentee
      );
    }

    // Has phone filter
    if (hasPhoneFilter !== "all") {
      result = result.filter((r) =>
        hasPhoneFilter === "yes" ? !!r.phone : !r.phone
      );
    }

    // Match count filter (for stacked lists)
    if (matchCountFilter !== "all" && list?.list_type === "stacked") {
      const minMatches = parseInt(matchCountFilter);
      result = result.filter((r) => (r.list_match_count || 0) >= minMatches);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "motivation_high":
        result.sort((a, b) => (b.motivation_score || 0) - (a.motivation_score || 0));
        break;
      case "motivation_low":
        result.sort((a, b) => (a.motivation_score || 0) - (b.motivation_score || 0));
        break;
      case "alpha":
        result.sort((a, b) => (a.address || "").localeCompare(b.address || ""));
        break;
    }

    return result;
  }, [records, searchQuery, statusFilter, motivationFilter, absenteeFilter, hasPhoneFilter, matchCountFilter, sortBy, list?.list_type]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeRecords = records.filter((r) => r.status !== "removed");
    const highMotivation = activeRecords.filter((r) => (r.motivation_score || 0) >= 700).length;
    const skipTraced = activeRecords.filter((r) => r.status === "skip_traced" || !!r.phone).length;
    const mailed = activeRecords.filter((r) => r.status === "mailed").length;

    return {
      total: list?.total_records || records.length,
      unique: list?.unique_records || activeRecords.length,
      highMotivation,
      highMotivationPercent: activeRecords.length > 0 ? Math.round((highMotivation / activeRecords.length) * 100) : 0,
      skipTraced,
      skipTracedPercent: activeRecords.length > 0 ? Math.round((skipTraced / activeRecords.length) * 100) : 0,
      mailed,
    };
  }, [records, list]);

  // Toggle record selection
  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]
    );
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedRecords.length === filteredRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map((r) => r.id));
    }
  };

  // Get motivation score styling
  const getMotivationStyle = (score: number | null) => {
    if (!score) return { color: "text-muted-foreground", icon: null };
    if (score >= 800) return { color: "text-red-500", icon: <Flame className="h-4 w-4" /> };
    if (score >= 600) return { color: "text-orange-500", icon: null };
    if (score >= 400) return { color: "text-yellow-500", icon: null };
    return { color: "text-muted-foreground", icon: null };
  };

  const selectedRecord = records.find((r) => r.id === selectedRecordId);
  const typeConfig = list?.list_type ? listTypeConfig[list.list_type as ListType] : null;
  const TypeIcon = typeConfig?.icon || ListFilter;

  if (listLoading || !list) {
    return (
      <PageLayout breadcrumbs={[{ label: "Marketing" }, { label: "Lists", href: "/marketing/lists" }, { label: "Loading..." }]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading list...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Marketing", href: "/marketing" },
        { label: "Lists", href: "/marketing/lists" },
        { label: list.name },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/marketing/lists")}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Lists
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{list.name}</h1>
              <Badge variant="outline" className={typeConfig?.color}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig?.label}
              </Badge>
              <Badge variant={list.status === "active" ? "default" : "secondary"}>
                {list.status}
              </Badge>
            </div>
            {list.description && (
              <p className="text-muted-foreground text-sm mt-1">{list.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                <DropdownMenuItem><Layers className="h-4 w-4 mr-2" />Stack</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportModalOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Archive className="h-4 w-4 mr-2" />Archive</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unique.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Unique</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Target className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.highMotivation.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({stats.highMotivationPercent}%)
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">High Motivation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Phone className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.skipTraced.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({stats.skipTracedPercent}%)
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">Skip Traced</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Mail className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.mailed.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Mailed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stacked List Additional Stats */}
        {list.list_type === "stacked" && list.stacked_from && (
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers3 className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Stacked from {(list.stacked_from as string[]).length} lists:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(list.stacked_from as string[]).map((listId) => (
                  <Badge key={listId} variant="outline" className="bg-background">
                    {sourceListNames[listId] || listId}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Minimum match: {list.stack_criteria === "all" ? "All lists" : `${list.stack_criteria}+ lists`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Skip Trace All ({stats.unique.toLocaleString()})
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Send to Mail
          </Button>
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add to Properties
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search addresses, owners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="skip_traced">Skip Traced</SelectItem>
                    <SelectItem value="mailed">Mailed</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={motivationFilter} onValueChange={setMotivationFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Motivation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Motivation</SelectItem>
                    <SelectItem value="high">High (700+)</SelectItem>
                    <SelectItem value="medium">Medium (400-699)</SelectItem>
                    <SelectItem value="low">Low (&lt;400)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={absenteeFilter} onValueChange={setAbsenteeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Absentee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    <SelectItem value="yes">Absentee</SelectItem>
                    <SelectItem value="no">Owner Occupied</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={hasPhoneFilter} onValueChange={setHasPhoneFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Has Phone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">Has Phone</SelectItem>
                    <SelectItem value="no">No Phone</SelectItem>
                  </SelectContent>
                </Select>

                {list.list_type === "stacked" && (
                  <Select value={matchCountFilter} onValueChange={setMatchCountFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Matches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Matches</SelectItem>
                      <SelectItem value="2">2+ Lists</SelectItem>
                      <SelectItem value="3">3+ Lists</SelectItem>
                      <SelectItem value="4">4+ Lists</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="motivation_high">Motivation ↑</SelectItem>
                    <SelectItem value="motivation_low">Motivation ↓</SelectItem>
                    <SelectItem value="alpha">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardContent className="p-0">
            {recordsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading records...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-medium mb-1">No records found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "This list has no records yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                          onCheckedChange={toggleAllSelection}
                        />
                      </TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-center">Motivation</TableHead>
                      {list.list_type === "stacked" && <TableHead className="text-center">Matches</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const motivation = getMotivationStyle(record.motivation_score);
                      const isSelected = selectedRecords.includes(record.id);

                      return (
                        <TableRow
                          key={record.id}
                          className={`cursor-pointer ${isSelected ? "bg-primary/5" : "hover:bg-muted/50"}`}
                          onClick={() => setSelectedRecordId(record.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRecordSelection(record.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{record.address}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.zip}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {record.owner_type === "corporate" && (
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{record.owner_name || "-"}</span>
                            </div>
                            {record.is_absentee && (
                              <Badge variant="outline" className="text-xs mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                Absentee
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{record.city || "-"}</TableCell>
                          <TableCell>{record.state || "-"}</TableCell>
                          <TableCell className="text-center">
                            <div className={`flex items-center justify-center gap-1 font-medium ${motivation.color}`}>
                              {motivation.icon}
                              {record.motivation_score || "-"}
                            </div>
                          </TableCell>
                          {list.list_type === "stacked" && (
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                {(record.list_match_count || 0) >= 3 && (
                                  <Flame className="h-4 w-4 text-orange-500" />
                                )}
                                <span>In {record.list_match_count} lists</span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge className={statusColors[record.status || "active"]}>
                              {record.status || "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedRecordId(record.id)}>
                                  <Eye className="h-4 w-4 mr-2" />View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="h-4 w-4 mr-2" />Skip Trace
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserPlus className="h-4 w-4 mr-2" />Add to Properties
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />Send Mail
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <X className="h-4 w-4 mr-2" />Remove from List
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Ban className="h-4 w-4 mr-2" />Add to Suppression
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results count */}
        {filteredRecords.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {filteredRecords.length.toLocaleString()} of {records.length.toLocaleString()} records
          </p>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedRecords.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedRecords.length}
          onClear={() => setSelectedRecords([])}
          listId={id!}
          selectedRecordIds={selectedRecords}
        />
      )}

      {/* Record Detail Sheet */}
      <RecordDetailSheet
        open={!!selectedRecordId}
        onOpenChange={(open) => !open && setSelectedRecordId(null)}
        record={selectedRecord || null}
        sourceListNames={sourceListNames}
      />

      {/* Export Modal */}
      <ExportListModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        listId={id!}
        listName={list.name}
        totalRecords={records.length}
        filteredRecords={filteredRecords.length}
        selectedRecords={selectedRecords.length}
      />

      {/* Settings Sheet */}
      <ListSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        list={list}
      />
    </PageLayout>
  );
}
