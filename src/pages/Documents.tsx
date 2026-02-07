import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
  Download,
  Trash2,
  Edit,
  Eye,
  FolderOpen,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Menu,
  Palette,
  Copy,
  FolderInput,
  Star,
  FileCheck,
  Image,
  ScrollText,
  FilePlus2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DocumentFolder {
  id: string;
  name: string;
  icon: React.ElementType;
  fileCount: number;
  lastModified: Date;
  color: "blue" | "purple" | "green" | "orange" | "rose";
}

const folderColors = {
  blue: {
    tab: "bg-blue-200",
    card: "bg-blue-50",
    accent: "bg-blue-100/50",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  purple: {
    tab: "bg-purple-400",
    card: "bg-purple-500",
    accent: "bg-purple-400/50",
    text: "text-white",
    iconBg: "bg-purple-400",
  },
  green: {
    tab: "bg-emerald-200",
    card: "bg-emerald-50",
    accent: "bg-emerald-100/50",
    text: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  orange: {
    tab: "bg-orange-200",
    card: "bg-orange-50",
    accent: "bg-orange-100/50",
    text: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  rose: {
    tab: "bg-rose-200",
    card: "bg-rose-50",
    accent: "bg-rose-100/50",
    text: "text-rose-600",
    iconBg: "bg-rose-100",
  },
};

const mockFolders: DocumentFolder[] = [
  {
    id: "1",
    name: "Contracts",
    icon: FileCheck,
    fileCount: 12,
    lastModified: new Date("2026-02-07"),
    color: "blue",
  },
  {
    id: "2",
    name: "Disclosures",
    icon: ScrollText,
    fileCount: 8,
    lastModified: new Date("2026-02-06"),
    color: "purple",
  },
  {
    id: "3",
    name: "Property Photos",
    icon: Image,
    fileCount: 24,
    lastModified: new Date("2026-02-07"),
    color: "green",
  },
  {
    id: "4",
    name: "Title & Legal",
    icon: FileText,
    fileCount: 5,
    lastModified: new Date("2026-02-05"),
    color: "orange",
  },
  {
    id: "5",
    name: "Addendums",
    icon: FilePlus2,
    fileCount: 3,
    lastModified: new Date("2026-02-04"),
    color: "rose",
  },
];

interface FolderCardProps {
  folder: DocumentFolder;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  isActive?: boolean;
}

function FolderCard({ folder, onDelete, onRename, isActive }: FolderCardProps) {
  const colors = folderColors[folder.color];
  const Icon = folder.icon;
  const isHighlighted = folder.color === "purple";

  return (
    <div className="relative group">
      {/* Folder Tab */}
      <div
        className={cn(
          "absolute -top-2 left-4 w-20 h-4 rounded-t-lg",
          colors.tab
        )}
      />
      
      {/* Folder Body */}
      <div
        className={cn(
          "relative rounded-xl p-4 min-h-[140px] transition-all duration-200 hover:shadow-lg cursor-pointer",
          isHighlighted ? colors.card : colors.card,
          isHighlighted ? "shadow-md" : "shadow-sm border border-border/30"
        )}
      >
        {/* Accent Strip */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-2 rounded-t-xl",
            colors.tab
          )}
        />

        {/* Header */}
        <div className="flex items-start justify-between mt-2">
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-5 w-5",
                isHighlighted ? "text-white" : colors.text
              )}
            />
            <h3
              className={cn(
                "font-semibold",
                isHighlighted ? "text-white" : "text-foreground"
              )}
            >
              {folder.name}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isHighlighted
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-background/50 hover:bg-background text-muted-foreground"
                )}
              >
                <Menu className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Palette className="h-4 w-4" />
                  Change Color
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-400" />
                    Blue
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <div className="h-4 w-4 rounded-full bg-purple-400" />
                    Purple
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <div className="h-4 w-4 rounded-full bg-emerald-400" />
                    Green
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <div className="h-4 w-4 rounded-full bg-orange-400" />
                    Orange
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <div className="h-4 w-4 rounded-full bg-rose-400" />
                    Rose
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem className="gap-2" onClick={() => onRename(folder.id)}>
                <Edit className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FolderInput className="h-4 w-4" />
                Move To
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Star className="h-4 w-4" />
                Add To Favorites
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => onDelete(folder.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* File Count */}
        <p
          className={cn(
            "text-sm mt-1",
            isHighlighted ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {folder.fileCount} Files
        </p>

        {/* Last Modified */}
        <div
          className={cn(
            "absolute bottom-3 left-4 right-4 px-3 py-1.5 rounded-lg text-xs",
            isHighlighted ? "bg-purple-400/60" : colors.accent
          )}
        >
          <span className={isHighlighted ? "text-white/80" : "text-muted-foreground"}>
            Last Modified:{" "}
          </span>
          <span className={cn("font-medium", isHighlighted ? "text-white" : "text-foreground")}>
            {format(folder.lastModified, "MMM dd")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [folders, setFolders] = React.useState<DocumentFolder[]>(mockFolders);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newFolder, setNewFolder] = React.useState({
    name: "",
    color: "blue" as DocumentFolder["color"],
  });

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFolder = () => {
    if (!newFolder.name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    const folder: DocumentFolder = {
      id: Date.now().toString(),
      name: newFolder.name,
      icon: FolderOpen,
      fileCount: 0,
      lastModified: new Date(),
      color: newFolder.color,
    };

    setFolders([folder, ...folders]);
    setNewFolder({ name: "", color: "blue" });
    setIsAddDialogOpen(false);
    toast.success("Folder created");
  };

  const handleDelete = (id: string) => {
    setFolders(folders.filter((f) => f.id !== id));
    toast.success("Folder deleted");
  };

  const handleRename = (id: string) => {
    toast.info("Rename functionality coming soon");
  };

  return (
    <AppLayout>
      <PageLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">ASSETS</h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-background"
              />
            </div>

            {/* View Toggles */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filter */}
            <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* New Folder Button */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Add a new folder to organize your documents.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Folder Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Contracts"
                      value={newFolder.name}
                      onChange={(e) =>
                        setNewFolder({ ...newFolder, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {(["blue", "purple", "green", "orange", "rose"] as const).map(
                        (color) => (
                          <button
                            key={color}
                            onClick={() => setNewFolder({ ...newFolder, color })}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              color === "blue" && "bg-blue-400",
                              color === "purple" && "bg-purple-400",
                              color === "green" && "bg-emerald-400",
                              color === "orange" && "bg-orange-400",
                              color === "rose" && "bg-rose-400",
                              newFolder.color === color &&
                                "ring-2 ring-offset-2 ring-primary"
                            )}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddFolder}>Create Folder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Folders Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}

            {filteredFolders.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">
                  No Folders Found
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first folder"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Folder
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-4">
            {filteredFolders.map((folder) => {
              const Icon = folder.icon;
              const colors = folderColors[folder.color];
              
              return (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", colors.iconBg)}>
                      <Icon className={cn("h-5 w-5", colors.text)} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {folder.fileCount} Files
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {format(folder.lastModified, "MMM dd, yyyy")}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Menu className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => handleRename(folder.id)}>
                          <Edit className="h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive focus:text-destructive"
                          onClick={() => handleDelete(folder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageLayout>
    </AppLayout>
  );
}
