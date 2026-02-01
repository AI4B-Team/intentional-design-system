import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus, Search, LayoutGrid } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Workspace {
  id: string;
  name: string;
  initial: string;
  color: string;
}

// Mock workspaces - in real implementation, fetch from database
const mockWorkspaces: Workspace[] = [
  { id: "1", name: "Brian's Space", initial: "B", color: "bg-emerald-500" },
  { id: "2", name: "Dolmar", initial: "D", color: "bg-orange-500" },
];

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeWorkspace, setActiveWorkspace] = React.useState<Workspace>(mockWorkspaces[0]);

  const filteredWorkspaces = mockWorkspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    setOpen(false);
    setSearchQuery("");
  };

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-center w-full h-10 rounded-lg transition-colors",
                  "hover:bg-slate-700/50 text-slate-400 hover:text-white"
                )}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Workspace
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          side="right"
          align="start"
          className="w-64 p-0 bg-slate-800 border-slate-700"
          sideOffset={8}
        >
          <WorkspaceDropdownContent
            workspaces={filteredWorkspaces}
            activeWorkspace={activeWorkspace}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectWorkspace={handleSelectWorkspace}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="px-2">
      <div className="flex items-center gap-1.5 px-1 mb-1">
        <LayoutGrid className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
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
          className="w-[--radix-popover-trigger-width] p-0 bg-slate-800 border-slate-700"
          sideOffset={4}
        >
          <WorkspaceDropdownContent
            workspaces={filteredWorkspaces}
            activeWorkspace={activeWorkspace}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectWorkspace={handleSelectWorkspace}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface WorkspaceDropdownContentProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectWorkspace: (workspace: Workspace) => void;
}

function WorkspaceDropdownContent({
  workspaces,
  activeWorkspace,
  searchQuery,
  onSearchChange,
  onSelectWorkspace,
}: WorkspaceDropdownContentProps) {
  return (
    <div className="p-2">
      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search Spaces"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-9"
        />
      </div>

      {/* Workspace List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => onSelectWorkspace(workspace)}
            className={cn(
              "flex items-center gap-3 w-full px-2 py-2 rounded-lg transition-colors",
              "text-slate-300 hover:bg-slate-700/50",
              activeWorkspace.id === workspace.id && "bg-slate-700/50"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-md text-white text-sm font-semibold",
                workspace.color
              )}
            >
              {workspace.initial}
            </div>
            <span className="flex-1 text-left text-sm">{workspace.name}</span>
            {activeWorkspace.id === workspace.id && (
              <Check className="h-4 w-4 text-brand-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Create New Space */}
      <Button
        variant="outline"
        className="w-full mt-2 border-dashed border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Space
      </Button>
    </div>
  );
}
