import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMailTemplates, useDeleteMailTemplate, useCreateMailTemplate } from "@/hooks/useMailCampaigns";
import { DEFAULT_TEMPLATES } from "@/lib/default-templates";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal,
  Trash2,
  Copy,
  Edit,
  Eye,
  Star,
  Sparkles,
  Mail,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const TYPE_LABELS: Record<string, string> = {
  postcard_4x6: "4×6 Postcard",
  postcard_6x9: "6×9 Postcard",
  postcard_6x11: "6×11 Postcard",
  letter: "Letter",
  yellow_letter: "Yellow Letter",
};

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "postcards", label: "Postcards" },
  { value: "letters", label: "Letters" },
  { value: "yellow_letters", label: "Yellow Letters" },
];

export default function MailTemplates() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useMailTemplates();
  const deleteTemplate = useDeleteMailTemplate();
  const createTemplate = useCreateMailTemplate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [showDefaultsDialog, setShowDefaultsDialog] = React.useState(false);

  const filteredTemplates = React.useMemo(() => {
    if (!templates) return [];
    let filtered = templates;
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeFilter !== "all") {
      filtered = filtered.filter(t => {
        if (activeFilter === "postcards") return t.type.startsWith("postcard");
        if (activeFilter === "letters") return t.type === "letter";
        if (activeFilter === "yellow_letters") return t.type === "yellow_letter";
        return true;
      });
    }
    
    return filtered;
  }, [templates, searchQuery, activeFilter]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTemplate.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleUseDefaultTemplate = async (template: typeof DEFAULT_TEMPLATES[0]) => {
    try {
      await createTemplate.mutateAsync({
        name: template.name,
        type: template.type,
        description: template.description,
        front_html: template.front_html,
        back_html: template.back_html,
        is_default: false,
      });
      setShowDefaultsDialog(false);
      toast.success("Template created from default!");
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const getAspectRatio = (type: string): number => {
    if (type.startsWith("postcard")) return 3 / 2;
    return 17 / 22; // Letter
  };

  return (
    <PageLayout>
      <PageHeader
        title="Mail Templates"
        description="Create and manage your direct mail designs"
        action={
          <Button variant="primary" asChild>
            <Link to="/mail/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Link>
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList>
            {FILTER_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="group overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              {/* Thumbnail Preview */}
              <div className="relative bg-muted">
                <AspectRatio ratio={getAspectRatio(template.type)}>
                  <div 
                    className="absolute inset-0 p-2 overflow-hidden bg-white"
                    style={{
                      transform: "scale(0.35)",
                      transformOrigin: "top left",
                      width: "285%",
                      height: "285%",
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: template.front_html || "" }} />
                  </div>
                </AspectRatio>
                
                {/* Hover Overlay */}
                <Link 
                  to={`/mail/templates/${template.id}`}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Button variant="secondary" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/mail/templates/${template.id}`}
                      className="text-body font-medium hover:text-brand transition-colors block truncate"
                    >
                      {template.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" size="sm">
                        {TYPE_LABELS[template.type] || template.type}
                      </Badge>
                      {template.is_default && (
                        <Badge variant="default" size="sm" className="gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/mail/templates/${template.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteId(template.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-tiny text-content-tertiary mt-2">
                  Updated {format(new Date(template.updated_at), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchQuery || activeFilter !== "all" ? (
        <NoResultsState 
          query={searchQuery || activeFilter} 
          onClear={() => {
            setSearchQuery("");
            setActiveFilter("all");
          }} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-24 w-24 rounded-full bg-brand/10 flex items-center justify-center mb-6">
            <Mail className="h-12 w-12 text-brand" />
          </div>
          <h3 className="text-h2 font-semibold mb-2">No templates yet</h3>
          <p className="text-content-secondary mb-6 max-w-sm">
            Create your first template or use one of our pre-built designs to get started quickly.
          </p>
          <div className="flex gap-3">
            <Button variant="primary" asChild>
              <Link to="/mail/templates/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom
              </Link>
            </Button>
            <Button variant="secondary" onClick={() => setShowDefaultsDialog(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Browse Defaults
            </Button>
          </div>
        </div>
      )}

      {/* Default Templates Dialog */}
      <Dialog open={showDefaultsDialog} onOpenChange={setShowDefaultsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Pre-Built Templates</DialogTitle>
            <DialogDescription>
              Choose from our professionally designed templates to get started quickly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {DEFAULT_TEMPLATES.map((template) => (
              <Card 
                key={template.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleUseDefaultTemplate(template)}
              >
                <div className="bg-muted">
                  <AspectRatio ratio={getAspectRatio(template.type)}>
                    <div 
                      className="absolute inset-0 p-2 overflow-hidden bg-white"
                      style={{
                        transform: "scale(0.3)",
                        transformOrigin: "top left",
                        width: "333%",
                        height: "333%",
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: template.front_html }} />
                    </div>
                  </AspectRatio>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium">{template.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" size="sm">
                      {TYPE_LABELS[template.type]}
                    </Badge>
                  </div>
                  <p className="text-tiny text-content-secondary mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this template. Campaigns using this template will not be affected.
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
