import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMailTemplates, useDeleteMailTemplate } from "@/hooks/useMailCampaigns";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal,
  Trash2,
  Copy,
  Edit,
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

const TYPE_LABELS: Record<string, string> = {
  postcard_4x6: "4×6 Postcard",
  postcard_6x9: "6×9 Postcard",
  postcard_6x11: "6×11 Postcard",
  letter: "Letter",
  yellow_letter: "Yellow Letter",
};

export default function MailTemplates() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useMailTemplates();
  const deleteTemplate = useDeleteMailTemplate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const filteredTemplates = React.useMemo(() => {
    if (!templates) return [];
    if (!searchQuery) return templates;
    return templates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTemplate.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Mail Templates"
        description="Manage your postcard and letter templates"
        action={
          <Button variant="primary" asChild>
            <Link to="/mail/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <CardTitle className="text-body">
                        <Link 
                          to={`/mail/templates/${template.id}`}
                          className="hover:text-brand transition-colors"
                        >
                          {template.name}
                        </Link>
                      </CardTitle>
                      <Badge variant="secondary" size="sm">
                        {TYPE_LABELS[template.type] || template.type}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-small text-content-secondary line-clamp-2 mb-3">
                    {template.description}
                  </p>
                )}
                {template.merge_fields && template.merge_fields.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.merge_fields.slice(0, 4).map((field) => (
                      <Badge key={field} variant="outline" size="sm">
                        {field}
                      </Badge>
                    ))}
                    {template.merge_fields.length > 4 && (
                      <Badge variant="outline" size="sm">
                        +{template.merge_fields.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
                <p className="text-tiny text-content-tertiary mt-3">
                  Updated {format(new Date(template.updated_at), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchQuery ? (
        <NoResultsState query={searchQuery} onClear={() => setSearchQuery("")} />
      ) : (
        <NoDataState
          entityName="templates"
          onAdd={() => navigate("/mail/templates/new")}
          addLabel="Create Template"
        />
      )}

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
