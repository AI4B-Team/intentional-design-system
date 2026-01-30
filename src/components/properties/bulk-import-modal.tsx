import * as React from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  FileSpreadsheet,
  ClipboardPaste,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";

// Property fields that can be mapped
const PROPERTY_FIELDS = [
  { key: "address", label: "Address", required: true },
  { key: "city", label: "City", required: false },
  { key: "state", label: "State", required: false },
  { key: "zip", label: "ZIP Code", required: false },
  { key: "beds", label: "Bedrooms", required: false },
  { key: "baths", label: "Bathrooms", required: false },
  { key: "sqft", label: "Square Feet", required: false },
  { key: "property_type", label: "Property Type", required: false },
  { key: "arv", label: "ARV", required: false },
  { key: "asking_price", label: "Asking Price", required: false },
  { key: "owner_name", label: "Owner Name", required: false },
  { key: "owner_phone", label: "Owner Phone", required: false },
  { key: "owner_email", label: "Owner Email", required: false },
  { key: "owner_mailing_address", label: "Owner Mailing Address", required: false },
  { key: "source", label: "Lead Source", required: false },
  { key: "notes", label: "Notes", required: false },
] as const;

type PropertyFieldKey = typeof PROPERTY_FIELDS[number]["key"];

// Common column name variations for auto-detection
const COLUMN_ALIASES: Record<PropertyFieldKey, string[]> = {
  address: ["address", "street", "street address", "property address", "property_address", "prop address", "street_address"],
  city: ["city", "town", "municipality"],
  state: ["state", "st", "province"],
  zip: ["zip", "zipcode", "zip code", "postal", "postal code", "zip_code"],
  beds: ["beds", "bedrooms", "bed", "br", "bedroom", "bedrooms_count"],
  baths: ["baths", "bathrooms", "bath", "ba", "bathroom", "bathrooms_count"],
  sqft: ["sqft", "square feet", "sq ft", "square_feet", "squarefeet", "living area", "living_area", "gla"],
  property_type: ["type", "property type", "property_type", "propertytype", "prop type", "home type"],
  arv: ["arv", "after repair value", "after_repair_value", "estimated value", "market value"],
  asking_price: ["price", "asking", "asking price", "asking_price", "list price", "list_price", "listprice"],
  owner_name: ["owner", "owner name", "owner_name", "ownername", "seller", "seller name", "contact name"],
  owner_phone: ["phone", "owner phone", "owner_phone", "seller phone", "contact phone", "mobile", "cell"],
  owner_email: ["email", "owner email", "owner_email", "seller email", "contact email", "e-mail"],
  owner_mailing_address: ["mailing", "mailing address", "mailing_address", "mail address", "owner address"],
  source: ["source", "lead source", "lead_source", "marketing source", "campaign"],
  notes: ["notes", "comments", "description", "memo", "remarks"],
};

type Step = "upload" | "mapping" | "preview" | "importing" | "complete";
type DuplicateAction = "skip" | "update" | "ask";

