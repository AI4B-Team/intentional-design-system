import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, BookOpen, Copy, Edit, History, Tag, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Clause, categoryConfig, mockClauses } from "@/types/signature-templates";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClauseLibraryProps {
  onInsertClause?: (clause: Clause) => void;
  selectable?: boolean;
}

export function ClauseLibrary({ onInsertClause, selectable = false }: ClauseLibraryProps) {
  const [search, setSearch] = React.useState("");
  const [previewClause, setPreviewClause] = React.useState<Clause | null>(null);

  const filtered = mockClauses.filter((c) =>
    c.isActive &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  );

  const handleCopy = (clause: Clause, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(clause.content);
    toast.success(`"${clause.name}" copied to clipboard`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clauses by name, content, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Clause
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((clause) => {
          const catInfo = categoryConfig[clause.category];
          return (
            <Card
              key={clause.id}
              padding="md"
              className={cn(
                "hover:shadow-md transition-all",
                selectable && "cursor-pointer"
              )}
              onClick={() => selectable && onInsertClause ? onInsertClause(clause) : setPreviewClause(clause)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  <h4 className="font-semibold text-sm text-foreground">{clause.name}</h4>
                  <Badge variant="outline" className={cn("text-[10px]", catInfo.color)}>
                    {catInfo.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <History className="h-3 w-3" />
                    v{clause.version}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleCopy(clause, e)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {clause.content}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {clause.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] bg-surface-secondary">
                    <Tag className="h-2.5 w-2.5 mr-0.5" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No clauses found</p>
        </div>
      )}

      {/* Clause Detail Dialog */}
      <Dialog open={!!previewClause} onOpenChange={(open) => !open && setPreviewClause(null)}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          {previewClause && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{previewClause.name}</DialogTitle>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <History className="h-3 w-3" />
                    v{previewClause.version}
                  </Badge>
                </div>
                <DialogDescription>
                  Last updated {format(previewClause.updatedAt, "MMM d, yyyy")}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="rounded-lg bg-surface-secondary p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {previewClause.content}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-xs", categoryConfig[previewClause.category].color)}>
                    {categoryConfig[previewClause.category].label}
                  </Badge>
                  {previewClause.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-surface-secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="gap-2" onClick={() => handleCopy(previewClause)}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                {selectable && onInsertClause && (
                  <Button className="gap-2" onClick={() => { onInsertClause(previewClause); setPreviewClause(null); }}>
                    <Plus className="h-4 w-4" />
                    Insert Clause
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
