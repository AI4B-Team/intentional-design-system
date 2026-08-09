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
  Loader2,
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
import { supabase } from "@/integrations/supabase/client";
import { useOrganization, type OrgRole } from "@/contexts/OrganizationContext";
import { useCreateOrganization } from "@/hooks/useOrganizationManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

interface Workspace {
  id: string;
  name: string;
  initial: string;
  color: string;
  role: OrgRole;
}

// Deterministic accent per workspace so colors stay stable across reloads
const WORKSPACE_COLORS = [
  "bg-orange-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 9973;
  return WORKSPACE_COLORS[hash % WORKSPACE_COLORS.length];
}

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const {
    organization,
    organizations,
    rolesByOrganization,
    switchOrganization,
    refreshOrganization,
    loading,
  } = useOrganization();

  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Workspace | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const createOrganization = useCreateOrganization();
  const queryClient = useQueryClient();

  const workspaces: Workspace[] = React.useMemo(
    () =>
      organizations.map((org) => ({
        id: org.id,
        name: org.name,
        initial: (org.name?.trim().charAt(0) || "W").toUpperCase(),
        color: colorForId(org.id),
        role: rolesByOrganization[org.id] ?? "member",
      })),
    [organizations, rolesByOrganization]
  );

  const activeWorkspace =
    workspaces.find((ws) => ws.id === organization?.id) ?? workspaces[0] ?? null;

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkspace = (workspace: Workspace) => {
    if (workspace.id !== organization?.id) {
      switchOrganization(workspace.id);
      toast.success(`Switched To ${workspace.name}`);
    }
    setOpen(false);
    setSearchQuery("");
  };

  const handleRenameWorkspace = async (workspace: Workspace, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Workspace Name Cannot Be Empty");
      return;
    }
    if (trimmed === workspace.name) return;
    if (!["owner", "admin"].includes(workspace.role)) {
      toast.error("Only Owners And Admins Can Rename A Workspace");
      return;
    }

    setBusy(true);
    const { error } = await supabase
      .from("organizations")
      .update({ name: trimmed })
      .eq("id", workspace.id);
    setBusy(false);

    if (error) {
      toast.error(error.message || "Failed To Rename Workspace");
      return;
    }
    await refreshOrganization();
    toast.success("Workspace Renamed");
  };

  const handleDeleteWorkspace = async (workspace: Workspace) => {
    if (workspace.role !== "owner") {
      toast.error("Only The Owner Can Delete A Workspace");
      setPendingDelete(null);
      return;
    }
    if (workspaces.length <= 1) {
      toast.error("You Must Keep At Least One Workspace");
      setPendingDelete(null);
      return;
    }

    setBusy(true);
    const { error } = await supabase.from("organizations").delete().eq("id", workspace.id);
    setBusy(false);
    setPendingDelete(null);

    if (error) {
      toast.error(error.message || "Failed To Delete Workspace");
      return;
    }

    if (organization?.id === workspace.id) {
      const next = workspaces.find((ws) => ws.id !== workspace.id);
      if (next) switchOrganization(next.id);
    }
    await refreshOrganization();
    toast.success(`Deleted "${workspace.name}"`);
  };

  const handleCreateWorkspace = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Workspace Name Is Required");
      return;
    }
    setBusy(true);
    try {
      const org = await createOrganization.mutateAsync({ name });
      switchOrganization(org.id);
      setCreateOpen(false);
      setNewName("");
    } finally {
      setBusy(false);
    }
  };

  const dropdown = (
    <WorkspaceDropdownContent
      workspaces={filteredWorkspaces}
      activeWorkspaceId={activeWorkspace?.id ?? null}
      searchQuery={searchQuery}
      loading={loading}
      busy={busy}
      onSearchChange={setSearchQuery}
      onSelectWorkspace={handleSelectWorkspace}
      onRenameWorkspace={handleRenameWorkspace}
      onRequestDelete={setPendingDelete}
      onCreateWorkspace={() => {
        setOpen(false);
        setNewName("");
        setCreateOpen(true);
      }}
    />
  );

  const createDialog = (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Space</DialogTitle>
          <DialogDescription>
            Spaces keep deals, contacts and settings separate. You can rename or delete it later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="new-workspace-name">Workspace Name</Label>
          <Input
            id="new-workspace-name"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateWorkspace();
            }}
            placeholder="e.g. Austin Acquisitions"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateWorkspace} disabled={busy || !newName.trim()}>
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
              ? `"${pendingDelete.name}" and all of its data will be permanently removed. This cannot be undone.`
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
              {activeWorkspace?.name ?? "Workspace"}
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
        {createDialog}
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
            <span className="font-medium truncate">
              {activeWorkspace?.name ?? (loading ? "Loading..." : "No Workspace")}
            </span>
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
      {createDialog}
    </div>
  );
}

interface WorkspaceDropdownContentProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  searchQuery: string;
  loading: boolean;
  busy: boolean;
  onSearchChange: (query: string) => void;
  onSelectWorkspace: (workspace: Workspace) => void;
  onRenameWorkspace: (workspace: Workspace, name: string) => void;
  onRequestDelete: (workspace: Workspace) => void;
  onCreateWorkspace: () => void;
}

function WorkspaceDropdownContent({
  workspaces,
  activeWorkspaceId,
  searchQuery,
  loading,
  busy,
  onSearchChange,
  onSelectWorkspace,
  onRenameWorkspace,
  onRequestDelete,
  onCreateWorkspace,
}: WorkspaceDropdownContentProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftName, setDraftName] = React.useState("");

  const startEditing = (workspace: Workspace) => {
    setEditingId(workspace.id);
    setDraftName(workspace.name);
  };

  const commitEditing = (workspace: Workspace) => {
    onRenameWorkspace(workspace, draftName);
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
        {loading && workspaces.length === 0 && (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Workspaces...
          </div>
        )}

        {!loading && workspaces.length === 0 && (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            {searchQuery ? "No Matching Workspaces" : "No Workspaces Yet"}
          </p>
        )}

        {workspaces.map((workspace) => {
          const isEditing = editingId === workspace.id;
          const canRename = ["owner", "admin"].includes(workspace.role);
          const canDelete = workspace.role === "owner";

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
                activeWorkspaceId === workspace.id && "bg-muted"
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
                      if (e.key === "Enter") commitEditing(workspace);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-7 min-w-0 flex-1 bg-background border-border text-sm"
                  />
                  <button
                    type="button"
                    aria-label="Save Workspace Name"
                    disabled={busy}
                    onClick={(e) => {
                      e.stopPropagation();
                      commitEditing(workspace);
                    }}
                    className="p-1 rounded-md text-emerald-500 hover:bg-background flex-shrink-0 disabled:opacity-50"
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
                  {activeWorkspaceId === workspace.id && (
                    <Check className="h-4 w-4 text-brand-accent flex-shrink-0" />
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                    {canRename && (
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
                    )}
                    {canDelete && (
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
                    )}
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
        onClick={onCreateWorkspace}
        className="w-full mt-2 border-dashed border-border text-foreground/80 hover:bg-muted hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Space
      </Button>
    </div>
  );
}
