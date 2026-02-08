import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DocumentItem, TransactionStageId, getStageConfig } from "@/lib/transaction-stages";
import { toast } from "sonner";

interface TCDocumentChecklistProps {
  documents: DocumentItem[];
  onUpdateDocument: (id: string, updates: Partial<DocumentItem>) => void;
  className?: string;
}

export function TCDocumentChecklist({
  documents,
  onUpdateDocument,
  className,
}: TCDocumentChecklistProps) {
  const [expanded, setExpanded] = useState(true);

  const uploadedCount = documents.filter(d => d.isUploaded).length;
  const requiredCount = documents.filter(d => d.isRequired).length;
  const requiredUploadedCount = documents.filter(d => d.isRequired && d.isUploaded).length;

  // Group by stage
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.stageId]) {
      acc[doc.stageId] = [];
    }
    acc[doc.stageId].push(doc);
    return acc;
  }, {} as Record<TransactionStageId, DocumentItem[]>);

  const handleUpload = (doc: DocumentItem) => {
    // Simulate upload
    onUpdateDocument(doc.id, { 
      isUploaded: true, 
      uploadedAt: new Date(),
      fileUrl: "#"
    });
    toast.success(`${doc.label} uploaded`);
  };

  return (
    <Card className={cn("p-4", className)}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Document Checklist</h3>
                <p className="text-sm text-muted-foreground">
                  {uploadedCount} of {documents.length} uploaded
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {requiredUploadedCount < requiredCount && (
                <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200">
                  <AlertCircle className="h-3 w-3" />
                  {requiredCount - requiredUploadedCount} Required
                </Badge>
              )}
              {requiredUploadedCount === requiredCount && requiredCount > 0 && (
                <Badge className="bg-success/10 text-success border-success/20 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All Required
                </Badge>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          {Object.entries(groupedDocs).map(([stageId, docs]) => {
            const stageConfig = getStageConfig(stageId as TransactionStageId);
            return (
              <div key={stageId}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className={cn("text-xs", stageConfig.bgColor, stageConfig.color)}>
                    {stageConfig.shortLabel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {docs.filter(d => d.isUploaded).length}/{docs.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {docs.map(doc => (
                    <DocumentRow 
                      key={doc.id}
                      document={doc}
                      onUpload={handleUpload}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface DocumentRowProps {
  document: DocumentItem;
  onUpload: (doc: DocumentItem) => void;
}

function DocumentRow({ document, onUpload }: DocumentRowProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg",
      document.isUploaded ? "bg-success/5" : "bg-muted/30"
    )}>
      <div className={cn(
        "h-8 w-8 rounded flex items-center justify-center",
        document.isUploaded ? "bg-success/10" : "bg-muted"
      )}>
        {document.isUploaded ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            document.isUploaded && "text-muted-foreground"
          )}>
            {document.label}
          </span>
          {document.isRequired && !document.isUploaded && (
            <Badge variant="outline" className="text-xs">Required</Badge>
          )}
        </div>
      </div>

      {document.isUploaded ? (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => onUpload(document)}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </Button>
      )}
    </div>
  );
}