interface ImportRow {
  original: Record<string, string>;
  mapped: Partial<Record<PropertyFieldKey, string>>;
  isDuplicate: boolean;
  duplicateId?: string;
  error?: string;
  selected: boolean;
}

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkImportModal({ open, onOpenChange, onSuccess }: BulkImportModalProps) {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  
  const [step, setStep] = React.useState<Step>("upload");
  const [inputMethod, setInputMethod] = React.useState<"file" | "paste">("file");
  const [rawData, setRawData] = React.useState<Record<string, string>[]>([]);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [mapping, setMapping] = React.useState<Record<string, PropertyFieldKey | "ignore">>({});
  const [rows, setRows] = React.useState<ImportRow[]>([]);
  const [duplicateAction, setDuplicateAction] = React.useState<DuplicateAction>("ask");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = React.useState({ success: 0, skipped: 0, errors: 0 });
  const [pasteContent, setPasteContent] = React.useState("");
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setStep("upload");
      setRawData([]);
      setColumns([]);
      setMapping({});
      setRows([]);
      setPasteContent("");
      setImportProgress({ current: 0, total: 0 });
      setImportResult({ success: 0, skipped: 0, errors: 0 });
    }
  }, [open]);

  // Auto-detect column mapping
  const autoDetectMapping = (cols: string[]): Record<string, PropertyFieldKey | "ignore"> => {
    const detected: Record<string, PropertyFieldKey | "ignore"> = {};
    
    for (const col of cols) {
      const normalizedCol = col.toLowerCase().trim();
      let matched = false;
      
      for (const field of PROPERTY_FIELDS) {
        const aliases = COLUMN_ALIASES[field.key];
        if (aliases.some(alias => normalizedCol === alias || normalizedCol.includes(alias))) {
          detected[col] = field.key;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        detected[col] = "ignore";
      }
    }
    
    return detected;
  };

  // Parse CSV content
  const parseCSV = (content: string) => {
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });
    
    if (result.errors.length > 0) {
      toast.error("Error parsing CSV: " + result.errors[0].message);
      return;
    }
    
    const data = result.data as Record<string, string>[];
    if (data.length === 0) {
      toast.error("No data found in file");
      return;
    }
    
    const cols = Object.keys(data[0]);
    setRawData(data);
    setColumns(cols);
    setMapping(autoDetectMapping(cols));
    setStep("mapping");
  };

  // Parse Excel content
  const parseExcel = (buffer: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      if (data.length < 2) {
        toast.error("No data found in file");
        return;
      }
      
      const headers = data[0].map(h => String(h).trim());
      const rows = data.slice(1).map(row => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = String(row[i] || "").trim();
        });
        return obj;
      }).filter(row => Object.values(row).some(v => v !== ""));
      
      setRawData(rows);
      setColumns(headers);
      setMapping(autoDetectMapping(headers));
      setStep("mapping");
    } catch (error) {
      toast.error("Error parsing Excel file");
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const ext = file.name.split(".").pop()?.toLowerCase();
    
    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        parseCSV(e.target?.result as string);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        parseExcel(e.target?.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Please upload a CSV or Excel file");
    }
  };

  // Handle paste
  const handlePaste = () => {
    if (!pasteContent.trim()) {
      toast.error("Please paste some data first");
      return;
    }
    parseCSV(pasteContent);
  };

  // Apply mapping and check for duplicates
  const processRows = async () => {
    setIsProcessing(true);
    
    try {
      // Get existing addresses for duplicate checking
      const { data: existingProps } = await supabase
        .from("properties")
        .select("id, address, city, state, zip")
        .eq("organization_id", organizationId);
      
      const existingAddresses = new Map(
        (existingProps || []).map(p => [
          `${p.address?.toLowerCase().trim()}|${p.city?.toLowerCase().trim()}|${p.state?.toLowerCase().trim()}`,
          p.id
        ])
      );
      
      const processedRows: ImportRow[] = rawData.map(row => {
        const mapped: Partial<Record<PropertyFieldKey, string>> = {};
        
        for (const [col, field] of Object.entries(mapping)) {
          if (field !== "ignore" && row[col]) {
            mapped[field] = row[col];
          }
        }
        
        // Check for duplicate
        const addressKey = `${mapped.address?.toLowerCase().trim()}|${mapped.city?.toLowerCase().trim()}|${mapped.state?.toLowerCase().trim()}`;
        const duplicateId = existingAddresses.get(addressKey);
        
        // Validate required fields
        let error: string | undefined;
        if (!mapped.address) {
          error = "Missing address";
        }
        
        return {
          original: row,
          mapped,
          isDuplicate: !!duplicateId,
          duplicateId,
          error,
          selected: !error,
        };
      });
      
      setRows(processedRows);
      setStep("preview");
    } catch (error) {
      toast.error("Error processing data");
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute import
  const executeImport = async () => {
    setStep("importing");
    
    const selectedRows = rows.filter(r => r.selected && !r.error);
    setImportProgress({ current: 0, total: selectedRows.length });
    
    let success = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < selectedRows.length; i++) {
      const row = selectedRows[i];
      
      try {
        // Handle duplicates
        if (row.isDuplicate) {
          if (duplicateAction === "skip") {
            skipped++;
            setImportProgress({ current: i + 1, total: selectedRows.length });
            continue;
          } else if (duplicateAction === "update" && row.duplicateId) {
            // Update existing property
            const { error } = await supabase
              .from("properties")
              .update({
                ...formatPropertyData(row.mapped),
                updated_at: new Date().toISOString(),
              })
              .eq("id", row.duplicateId);
            
            if (error) throw error;
            success++;
            setImportProgress({ current: i + 1, total: selectedRows.length });
            continue;
          }
        }
        
        // Insert new property
        const { error } = await supabase
          .from("properties")
          .insert({
            ...formatPropertyData(row.mapped),
            user_id: user?.id,
            organization_id: organizationId,
            status: "new",
          });
        
        if (error) throw error;
        success++;
      } catch (error) {
        console.error("Import error:", error);
        errors++;
      }
      
      setImportProgress({ current: i + 1, total: selectedRows.length });
    }
    
    setImportResult({ success, skipped, errors });
    setStep("complete");
  };

  // Format property data for insert/update
  const formatPropertyData = (mapped: Partial<Record<PropertyFieldKey, string>>) => {
    return {
      address: mapped.address || "",
      city: mapped.city || null,
      state: mapped.state || null,
      zip: mapped.zip || null,
      beds: mapped.beds ? parseInt(mapped.beds, 10) || null : null,
      baths: mapped.baths ? parseFloat(mapped.baths) || null : null,
      sqft: mapped.sqft ? parseInt(mapped.sqft.replace(/,/g, ""), 10) || null : null,
      property_type: mapped.property_type || null,
      arv: mapped.arv ? parseFloat(mapped.arv.replace(/[$,]/g, "")) || null : null,
      asking_price: mapped.asking_price ? parseFloat(mapped.asking_price.replace(/[$,]/g, "")) || null : null,
      owner_name: mapped.owner_name || null,
      owner_phone: mapped.owner_phone || null,
      owner_email: mapped.owner_email || null,
      owner_mailing_address: mapped.owner_mailing_address || null,
      source: mapped.source || "import",
      notes: mapped.notes || null,
    };
  };

  // Count mapped required fields
  const mappedRequiredCount = Object.values(mapping).filter(v => 
    PROPERTY_FIELDS.find(f => f.key === v && f.required)
  ).length;
  
  const requiredFieldsMapped = PROPERTY_FIELDS.filter(f => f.required).every(f =>
    Object.values(mapping).includes(f.key)
  );

  // Toggle row selection
  const toggleRowSelection = (index: number) => {
    setRows(prev => prev.map((r, i) => 
      i === index ? { ...r, selected: !r.selected } : r
    ));
  };

  // Toggle all rows
  const toggleAllRows = (selected: boolean) => {
    setRows(prev => prev.map(r => ({ ...r, selected: r.error ? false : selected })));
  };

  // Stats
  const duplicateCount = rows.filter(r => r.isDuplicate).length;
  const errorCount = rows.filter(r => r.error).length;
  const validCount = rows.filter(r => !r.error).length;
  const selectedCount = rows.filter(r => r.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Properties</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a file or paste data to import properties in bulk"}
            {step === "mapping" && "Map your columns to property fields"}
            {step === "preview" && "Review and confirm your import"}
            {step === "importing" && "Importing properties..."}
            {step === "complete" && "Import complete!"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 px-1 mb-4">
          {["upload", "mapping", "preview", "complete"].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-small font-medium",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                    ? "bg-success text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    "flex-1 h-0.5",
                    ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                      ? "bg-success"
                      : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as "file" | "paste")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="file" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="paste" className="gap-2">
                  <ClipboardPaste className="h-4 w-4" />
                  Paste Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="mt-0">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload CSV or Excel File</h3>
                  <p className="text-muted-foreground text-small mb-4">
                    Drag and drop or click to browse
                  </p>
                  <div className="flex items-center justify-center gap-2 text-tiny text-muted-foreground">
                    <Badge variant="secondary" size="sm">.csv</Badge>
                    <Badge variant="secondary" size="sm">.xlsx</Badge>
                    <Badge variant="secondary" size="sm">.xls</Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paste" className="mt-0 space-y-4">
                <Textarea
                  placeholder="Paste your data here (tab or comma separated with headers)..."
                  className="min-h-[200px] font-mono text-small"
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                />
                <p className="text-tiny text-muted-foreground">
                  Tip: Copy directly from Excel or Google Sheets. First row should contain column headers.
                </p>
                <Button onClick={handlePaste} disabled={!pasteContent.trim()}>
                  Process Data
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </TabsContent>
            </Tabs>
          )}

          {/* Step 2: Mapping */}
          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-small text-muted-foreground">
                  Found {columns.length} columns and {rawData.length} rows
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMapping(autoDetectMapping(columns))}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Re-detect
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Your Column</TableHead>
                      <TableHead className="w-1/3">Maps To</TableHead>
                      <TableHead className="w-1/3">Sample Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columns.map((col) => (
                      <TableRow key={col}>
                        <TableCell className="font-medium">{col}</TableCell>
                        <TableCell>
                          <Select
                            value={mapping[col] || "ignore"}
                            onValueChange={(v) => setMapping(prev => ({ ...prev, [col]: v as PropertyFieldKey | "ignore" }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="ignore" className="text-muted-foreground">
                                — Ignore this column —
                              </SelectItem>
                              {PROPERTY_FIELDS.map((field) => (
                                <SelectItem
                                  key={field.key}
                                  value={field.key}
                                  disabled={Object.values(mapping).includes(field.key) && mapping[col] !== field.key}
                                >
                                  {field.label}
                                  {field.required && <span className="text-destructive ml-1">*</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-small truncate max-w-[200px]">
                          {rawData[0]?.[col] || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {!requiredFieldsMapped && (
                <div className="flex items-center gap-2 text-warning text-small">
                  <AlertCircle className="h-4 w-4" />
                  <span>Address field is required</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-h2 font-bold">{rows.length}</div>
                  <div className="text-tiny text-muted-foreground">Total Rows</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-h2 font-bold text-success">{validCount}</div>
                  <div className="text-tiny text-muted-foreground">Valid</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-h2 font-bold text-warning">{duplicateCount}</div>
                  <div className="text-tiny text-muted-foreground">Duplicates</div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-h2 font-bold text-destructive">{errorCount}</div>
                  <div className="text-tiny text-muted-foreground">Errors</div>
                </div>
              </div>

              {/* Duplicate handling */}
              {duplicateCount > 0 && (
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <span className="text-small font-medium">Handle duplicates:</span>
                  <Select value={duplicateAction} onValueChange={(v) => setDuplicateAction(v as DuplicateAction)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="update">Update existing</SelectItem>
                      <SelectItem value="ask">Import anyway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Data preview */}
              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedCount === validCount && validCount > 0}
                          onCheckedChange={(checked) => toggleAllRows(!!checked)}
                        />
                      </TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 100).map((row, i) => (
                      <TableRow
                        key={i}
                        className={cn(
                          row.error && "bg-destructive/5",
                          row.isDuplicate && !row.error && "bg-warning/5"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={row.selected}
                            onCheckedChange={() => toggleRowSelection(i)}
                            disabled={!!row.error}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.mapped.address || "—"}
                        </TableCell>
                        <TableCell>{row.mapped.city || "—"}</TableCell>
                        <TableCell>{row.mapped.state || "—"}</TableCell>
                        <TableCell>
                          {row.error ? (
                            <Badge variant="error" size="sm">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {row.error}
                            </Badge>
                          ) : row.isDuplicate ? (
                            <Badge variant="warning" size="sm">Duplicate</Badge>
                          ) : (
                            <Badge variant="success" size="sm">Ready</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {rows.length > 100 && (
                <p className="text-tiny text-muted-foreground text-center">
                  Showing first 100 of {rows.length} rows
                </p>
              )}
            </div>
          )}

          {/* Step 4: Importing */}
          {step === "importing" && (
            <div className="py-12 text-center space-y-6">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-medium mb-2">Importing Properties</h3>
                <p className="text-muted-foreground">
                  {importProgress.current} of {importProgress.total} complete
                </p>
              </div>
              <Progress value={(importProgress.current / importProgress.total) * 100} className="w-64 mx-auto" />
            </div>
          )}

          {/* Step 5: Complete */}
          {step === "complete" && (
            <div className="py-12 text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
                <div className="flex items-center justify-center gap-6 text-small">
                  <span className="text-success">
                    <Check className="h-4 w-4 inline mr-1" />
                    {importResult.success} imported
                  </span>
                  {importResult.skipped > 0 && (
                    <span className="text-muted-foreground">
                      {importResult.skipped} skipped
                    </span>
                  )}
                  {importResult.errors > 0 && (
                    <span className="text-destructive">
                      <X className="h-4 w-4 inline mr-1" />
                      {importResult.errors} failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          {step === "mapping" && (
            <>
              <Button variant="ghost" onClick={() => setStep("upload")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={processRows}
                disabled={!requiredFieldsMapped || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </>
          )}
          
          {step === "preview" && (
            <>
              <Button variant="ghost" onClick={() => setStep("mapping")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={executeImport}
                disabled={selectedCount === 0}
              >
                Import {selectedCount} Properties
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
          
          {step === "complete" && (
            <Button
              onClick={() => {
                onSuccess();
                onOpenChange(false);
              }}
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
