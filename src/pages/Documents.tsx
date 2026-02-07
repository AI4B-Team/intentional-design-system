import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLayout } from "@/components/layout/page-layout";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Camera,
  ScrollText,
  FilePlus2,
  Check,
  ShieldCheck,
  DollarSign,
  Megaphone,
  FileSignature,
  Shield,
  Receipt,
  Users,
  Wrench,
  SearchCheck,
  Scale,
  Building2,
  Landmark,
  Home,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Banknote,
  ClipboardList,
  Key,
  Hammer,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { POFManager } from "@/components/documents/POFManager";

type FolderColor = "blue" | "purple" | "green" | "orange" | "rose";

interface DocumentFolder {
  id: string;
  name: string;
  icon: React.ElementType;
  fileCount: number;
  lastModified: Date;
  color: FolderColor;
  isFavorite: boolean;
  parentId: string | null;
  isPropertyFolder?: boolean;
}

const folderColors: Record<FolderColor, {
  tab: string;
  card: string;
  accent: string;
  text: string;
  iconBg: string;
  name: string;
}> = {
  blue: {
    tab: "bg-blue-200",
    card: "bg-blue-50",
    accent: "bg-blue-100/50",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
    name: "Blue",
  },
  purple: {
    tab: "bg-purple-200",
    card: "bg-purple-50",
    accent: "bg-purple-100/50",
    text: "text-purple-600",
    iconBg: "bg-purple-100",
    name: "Purple",
  },
  green: {
    tab: "bg-emerald-200",
    card: "bg-emerald-50",
    accent: "bg-emerald-100/50",
    text: "text-emerald-600",
    iconBg: "bg-emerald-100",
    name: "Green",
  },
  orange: {
    tab: "bg-orange-200",
    card: "bg-orange-50",
    accent: "bg-orange-100/50",
    text: "text-orange-600",
    iconBg: "bg-orange-100",
    name: "Orange",
  },
  rose: {
    tab: "bg-rose-200",
    card: "bg-rose-50",
    accent: "bg-rose-100/50",
    text: "text-rose-600",
    iconBg: "bg-rose-100",
    name: "Rose",
  },
};

const colorOptions: FolderColor[] = ["blue", "purple", "green", "orange", "rose"];

