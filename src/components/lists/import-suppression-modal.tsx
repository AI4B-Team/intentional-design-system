import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ImportSuppressionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "mapping" | "importing" | "complete";

export function ImportSuppressionModal({ open, onOpenChange }: ImportSuppressionModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

  // Column mappings
  const [addressCol, setAddressCol] = useState("");
  const [cityCol, setCityCol] = useState("");
  const [stateCol, setStateCol] = useState("");
  const [zipCol, setZipCol] = useState("");
  const [reasonCol, setReasonCol] = useState("default");
  const [defaultReason, setDefaultReason] = useState("do_not_contact");

  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  const resetModal = () => {
    setStep("upload");
    setFile(null);
    setHeaders([]);
    setRows([]);
    setAddressCol("");
    setCityCol("");
    setStateCol("");
    setZipCol("");
    setReasonCol("default");
    setDefaultReason("do_not_contact");
    setProgress(0);
    setImportedCount(0);
    setSkippedCount(0);
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        toast.error("File must have at least a header row and one data row");
        return;
      }

      const headerRow = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const dataRows = lines.slice(1).map((line) =>
        line.split(",").map((cell) => cell.trim().replace(/"/g, ""))
      );

      setHeaders(headerRow);
      setRows(dataRows);
      setFile(selectedFile);

      // Auto-detect columns
      headerRow.forEach((h, i) => {
        const lower = h.toLowerCase();
        if (lower.includes("address") && !lower.includes("mail")) setAddressCol(String(i));
        if (lower === "city") setCityCol(String(i));
        if (lower === "state") setStateCol(String(i));
        if (lower === "zip") setZipCol(String(i));
        if (lower.includes("reason")) setReasonCol(String(i));
      });

      setStep("mapping");
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".txt"))) {
        handleFileSelect(droppedFile);
      } else {
        toast.error("Please upload a CSV file");
      }
    },
    [handleFileSelect]
  );

  const handleImport = async () => {
    if (!addressCol || !cityCol || !stateCol) {
      toast.error("Please map Address, City, and State columns");
      return;
    }

    setStep("importing");
    setProgress(0);

    const addressIdx = parseInt(addressCol);
    const cityIdx = parseInt(cityCol);
    const stateIdx = parseInt(stateCol);
    const zipIdx = zipCol ? parseInt(zipCol) : -1;
    const reasonIdx = reasonCol !== "default" ? parseInt(reasonCol) : -1;

    let imported = 0;
    let skipped = 0;
    const batchSize = 50;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const records = batch
        .map((row) => {
          const address = row[addressIdx]?.trim();
          const city = row[cityIdx]?.trim();
          const state = row[stateIdx]?.trim();
          const zip = zipIdx >= 0 ? row[zipIdx]?.trim() : null;
          const reason = reasonIdx >= 0 ? row[reasonIdx]?.trim().toLowerCase().replace(/\s+/g, "_") : defaultReason;

          if (!address || !city || !state) return null;

          const normalizedAddress = `${address.toLowerCase()}-${city.toLowerCase()}-${state.toLowerCase()}`;
          const addressHash = btoa(normalizedAddress).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

          return {
            user_id: user?.id,
            address,
            city,
            state,
            zip,
            reason: ["do_not_contact", "deceased", "wrong_number", "hostile", "already_sold", "not_interested", "returned_mail", "duplicate", "other"].includes(reason) ? reason : defaultReason,
            source: "import",
            address_hash: addressHash,
            normalized_address: normalizedAddress,
          };
        })
        .filter(Boolean);

      if (records.length > 0) {
        const { error, data } = await supabase
          .from("suppression_list")
          .upsert(records as any[], { onConflict: "user_id,address_hash", ignoreDuplicates: true })
          .select();

        imported += data?.length || 0;
        skipped += records.length - (data?.length || 0);
      }

      setProgress(Math.round(((i + batchSize) / rows.length) * 100));
    }

    setImportedCount(imported);
    setSkippedCount(skipped);
    setStep("complete");
    queryClient.invalidateQueries({ queryKey: ["suppression-list"] });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetModal();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Suppression List</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="py-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-1">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="suppression-file"
              />
              <Button variant="outline" asChild>
                <label htmlFor="suppression-file" className="cursor-pointer">
                  Select File
                </label>
              </Button>
            </div>
          </div>
        )}

        {step === "mapping" && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{file?.name}</p>
                <p className="text-xs text-muted-foreground">{rows.length} rows found</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Address Column *</Label>
                <Select value={addressCol} onValueChange={setAddressCol}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City Column *</Label>
                  <Select value={cityCol} onValueChange={setCityCol}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>State Column *</Label>
                  <Select value={stateCol} onValueChange={setStateCol}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Zip Column</Label>
                <Select value={zipCol} onValueChange={setZipCol}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Skip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Skip</SelectItem>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Reason Column</Label>
                <Select value={reasonCol} onValueChange={setReasonCol}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Use default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Use default reason</SelectItem>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reasonCol === "default" && (
                <div>
                  <Label>Default Reason</Label>
                  <Select value={defaultReason} onValueChange={setDefaultReason}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                      <SelectItem value="wrong_number">Wrong Number</SelectItem>
                      <SelectItem value="hostile">Hostile</SelectItem>
                      <SelectItem value="already_sold">Already Sold</SelectItem>
                      <SelectItem value="not_interested">Not Interested</SelectItem>
                      <SelectItem value="returned_mail">Returned Mail</SelectItem>
                      <SelectItem value="duplicate">Duplicate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Import {rows.length} Addresses
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "importing" && (
          <div className="py-8 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="font-medium mb-2">Importing addresses...</p>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {step === "complete" && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
            <h3 className="font-medium text-lg mb-2">Import Complete!</h3>
            <div className="flex justify-center gap-6 mb-4">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{importedCount}</p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">{skippedCount}</p>
                <p className="text-sm text-muted-foreground">Duplicates Skipped</p>
              </div>
            </div>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
