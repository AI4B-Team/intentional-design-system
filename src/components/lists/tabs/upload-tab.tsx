import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  X,
  Download,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useListUpload, LIST_FIELD_OPTIONS, UploadStats } from "@/hooks/useListUpload";
import { toast } from "sonner";

interface UploadTabProps {
  onSuccess: () => void;
}

type Step = "upload" | "mapping" | "options" | "processing" | "complete";

export function UploadTab({ onSuccess }: UploadTabProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [listName, setListName] = useState("");
  const [options, setOptions] = useState({
    removeDuplicates: true,
    skipSuppressed: true,
    skipExisting: true,
  });
  const [uploadResult, setUploadResult] = useState<UploadStats | null>(null);

  const {
    uploadFile,
    parseCSVHeaders,
    previewCSV,
    countCSVRows,
    autoDetectMappings,
    uploading,
    processing,
    progress,
    isLoading,
  } = useListUpload();

  const handleFileDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        await processFile(droppedFile);
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        await processFile(selectedFile);
      }
    },
    []
  );

  const processFile = async (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    try {
      setFile(selectedFile);
      setListName(selectedFile.name.replace(/\.[^/.]+$/, ""));

      const csvHeaders = await parseCSVHeaders(selectedFile);
      setHeaders(csvHeaders);

      const previewData = await previewCSV(selectedFile, 5);
      setPreview(previewData);

      const count = await countCSVRows(selectedFile);
      setRowCount(count);

      // Auto-detect mappings
      const autoMappings = autoDetectMappings(csvHeaders);
      setColumnMapping(autoMappings);

      setStep("mapping");
    } catch (error) {
      toast.error("Failed to parse file");
      console.error(error);
    }
  };

  const handleMappingChange = (csvColumn: string, fieldValue: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvColumn]: fieldValue,
    }));
  };

  const handleImport = async () => {
    if (!file) return;

    // Validate required mapping
    const hasAddress = Object.values(columnMapping).includes("address");
    if (!hasAddress) {
      toast.error("Please map at least one column to Property Address");
      return;
    }

    setStep("processing");

    const result = await uploadFile(file, listName, columnMapping);

    if (result.success && result.stats) {
      setUploadResult(result.stats);
      setStep("complete");
    } else {
      setStep("options");
    }
  };

  const getMappedFieldLabel = (value: string) => {
    const field = LIST_FIELD_OPTIONS.find((f) => f.value === value);
    return field?.label || "Skip";
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Upload */}
      {step === "upload" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Drag & drop your file here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <div className="flex justify-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">CSV</Badge>
            <Badge variant="outline">XLSX</Badge>
            <Badge variant="outline">XLS</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Max file size: 50MB · Up to 100,000 records
          </p>
          <Button variant="link" className="mt-2" onClick={(e) => e.stopPropagation()}>
            <Download className="h-4 w-4 mr-2" />
            Download sample template
          </Button>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === "mapping" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Map Your Columns</h3>
              <p className="text-sm text-muted-foreground">
                Match your file's columns to our fields
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              {rowCount.toLocaleString()} rows
            </Badge>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {headers.map((header) => (
                  <div key={header} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{header}</p>
                      {preview[0]?.[header] && (
                        <p className="text-xs text-muted-foreground truncate">
                          e.g. "{preview[0][header]}"
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Select
                      value={columnMapping[header] || ""}
                      onValueChange={(value) => handleMappingChange(header, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Skip this column" />
                      </SelectTrigger>
                      <SelectContent>
                        {LIST_FIELD_OPTIONS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Table */}
          <div>
            <h4 className="text-sm font-medium mb-2">Preview (first 5 rows)</h4>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.slice(0, 6).map((header) => (
                      <TableHead key={header} className="min-w-[120px]">
                        <div>
                          <p className="text-xs truncate">{header}</p>
                          {columnMapping[header] && (
                            <Badge variant="secondary" className="text-[10px] mt-1">
                              → {getMappedFieldLabel(columnMapping[header])}
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, idx) => (
                    <TableRow key={idx}>
                      {headers.slice(0, 6).map((header) => (
                        <TableCell key={header} className="text-xs">
                          {row[header] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep("options")}>
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Name & Options */}
      {step === "options" && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="list-name">List Name</Label>
            <Input
              id="list-name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name"
              className="mt-1.5"
            />
          </div>

          <div className="space-y-3">
            <Label>Import Options</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remove-duplicates"
                  checked={options.removeDuplicates}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, removeDuplicates: !!checked }))
                  }
                />
                <label htmlFor="remove-duplicates" className="text-sm cursor-pointer">
                  Remove duplicates (within this list)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="skip-suppressed"
                  checked={options.skipSuppressed}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, skipSuppressed: !!checked }))
                  }
                />
                <label htmlFor="skip-suppressed" className="text-sm cursor-pointer">
                  Skip addresses in suppression list
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="skip-existing"
                  checked={options.skipExisting}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, skipExisting: !!checked }))
                  }
                />
                <label htmlFor="skip-existing" className="text-sm cursor-pointer">
                  Skip addresses already in my properties
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("mapping")}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={!listName.trim()}>
              Import List
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Processing */}
      {step === "processing" && (
        <div className="py-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
          <h3 className="font-medium mb-2">Processing your list...</h3>
          <p className="text-sm text-muted-foreground mb-6">
            This may take a moment for large files
          </p>
          <Progress value={progress} className="max-w-xs mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && uploadResult && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Import Complete!</h3>
          <p className="text-muted-foreground mb-6">
            Your list has been successfully imported
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Check className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{uploadResult.uniqueRecords}</p>
                <p className="text-xs text-muted-foreground">Imported</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{uploadResult.skippedDuplicates}</p>
                <p className="text-xs text-muted-foreground">Duplicates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{uploadResult.skippedSuppressed}</p>
                <p className="text-xs text-muted-foreground">Suppressed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <X className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold">{uploadResult.invalidRecords}</p>
                <p className="text-xs text-muted-foreground">Invalid</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={onSuccess}>View List</Button>
        </div>
      )}
    </div>
  );
}
