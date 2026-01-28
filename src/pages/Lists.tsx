import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Layers,
  Download,
  Trash2,
  ListFilter,
  Upload,
  FileSpreadsheet,
  HelpCircle,
  Coins,
  TrendingUp,
  Users,
  Target,
  ClipboardList,
  Layers3,
  PenLine,
} from "lucide-react";
import { CreateListModal } from "@/components/lists/create-list-modal";
import { ListPresetsSection } from "@/components/lists/list-presets-section";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

type ListType = "criteria" | "uploaded" | "stacked" | "manual";

interface List {
  id: string;
  name: string;
  description: string | null;
  list_type: ListType;
  status: string;
  total_records: number;
  unique_records: number;
  high_motivation_count: number;
  created_at: string;
}

const listTypeConfig: Record<ListType, { label: string; icon: React.ElementType; color: string }> = {
  criteria: { label: "Criteria", icon: ListFilter, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  uploaded: { label: "Uploaded", icon: Upload, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  stacked: { label: "Stacked", icon: Layers3, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  manual: { label: "Manual", icon: PenLine, color: "bg-muted text-muted-foreground border-border" },
};

export default function Lists() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["lists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as List[];
    },
    enabled: !!user,
  });

  const filteredLists = lists.filter((list) => {
    const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "archived" ? list.status === "archived" : list.list_type === activeTab && list.status !== "archived");
    return matchesSearch && matchesTab;
  });

  const stats = {
    totalLists: lists.filter(l => l.status !== "archived").length,
    totalRecords: lists.reduce((sum, l) => sum + (l.total_records || 0), 0),
    uniqueProperties: lists.reduce((sum, l) => sum + (l.unique_records || 0), 0),
    highMotivation: lists.reduce((sum, l) => sum + (l.high_motivation_count || 0), 0),
  };

  const handleListClick = (listId: string) => {
    navigate(`/marketing/lists/${listId}`);
  };

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Marketing", href: "/marketing" },
        { label: "Lists" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">List Builder</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Build targeted lists from criteria, upload CSVs, or stack multiple lists together to find highly motivated sellers.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground text-sm">
              Build and manage your motivated seller lists
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">2,500</span>
              <span className="text-muted-foreground">credits</span>
            </Badge>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLists}</p>
                  <p className="text-sm text-muted-foreground">Total Lists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{stats.uniqueProperties.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Unique Properties</p>
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
                  <p className="text-2xl font-bold">{stats.highMotivation.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">High Motivation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Presets */}
        <ListPresetsSection onSelectPreset={(presetId) => {
          setCreateModalOpen(true);
        }} />

        {/* Lists Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Lists</TabsTrigger>
                  <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
                  <TabsTrigger value="criteria">Criteria</TabsTrigger>
                  <TabsTrigger value="stacked">Stacked</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading lists...
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="p-12 text-center">
                <ListFilter className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="font-medium mb-1">No lists found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeTab === "all"
                    ? "Create your first list to get started"
                    : `No ${activeTab} lists yet`}
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create List
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Records</TableHead>
                      <TableHead className="text-right">Unique</TableHead>
                      <TableHead className="text-right">High Motive</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLists.map((list) => {
                      const typeConfig = listTypeConfig[list.list_type];
                      const TypeIcon = typeConfig.icon;

                      return (
                        <TableRow
                          key={list.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleListClick(list.id)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{list.name}</p>
                              {list.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {list.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1.5 ${typeConfig.color}`}>
                              <TypeIcon className="h-3 w-3" />
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(list.total_records || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {(list.unique_records || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-orange-500 font-medium">
                              {(list.high_motivation_count || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(list.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleListClick(list.id);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Layers className="h-4 w-4 mr-2" />
                                  Stack
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => e.stopPropagation()}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateListModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </PageLayout>
  );
}
