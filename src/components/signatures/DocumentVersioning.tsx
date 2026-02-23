import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  GitBranch,
  Clock,
  RotateCcw,
  Eye,
  Diff,
  FileText,
  CheckCircle,
  ArrowLeftRight,
  User,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export interface DocumentVersion {
  id: string;
  version: number;
  label: string;
  createdAt: Date;
  createdBy: string;
  changesSummary: string;
  isActive: boolean;
  changes: VersionChange[];
}

interface VersionChange {
  field: string;
  type: "added" | "removed" | "modified";
  oldValue?: string;
  newValue?: string;
}

// ─── Mock Data ──────────────────────────────────────────────

function generateMockVersions(): DocumentVersion[] {
  const now = new Date();
  return [
    {
      id: "v4", version: 4, label: "Final — signed", createdAt: new Date(now.getTime() - 3600000),
      createdBy: "You", changesSummary: "Minor typo fix in closing paragraph",
      isActive: true,
      changes: [
        { field: "Closing Paragraph", type: "modified", oldValue: "...will be finalizd...", newValue: "...will be finalized..." },
      ],
    },
    {
      id: "v3", version: 3, label: "Counter-offer terms", createdAt: new Date(now.getTime() - 86400000),
      createdBy: "You", changesSummary: "Updated purchase price and closing date",
      isActive: false,
      changes: [
        { field: "Purchase Price", type: "modified", oldValue: "$150,000", newValue: "$145,000" },
        { field: "Closing Date", type: "modified", oldValue: "March 15, 2026", newValue: "March 30, 2026" },
        { field: "Inspection Period", type: "added", newValue: "14 business days" },
      ],
    },
    {
      id: "v2", version: 2, label: "Added contingencies", createdAt: new Date(now.getTime() - 86400000 * 3),
      createdBy: "You", changesSummary: "Added financing and inspection contingencies",
      isActive: false,
      changes: [
        { field: "Financing Contingency", type: "added", newValue: "Buyer has 21 days to secure financing" },
        { field: "Inspection Contingency", type: "added", newValue: "10 business days" },
        { field: "Earnest Money", type: "modified", oldValue: "$500", newValue: "$1,000" },
      ],
    },
    {
      id: "v1", version: 1, label: "Initial draft", createdAt: new Date(now.getTime() - 86400000 * 7),
      createdBy: "You", changesSummary: "Initial document created from template",
      isActive: false,
      changes: [],
    },
  ];
}

// ─── Component ──────────────────────────────────────────────

interface DocumentVersioningProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  onRestore?: (version: DocumentVersion) => void;
}

export function DocumentVersioning({ isOpen, onClose, documentName, onRestore }: DocumentVersioningProps) {
  const [versions] = React.useState<DocumentVersion[]>(generateMockVersions);
  const [compareMode, setCompareMode] = React.useState(false);
  const [compareA, setCompareA] = React.useState<string | null>(null);
  const [compareB, setCompareB] = React.useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = React.useState<string | null>(null);

  const handleRestore = (version: DocumentVersion) => {
    onRestore?.(version);
    toast.success(`Restored to v${version.version}: ${version.label}`);
  };

  const comparedVersions = compareA && compareB ? {
    a: versions.find((v) => v.id === compareA),
    b: versions.find((v) => v.id === compareB),
  } : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-brand" />
            </div>
            <div>
              <DialogTitle>Version History</DialogTitle>
              <DialogDescription>{documentName} · {versions.length} versions</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Compare toggle */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant={compareMode ? "default" : "outline"}
            className="gap-1.5"
            onClick={() => { setCompareMode(!compareMode); setCompareA(null); setCompareB(null); }}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Compare Versions
          </Button>
          {compareMode && (
            <span className="text-xs text-muted-foreground">
              {!compareA ? "Select first version" : !compareB ? "Select second version" : "Comparing"}
            </span>
          )}
        </div>

        {/* Compare diff view */}
        {comparedVersions?.a && comparedVersions?.b && (
          <Card padding="md" className="bg-surface-secondary">
            <div className="flex items-center gap-2 mb-3">
              <Diff className="h-4 w-4 text-brand" />
              <span className="text-sm font-semibold text-foreground">
                v{comparedVersions.a.version} → v{comparedVersions.b.version}
              </span>
            </div>
            <div className="space-y-2">
              {comparedVersions.b.changes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No detailed changes available for initial version</p>
              ) : comparedVersions.b.changes.map((change, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {change.type === "added" && <Plus className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />}
                  {change.type === "removed" && <Minus className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />}
                  {change.type === "modified" && <Diff className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-medium text-foreground">{change.field}</span>
                    {change.oldValue && (
                      <span className="text-xs text-destructive/80 line-through ml-2">{change.oldValue}</span>
                    )}
                    {change.newValue && (
                      <span className="text-xs text-success ml-2">{change.newValue}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Version list */}
        <div className="relative pl-6 space-y-0">
          {versions.map((version, i) => {
            const isLast = i === versions.length - 1;
            const isExpanded = expandedVersion === version.id;
            const isSelectedA = compareA === version.id;
            const isSelectedB = compareB === version.id;

            return (
              <div key={version.id} className="relative pb-4">
                {!isLast && <div className="absolute left-[-12px] top-6 bottom-0 w-px bg-border-subtle" />}
                <div className={cn(
                  "absolute left-[-20px] top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-background",
                  version.isActive ? "border-success" : isSelectedA || isSelectedB ? "border-brand" : "border-border-subtle"
                )}>
                  {version.isActive ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <span className="text-[9px] font-bold text-muted-foreground">{version.version}</span>
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-lg border p-3 transition-colors cursor-pointer",
                    version.isActive ? "border-success/30 bg-success/5" :
                    isSelectedA || isSelectedB ? "border-brand bg-brand/5" :
                    "border-border-subtle hover:bg-surface-secondary"
                  )}
                  onClick={() => {
                    if (compareMode) {
                      if (!compareA) setCompareA(version.id);
                      else if (!compareB && version.id !== compareA) setCompareB(version.id);
                      else { setCompareA(version.id); setCompareB(null); }
                    } else {
                      setExpandedVersion(isExpanded ? null : version.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">v{version.version}</span>
                        <span className="text-sm text-muted-foreground">— {version.label}</span>
                        {version.isActive && <Badge variant="outline" className="text-[10px] h-4 text-success border-success/30">Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{version.changesSummary}</p>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1"><User className="h-3 w-3" />{version.createdBy}</div>
                      <div>{format(version.createdAt, "MMM d, h:mm a")}</div>
                    </div>
                  </div>

                  {/* Expanded changes */}
                  {isExpanded && version.changes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-subtle space-y-1.5">
                      {version.changes.map((change, ci) => (
                        <div key={ci} className="flex items-center gap-2 text-xs">
                          {change.type === "added" && <Badge variant="outline" className="text-[9px] h-4 bg-success/10 text-success">Added</Badge>}
                          {change.type === "removed" && <Badge variant="outline" className="text-[9px] h-4 bg-destructive/10 text-destructive">Removed</Badge>}
                          {change.type === "modified" && <Badge variant="outline" className="text-[9px] h-4 bg-warning/10 text-warning">Modified</Badge>}
                          <span className="font-medium text-foreground">{change.field}</span>
                        </div>
                      ))}
                      {!version.isActive && onRestore && (
                        <Button size="sm" variant="outline" className="mt-2 gap-1.5 h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleRestore(version); }}>
                          <RotateCcw className="h-3 w-3" />
                          Restore This Version
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