// Helper to create transaction sub-folders
const createTransactionSubFolders = (parentId: string): DocumentFolder[] => [
  { id: `${parentId}-photos`, name: "Property Photos", icon: Camera, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-contracts`, name: "Contracts", icon: FileCheck, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-disclosures`, name: "Disclosures", icon: ScrollText, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-title`, name: "Title & Escrow", icon: Landmark, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-inspections`, name: "Inspections", icon: SearchCheck, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-financing`, name: "Financing & POF", icon: Banknote, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-closing`, name: "Closing Documents", icon: Key, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-repairs`, name: "Repairs & Rehab", icon: Hammer, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-comps`, name: "Comps & Analysis", icon: FileSpreadsheet, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
  { id: `${parentId}-addendums`, name: "Addendums", icon: FilePlus2, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId },
];

const initialFolders: DocumentFolder[] = [
  // Root level folders
  {
    id: "properties",
    name: "Properties",
    icon: Home,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "templates",
    name: "Templates",
    icon: ClipboardList,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "company-docs",
    name: "Company Documents",
    icon: Building2,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    icon: Scale,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "marketing",
    name: "Marketing Materials",
    icon: Megaphone,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: Shield,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "tax",
    name: "Tax Documents",
    icon: Receipt,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "vendors",
    name: "Contractors & Vendors",
    icon: Wrench,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  {
    id: "pof",
    name: "Proof Of Funds",
    icon: DollarSign,
    fileCount: 0,
    lastModified: new Date(),
    color: "blue",
    isFavorite: false,
    parentId: null,
  },
  
  // Sample property transaction folders (children of "properties")
  {
    id: "prop-123-main",
    name: "123 Main St Transaction",
    icon: MapPin,
    fileCount: 0,
    lastModified: new Date(),
    color: "green",
    isFavorite: false,
    parentId: "properties",
    isPropertyFolder: true,
  },
  {
    id: "prop-456-oak",
    name: "456 Oak Ave Transaction",
    icon: MapPin,
    fileCount: 0,
    lastModified: new Date(),
    color: "purple",
    isFavorite: false,
    parentId: "properties",
    isPropertyFolder: true,
  },
  {
    id: "prop-789-elm",
    name: "789 Elm Blvd Transaction",
    icon: MapPin,
    fileCount: 0,
    lastModified: new Date(),
    color: "orange",
    isFavorite: false,
    parentId: "properties",
    isPropertyFolder: true,
  },
  
  // Sub-folders for each property transaction
  ...createTransactionSubFolders("prop-123-main"),
  ...createTransactionSubFolders("prop-456-oak"),
  ...createTransactionSubFolders("prop-789-elm"),
  
  // Template sub-folders
  { id: "templates-contracts", name: "Contract Templates", icon: FileCheck, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId: "templates" },
  { id: "templates-disclosures", name: "Disclosure Templates", icon: ScrollText, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId: "templates" },
  { id: "templates-addendums", name: "Addendum Templates", icon: FilePlus2, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId: "templates" },
  { id: "templates-letters", name: "Letter Templates", icon: FileText, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId: "templates" },
  
  // Company docs sub-folders
  { id: "company-entity", name: "Entity Documents", icon: Building2, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId: "company-docs" },
  { id: "company-licenses", name: "Licenses & Permits", icon: ShieldCheck, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId: "company-docs" },
  { id: "company-bank", name: "Bank Statements", icon: Landmark, fileCount: 0, lastModified: new Date(), color: "blue", isFavorite: false, parentId: "company-docs" },
];

interface FolderCardProps {
  folder: DocumentFolder;
  hasChildren: boolean;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  onChangeColor: (id: string, color: FolderColor) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (id: string) => void;
  onOpen: (id: string) => void;
}

function FolderCard({
  folder,
  hasChildren,
  onDelete,
  onRename,
  onChangeColor,
  onDuplicate,
  onToggleFavorite,
  onDownload,
  onOpen,
}: FolderCardProps) {
  const colors = folderColors[folder.color];
  const Icon = folder.icon;

  return (
    <div className="relative group" onClick={() => onOpen(folder.id)}>
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
          "relative rounded-xl p-4 min-h-[140px] transition-all duration-200 hover:shadow-lg cursor-pointer shadow-sm border border-border/30",
          colors.card
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
            <Icon className={cn("h-5 w-5", colors.text)} />
            <h3 className="font-semibold text-foreground text-sm leading-tight">{folder.name}</h3>
            {folder.isFavorite && (
              <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                className="p-1.5 rounded-lg bg-background/50 hover:bg-background text-muted-foreground transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-50">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Palette className="h-4 w-4" />
                  Change Color
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-background border border-border shadow-lg">
                  {colorOptions.map((color) => (
                    <DropdownMenuItem
                      key={color}
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeColor(folder.id, color);
                      }}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full",
                          color === "blue" && "bg-blue-400",
                          color === "purple" && "bg-purple-400",
                          color === "green" && "bg-emerald-400",
                          color === "orange" && "bg-orange-400",
                          color === "rose" && "bg-rose-400"
                        )}
                      />
                      {folderColors[color].name}
                      {folder.color === color && (
                        <Check className="h-4 w-4 ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(folder.id);
                }}
              >
                <Edit className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(folder.id);
                }}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <FolderInput className="h-4 w-4" />
                Move To
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(folder.id);
                }}
              >
                <Star className={cn("h-4 w-4", folder.isFavorite && "fill-current")} />
                {folder.isFavorite ? "Remove From Favorites" : "Add To Favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(folder.id);
                }}
              >
                <Download className="h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* File Count & Sub-folder indicator */}
        <p className="text-sm mt-1 text-muted-foreground">
          {folder.fileCount} Files
          {hasChildren && (
            <span className="ml-2 text-xs">• Has Sub-Folders</span>
          )}
        </p>

        {/* Last Modified */}
        <div
          className={cn(
            "absolute bottom-3 left-4 right-4 px-3 py-1.5 rounded-lg text-xs",
            colors.accent
          )}
        >
          <span className="text-muted-foreground">Last Modified: </span>
          <span className="font-medium text-foreground">
            {format(folder.lastModified, "MMM dd")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [folders, setFolders] = React.useState<DocumentFolder[]>(initialFolders);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
  const [newFolderName, setNewFolderName] = React.useState("");

  // Get current folder
  const currentFolder = currentFolderId 
    ? folders.find((f) => f.id === currentFolderId) 
    : null;

  // Build breadcrumb path
  const getBreadcrumbPath = (): DocumentFolder[] => {
    const path: DocumentFolder[] = [];
    let folderId = currentFolderId;
    
    while (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        path.unshift(folder);
        folderId = folder.parentId;
      } else {
        break;
      }
    }
    
    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();

  // Get folders at current level
  const currentLevelFolders = folders.filter((folder) => 
    folder.parentId === currentFolderId
  );

  // Filter by search
  const filteredFolders = currentLevelFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if folder has children
  const hasChildren = (folderId: string) => 
    folders.some((f) => f.parentId === folderId);

  // Sort favorites first, then by last modified
  const sortedFolders = [...filteredFolders].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.lastModified.getTime() - a.lastModified.getTime();
  });

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    const folder: DocumentFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      icon: FolderOpen,
      fileCount: 0,
      lastModified: new Date(),
      color: "blue",
      isFavorite: false,
      parentId: currentFolderId,
    };

    setFolders([...folders, folder]);
    setNewFolderName("");
    setIsAddDialogOpen(false);
    toast.success("Folder created");
  };

  const handleDelete = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    // Delete folder and all its children recursively
    const idsToDelete = new Set<string>();
    const collectIds = (folderId: string) => {
      idsToDelete.add(folderId);
      folders.filter((f) => f.parentId === folderId).forEach((f) => collectIds(f.id));
    };
    collectIds(id);
    
    setFolders(folders.filter((f) => !idsToDelete.has(f.id)));
    toast.success(`"${folder?.name}" and its contents deleted`);
  };

  const handleRename = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      setSelectedFolderId(id);
      setNewFolderName(folder.name);
      setIsRenameDialogOpen(true);
    }
  };

  const handleRenameSubmit = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setFolders(
      folders.map((f) =>
        f.id === selectedFolderId
          ? { ...f, name: newFolderName, lastModified: new Date() }
          : f
      )
    );
    setIsRenameDialogOpen(false);
    setSelectedFolderId(null);
    setNewFolderName("");
    toast.success("Folder renamed");
  };

  const handleChangeColor = (id: string, color: FolderColor) => {
    setFolders(
      folders.map((f) =>
        f.id === id ? { ...f, color, lastModified: new Date() } : f
      )
    );
    toast.success(`Folder color changed to ${folderColors[color].name}`);
  };

  const handleDuplicate = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      const duplicatedFolder: DocumentFolder = {
        ...folder,
        id: Date.now().toString(),
        name: `${folder.name} (Copy)`,
        lastModified: new Date(),
        isFavorite: false,
      };
      setFolders([...folders, duplicatedFolder]);
      toast.success(`"${folder.name}" duplicated`);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    setFolders(
      folders.map((f) =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite, lastModified: new Date() } : f
      )
    );
    toast.success(
      folder?.isFavorite
        ? `"${folder.name}" removed from favorites`
        : `"${folder?.name}" added to favorites`
    );
  };

  const handleDownload = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    toast.success(`Downloading "${folder?.name}"...`);
    setTimeout(() => {
      toast.success(`"${folder?.name}" downloaded`);
    }, 1500);
  };

  const handleOpen = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    // Always navigate into folder, even if no children (for special folders like POF)
    if (id === "pof" || hasChildren(id)) {
      setCurrentFolderId(id);
      setSearchQuery("");
    } else {
      toast.info(`Opening "${folder?.name}"...`);
    }
  };

  const handleNavigateBack = () => {
    if (currentFolder?.parentId !== undefined) {
      setCurrentFolderId(currentFolder.parentId);
      setSearchQuery("");
    }
  };

  // Check if we're in the POF folder - render special POF manager
  const isInPOFFolder = currentFolderId === "pof";

  return (
    <AppLayout>
      <PageLayout>
        {/* POF Manager - Special view for Proof of Funds folder */}
        {isInPOFFolder ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNavigateBack}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentFolderId(null)}
                  className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  ASSETS
                </button>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">
                  Proof Of Funds
                </span>
              </div>
            </div>
            <POFManager onBack={handleNavigateBack} />
          </div>
        ) : (
          <>
            {/* Header with Breadcrumb */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {currentFolderId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNavigateBack}
                    className="h-9 w-9"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentFolderId(null)}
                    className={cn(
                      "text-2xl font-bold transition-colors",
                      currentFolderId 
                        ? "text-muted-foreground hover:text-foreground" 
                        : "text-foreground"
                    )}
                  >
                    ASSETS
                  </button>
                  
                  {breadcrumbPath.map((folder) => (
                    <React.Fragment key={folder.id}>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <button
                        onClick={() => setCurrentFolderId(folder.id)}
                        className={cn(
                          "text-lg font-semibold transition-colors",
                          folder.id === currentFolderId
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {folder.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

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
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Folder
                </Button>
              </div>
            </div>

        {/* Folders Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {sortedFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                hasChildren={hasChildren(folder.id)}
                onDelete={handleDelete}
                onRename={handleRename}
                onChangeColor={handleChangeColor}
                onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite}
                onDownload={handleDownload}
                onOpen={handleOpen}
              />
            ))}

            {sortedFolders.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">
                  {searchQuery ? "No Folders Found" : "This Folder Is Empty"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create a new folder to get started"}
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
            {sortedFolders.map((folder) => {
              const Icon = folder.icon;
              const colors = folderColors[folder.color];
              const hasSubs = hasChildren(folder.id);
              
              return (
                <div
                  key={folder.id}
                  onClick={() => handleOpen(folder.id)}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", colors.iconBg)}>
                      <Icon className={cn("h-5 w-5", colors.text)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{folder.name}</h3>
                        {folder.isFavorite && (
                          <Star className="h-4 w-4 text-warning fill-warning" />
                        )}
                        {hasSubs && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {folder.fileCount} Files
                        {hasSubs && " • Has Sub-Folders"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {format(folder.lastModified, "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Menu className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg z-50">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(folder.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-2">
                            <Palette className="h-4 w-4" />
                            Change Color
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="bg-background border border-border shadow-lg">
                            {colorOptions.map((color) => (
                              <DropdownMenuItem
                                key={color}
                                className="gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangeColor(folder.id, color);
                                }}
                              >
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded-full",
                                    color === "blue" && "bg-blue-400",
                                    color === "purple" && "bg-purple-400",
                                    color === "green" && "bg-emerald-400",
                                    color === "orange" && "bg-orange-400",
                                    color === "rose" && "bg-rose-400"
                                  )}
                                />
                                {folderColors[color].name}
                                {folder.color === color && (
                                  <Check className="h-4 w-4 ml-auto" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(folder.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(folder.id);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(folder.id);
                          }}
                        >
                          <Star className={cn("h-4 w-4", folder.isFavorite && "fill-current")} />
                          {folder.isFavorite ? "Remove From Favorites" : "Add To Favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(folder.id);
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(folder.id);
                          }}
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

            {sortedFolders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">
                  {searchQuery ? "No Folders Found" : "This Folder Is Empty"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Create a new folder to get started"}
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
        )}

        {/* Add Folder Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                {currentFolder 
                  ? `Add a new folder inside "${currentFolder.name}"`
                  : "Add a new folder to organize your documents."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Folder Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Contracts"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddFolder();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFolder}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Folder Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
              <DialogDescription>
                Enter a new name for this folder.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rename">Folder Name</Label>
                <Input
                  id="rename"
                  placeholder="e.g., Contracts"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenameSubmit}>Rename</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </>
        )}
      </PageLayout>
    </AppLayout>
  );
}
