import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Upload,
  FileText,
  Image,
  File,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  FolderOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc" | "other";
  size: string;
  uploadedAt: string;
  category: "contract" | "inspection" | "title" | "photos" | "other";
}

const sampleDocuments: Document[] = [
  {
    id: "1",
    name: "Purchase_Agreement_v2.pdf",
    type: "pdf",
    size: "245 KB",
    uploadedAt: "Jan 25, 2026",
    category: "contract",
  },
  {
    id: "2",
    name: "Inspection_Report.pdf",
    type: "pdf",
    size: "1.2 MB",
    uploadedAt: "Jan 24, 2026",
    category: "inspection",
  },
  {
    id: "3",
    name: "Front_Exterior.jpg",
    type: "image",
    size: "850 KB",
    uploadedAt: "Jan 22, 2026",
    category: "photos",
  },
  {
    id: "4",
    name: "Kitchen_Before.jpg",
    type: "image",
    size: "720 KB",
    uploadedAt: "Jan 22, 2026",
    category: "photos",
  },
  {
    id: "5",
    name: "Title_Search.pdf",
    type: "pdf",
    size: "180 KB",
    uploadedAt: "Jan 20, 2026",
    category: "title",
  },
];

function getTypeIcon(type: Document["type"]) {
  switch (type) {
    case "pdf":
      return FileText;
    case "image":
      return Image;
    case "doc":
      return FileText;
    default:
      return File;
  }
}

function getCategoryColor(category: Document["category"]) {
  switch (category) {
    case "contract":
      return "bg-info/10 text-info";
    case "inspection":
      return "bg-warning/10 text-warning";
    case "title":
      return "bg-purple-100 text-purple-600";
    case "photos":
      return "bg-success/10 text-success";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function DocumentsTab() {
  const documents = sampleDocuments;

  // Group by category
  const groupedDocs = documents.reduce((groups, doc) => {
    const category = doc.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  const categoryLabels: Record<string, string> = {
    contract: "Contracts",
    inspection: "Inspections",
    title: "Title & Legal",
    photos: "Photos",
    other: "Other",
  };

  return (
    <div className="p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h3 className="text-h3 font-medium text-foreground">Documents</h3>
          <p className="text-small text-muted-foreground">
            {documents.length} files uploaded
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Upload />}>
          Upload
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-h3 font-medium text-foreground mb-2">No documents yet</h4>
          <p className="text-small text-muted-foreground mb-4">
            Upload contracts, photos, inspection reports, and other files
          </p>
          <Button variant="secondary" size="sm" icon={<Plus />}>
            Add First Document
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <div key={category}>
              <h4 className="text-small font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {categoryLabels[category]} ({docs.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {docs.map((doc) => {
                  const Icon = getTypeIcon(doc.type);
                  const categoryColor = getCategoryColor(doc.category);

                  return (
                    <Card
                      key={doc.id}
                      variant="default"
                      padding="none"
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {doc.type === "image" ? (
                        <div className="h-32 bg-gradient-to-br from-background-secondary to-background-tertiary flex items-center justify-center">
                          <Image className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      ) : (
                        <div className="h-20 bg-gradient-to-br from-background-secondary to-background-tertiary flex items-center justify-center">
                          <Icon className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                      
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-small font-medium text-foreground truncate">
                              {doc.name}
                            </p>
                            <p className="text-tiny text-muted-foreground">
                              {doc.size} • {doc.uploadedAt}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-background-secondary rounded-small transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 bg-white">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
