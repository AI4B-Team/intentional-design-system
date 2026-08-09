import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Plus,
  Search,
  LayoutGrid,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  initial: string;
  color: string;
}

// Mock workspaces - in real implementation, fetch from database
const mockWorkspaces: Workspace[] = [
  { id: "1", name: "Dolmar", initial: "D", color: "bg-orange-500" },
  { id: "2", name: "Brian's Space", initial: "B", color: "bg-emerald-500" },
];

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>(mockWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState(mockWorkspaces[0].id);
  const [pendingDelete, setPendingDelete] = React.useState<Workspace | null>(null);

  const activeWorkspace =
    workspaces.find((ws) => ws.id === activeWorkspaceId) ?? workspaces[0];

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceId(workspace.id);
    setOpen(false);
    setSearchQuery("");
  };

  const handleRenameWorkspace = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Workspace Name Cannot Be Empty");
      return;
    }
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === id
          ? { ...ws, name: trimmed, initial: trimmed.charAt(0).toUpperCase() }
          : ws
      )
    );
    toast.success("Workspace Renamed");
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    if (workspaces.length <= 1) {
      toast.error("You Must Keep At Least One Workspace");
      setPendingDelete(null);
      return;
    }
    const remaining = workspaces.filter((ws) => ws.id !== workspace.id);
    setWorkspaces(remaining);
    if (activeWorkspaceId === workspace.id) {
      setActiveWorkspaceId(remaining[0].id);
    }
    setPendingDelete(null);
    toast.success(`Deleted "${workspace.name}"`);
  };

  const dropdown = (
    <WorkspaceDropdownContent
      workspaces={filteredWorkspaces}
      activeWorkspace={activeWorkspace}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectWorkspace={handleSelectWorkspace}
      onRenameWorkspace={handleRenameWorkspace}
      onRequestDelete={setPendingDelete}
    />
  );

  const deleteDialog = (
    <AlertDialog
      open={!!pendingDelete}
      onOpenChange={(o) => !o && setPendingDelete(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingDelete
              ? `"${pendingDelete.name}" and its workspace settings will be removed. This cannot be undone.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => pendingDelete && handleDeleteWorkspace(pendingDelete)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center justify-center w-full h-10 rounded-lg transition-colors",
                    "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="bg-popover text-popover-foreground border-border">
              Workspace
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            side="right"
            align="start"
            className="w-64 p-0 bg-popover border-border"
            sideOffset={8}
          >
            {dropdown}
          </PopoverContent>
        </Popover>
        {deleteDialog}
      </TooltipProvider>
    );
  }

  return (
    <div className="px-2">
      <div className="flex items-center gap-1.5 px-1 mb-1">
        <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Workspace
        </span>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors",
              "bg-brand-accent hover:bg-brand-accent/80 text-white"
            )}
          >
            <span className="font-medium truncate">{activeWorkspace.name}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          className="w-[--radix-popover-trigger-width] p-0 bg-popover border-border"
          sideOffset={4}
        >
          {dropdown}
        </PopoverContent>
      </Popover>
      {deleteDialog}
    </div>
  );
}

interface WorkspaceDropdownContentProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectWorkspace: (workspace: Workspace) => void;
  onRenameWorkspace: (id: string, name: string) => void;
  onRequestDelete: (workspace: Workspace) => void;
}

function WorkspaceDropdownContent({
  workspaces,
  activeWorkspace,
  searchQuery,
  onSearchChange,
  onSelectWorkspace,
  onRenameWorkspace,
  onRequestDelete,
}: WorkspaceDropdownContentProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftName, setDraftName] = React.useState("");

  const startEditing = (workspace: Workspace) => {
    setEditingId(workspace.id);
    setDraftName(workspace.name);
  };

  const commitEditing = () => {
    if (editingId) onRenameWorkspace(editingId, draftName);
    setEditingId(null);
  };

  return (
    <div className="p-2">
      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Spaces"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 bg-background border-border text-white placeholder:text-muted-foreground h-9"
        />
      </div>

      {/* Workspace List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {workspaces.map((workspace) => {
          const isEditing = editingId === workspace.id;

          return (
            <div
              key={workspace.id}
              onClick={() => !isEditing && onSelectWorkspace(workspace)}
              role={isEditing ? undefined : "button"}
              tabIndex={isEditing ? undefined : 0}
              onKeyDown={(e) => {
                if (isEditing) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectWorkspace(workspace);
                }
              }}
              className={cn(
                "group flex items-center gap-2 w-full px-2 py-2 rounded-lg transition-colors",
                "text-foreground/80",
                !isEditing && "cursor-pointer hover:bg-muted",
                activeWorkspace.id === workspace.id && "bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-md text-white text-sm font-semibold flex-shrink-0",
                  workspace.color
                )}
              >
                {workspace.initial}
              </div>

              {isEditing ? (
                <>
                  <Input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") commitEditing();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-7 min-w-0 flex-1 bg-background border-border text-sm"
                  />
                  <button
                    type="button"
                    aria-label="Save Workspace Name"
                    onClick={(e) => {
                      e.stopPropagation();
                      commitEditing();
                    }}
                    className="p-1 rounded-md text-emerald-500 hover:bg-background flex-shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel Rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:bg-background flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 min-w-0 text-left text-sm truncate">
                    {workspace.name}
                  </span>
                  {activeWorkspace.id === workspace.id && (
                    <Check className="h-4 w-4 text-brand-accent flex-shrink-0" />
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      type="button"
                      aria-label={`Rename ${workspace.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(workspace);
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${workspace.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDelete(workspace);
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-background"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Create New Space */}
      <Button
        variant="outline"
        className="w-full mt-2 border-dashed border-border text-foreground/80 hover:bg-muted hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Space
      </Button>
    </div>
  );
}
