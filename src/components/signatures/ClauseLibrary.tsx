import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen, Copy, Edit, History, Tag, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Clause, categoryConfig, mockClauses, TemplateCategory } from "@/types/signature-templates";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClauseLibraryProps {
  onInsertClause?: (clause: Clause) => void;
  selectable?: boolean;
}

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: "purchase", label: "Purchase Agreement" },
  { value: "assignment", label: "Assignment" },
  { value: "disclosure", label: "Disclosure" },
  { value: "addendum", label: "Addendum" },
  { value: "financing", label: "Financing" },
  { value: "lease", label: "Lease" },
  { value: "other", label: "Other" },
];

export function ClauseLibrary({ onInsertClause, selectable = false }: ClauseLibraryProps) {
  const [search, setSearch] = React.useState("");
  const [previewClause, setPreviewClause] = React.useState<Clause | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [customClauses, setCustomClauses] = React.useState<Clause[]>([]);

  // Add clause form state
  const [newName, setNewName] = React.useState("");
  const [newCategory, setNewCategory] = React.useState<TemplateCategory>("purchase");
  const [newContent, setNewContent] = React.useState("");
  const [newTagInput, setNewTagInput] = React.useState("");
  const [newTags, setNewTags] = React.useState<string[]>([]);

  const allClauses = [...mockClauses, ...customClauses];

  const filtered = allClauses.filter((c) =>
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

  const resetAddForm = () => {
    setNewName("");
    setNewCategory("purchase");
    setNewContent("");
    setNewTags([]);
    setNewTagInput("");
  };

  const handleAddTag = () => {
    const tag = newTagInput.trim().toLowerCase();
    if (tag && !newTags.includes(tag)) {
      setNewTags((prev) => [...prev, tag]);
      setNewTagInput("");
    }
  };

  const handleSaveClause = () => {
    if (!newName.trim()) { toast.error("Clause name is required"); return; }
    if (!newContent.trim()) { toast.error("Clause content is required"); return; }

    const clause: Clause = {
      id: `cl-custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      content: newContent.trim(),
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newTags,
    };

    setCustomClauses((prev) => [...prev, clause]);
    resetAddForm();
    setAddOpen(false);
    toast.success("Clause added successfully");
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
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
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

      {/* Add Clause Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Clause</DialogTitle>
            <DialogDescription>Create a reusable clause for your document templates.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
            <div>
              <Label>Clause Name *</Label>
              <Input
                placeholder="e.g. As-Is Condition"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as TemplateCategory)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Content *</Label>
              <Textarea
                placeholder="Enter the clause text. Use {{variable_name}} for merge fields."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="mt-1.5 min-h-[120px] font-mono text-sm"
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  placeholder="Add a tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
              </div>
              {newTags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {newTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs gap-1 bg-surface-secondary">
                      {tag}
                      <button onClick={() => setNewTags((prev) => prev.filter((t) => t !== tag))} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => { resetAddForm(); setAddOpen(false); }}>Cancel</Button>
            <Button onClick={handleSaveClause} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Clause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clause Detail Dialog */}
      <Dialog open={!!previewClause} onOpenChange={(open) => !open && setPreviewClause(null)}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
          {previewClause && (
            <>
              <DialogHeader className="flex-shrink-0">
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

              <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
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

              <DialogFooter className="flex-shrink-0">
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
