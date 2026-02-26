import React, { useState, useEffect, useRef } from "react";
import { Search, Home, List, Upload, X, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AttachedItem {
  type: "property" | "list" | "file";
  label: string;
  data: Record<string, unknown>;
}

interface AttachContextPopoverProps {
  children: React.ReactNode;
  onAttach: (item: AttachedItem) => void;
}

export function AttachContextPopover({ children, onAttach }: AttachContextPopoverProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("properties");
  const [propertySearch, setPropertySearch] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch properties
  useEffect(() => {
    if (!open || tab !== "properties") return;
    const timeout = setTimeout(async () => {
      setLoadingProps(true);
      let query = supabase
        .from("properties")
        .select("id, address, city, state, arv, asking_price, status")
        .limit(20)
        .order("created_at", { ascending: false });

      if (propertySearch.trim()) {
        query = query.ilike("address", `%${propertySearch.trim()}%`);
      }

      const { data } = await query;
      setProperties(data || []);
      setLoadingProps(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [open, tab, propertySearch]);

  // Fetch lists
  useEffect(() => {
    if (!open || tab !== "lists") return;
    (async () => {
      setLoadingLists(true);
      const { data } = await supabase
        .from("lists")
        .select("id, name, total_records, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setLists(data || []);
      setLoadingLists(false);
    })();
  }, [open, tab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [".pdf", ".csv", ".txt", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error("Unsupported file type. Please use PDF, CSV, TXT, or DOCX.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onAttach({
        type: "file",
        label: file.name,
        data: { fileName: file.name, fileSize: file.size, content: reader.result as string },
      });
      setOpen(false);
      toast.success(`Attached: ${file.name}`);
    };
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectProperty = (p: any) => {
    onAttach({
      type: "property",
      label: `${p.address}, ${p.city || ""} ${p.state || ""}`.trim(),
      data: { id: p.id, address: p.address, city: p.city, state: p.state, arv: p.arv, asking_price: p.asking_price, status: p.status },
    });
    setOpen(false);
  };

  const selectList = (l: any) => {
    onAttach({
      type: "list",
      label: `${l.name} (${l.total_records || 0})`,
      data: { id: l.id, name: l.name, total_records: l.total_records, created_at: l.created_at },
    });
    setOpen(false);
  };

  const fmt = (n: number | null) => (n != null ? `$${n.toLocaleString()}` : "—");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0" sideOffset={8}>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-muted/30">
            <TabsTrigger value="properties" className="text-xs gap-1.5">
              <Home className="h-3 w-3" /> Properties
            </TabsTrigger>
            <TabsTrigger value="lists" className="text-xs gap-1.5">
              <List className="h-3 w-3" /> Lists
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs gap-1.5">
              <Upload className="h-3 w-3" /> Upload
            </TabsTrigger>
          </TabsList>

          {/* Properties */}
          <TabsContent value="properties" className="m-0">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by address..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/30 border-0"
                />
              </div>
            </div>
            <ScrollArea className="h-56">
              <div className="px-2 pb-2 space-y-1">
                {loadingProps ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
                ) : properties.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No properties found</p>
                ) : (
                  properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectProperty(p)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="text-xs font-medium truncate">{p.address}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{p.city}, {p.state}</span>
                        <span className="text-[10px] text-muted-foreground">ARV: {fmt(p.arv)}</span>
                        <span className="text-[10px] text-muted-foreground">Ask: {fmt(p.asking_price)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Lists */}
          <TabsContent value="lists" className="m-0">
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {loadingLists ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
                ) : lists.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No lists found</p>
                ) : (
                  lists.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => selectList(l)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="text-xs font-medium truncate">{l.name}</p>
                      <span className="text-[10px] text-muted-foreground">{l.total_records || 0} records</span>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Upload File */}
          <TabsContent value="upload" className="m-0">
            <div className="p-6 flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">Upload a file</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">PDF, CSV, TXT, DOCX — max 5MB</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv,.txt,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

/* Attachment chips row */
export function AttachmentChips({
  items,
  onRemove,
}: {
  items: AttachedItem[];
  onRemove: (index: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-1 pb-1">
      {items.map((item, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1 border",
            item.type === "property" && "bg-blue-50 border-blue-200 text-blue-700",
            item.type === "list" && "bg-purple-50 border-purple-200 text-purple-700",
            item.type === "file" && "bg-amber-50 border-amber-200 text-amber-700",
          )}
        >
          <Paperclip className="h-3 w-3" />
          <span className="max-w-[140px] truncate">{item.label}</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="ml-0.5 hover:opacity-70"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
