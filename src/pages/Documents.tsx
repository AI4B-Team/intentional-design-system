import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  FileText,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Eye,
  PenTool,
  FolderOpen,
  Clock,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  name: string;
  description: string;
  category: "contract" | "agreement" | "disclosure" | "addendum" | "other";
  createdAt: Date;
  updatedAt: Date;
  signatureEnabled: boolean;
  fileUrl?: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Purchase Agreement Template",
    description: "Standard residential purchase agreement for property acquisitions",
    category: "contract",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    signatureEnabled: true,
  },
  {
    id: "2",
    name: "Assignment Contract",
    description: "Wholesale assignment of contract template",
    category: "agreement",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    signatureEnabled: true,
  },
  {
    id: "3",
    name: "Lead Paint Disclosure",
    description: "Required disclosure for pre-1978 properties",
    category: "disclosure",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    signatureEnabled: true,
  },
  {
    id: "4",
    name: "Seller Financing Addendum",
    description: "Addendum for seller-financed transactions",
    category: "addendum",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-12"),
    signatureEnabled: false,
  },
];

const categoryColors: Record<string, string> = {
  contract: "bg-info/10 text-info border-info/20",
  agreement: "bg-success/10 text-success border-success/20",
  disclosure: "bg-warning/10 text-warning border-warning/20",
  addendum: "bg-accent/10 text-accent border-accent/20",
  other: "bg-muted text-muted-foreground border-border",
};

export default function Documents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [documents, setDocuments] = React.useState<Document[]>(mockDocuments);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newDoc, setNewDoc] = React.useState({
    name: "",
    description: "",
    category: "contract" as Document["category"],
    signatureEnabled: true,
  });

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDocument = () => {
    if (!newDoc.name.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    const doc: Document = {
      id: Date.now().toString(),
      name: newDoc.name,
      description: newDoc.description,
      category: newDoc.category,
      createdAt: new Date(),
      updatedAt: new Date(),
      signatureEnabled: newDoc.signatureEnabled,
    };

    setDocuments([doc, ...documents]);
    setNewDoc({ name: "", description: "", category: "contract", signatureEnabled: true });
    setIsAddDialogOpen(false);
    toast.success("Document template created");
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
    toast.success("Document deleted");
  };

  const handleSendForSignature = (doc: Document) => {
    navigate(`/apps/signatures?template=${doc.id}`);
  };

  return (
    <AppLayout>
      <PageLayout>
        <PageHeader
          title="Documents"
          description="Manage document templates for contracts, agreements, and digital signatures"
        >
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Document Template</DialogTitle>
                <DialogDescription>
                  Create a new document template for contracts and digital signatures.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Purchase Agreement"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this template..."
                    value={newDoc.description}
                    onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newDoc.category}
                    onValueChange={(value) => setNewDoc({ ...newDoc, category: value as Document["category"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                      <SelectItem value="disclosure">Disclosure</SelectItem>
                      <SelectItem value="addendum">Addendum</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="signatureEnabled"
                    checked={newDoc.signatureEnabled}
                    onChange={(e) => setNewDoc({ ...newDoc, signatureEnabled: e.target.checked })}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="signatureEnabled" className="text-sm font-normal cursor-pointer">
                    Enable digital signatures for this template
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDocument}>Create Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} padding="md" className="group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                    <Badge variant="outline" className={cn("text-xs mt-1", categoryColors[doc.category])}>
                      {doc.category}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    {doc.signatureEnabled && (
                      <DropdownMenuItem className="gap-2" onClick={() => handleSendForSignature(doc)}>
                        <PenTool className="h-4 w-4" />
                        Send for Signature
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{doc.description}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated {format(doc.updatedAt, "MMM d, yyyy")}
                </div>
                {doc.signatureEnabled && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <PenTool className="h-3 w-3" />
                    e-Sign
                  </Badge>
                )}
              </div>
            </Card>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-foreground mb-1">No Documents Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first document template"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Template
                </Button>
              )}
            </div>
          )}
        </div>
      </PageLayout>
    </AppLayout>
  );
}
