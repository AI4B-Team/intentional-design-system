import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExportListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listName: string;
  totalRecords: number;
  filteredRecords: number;
  selectedRecords: number;
}

const exportFields = [
  { id: "address", label: "Address, City, State, Zip", required: true },
  { id: "owner_name", label: "Owner Name" },
  { id: "mailing_address", label: "Mailing Address" },
  { id: "phone", label: "Phone" },
  { id: "email", label: "Email" },
  { id: "property_type", label: "Property Type" },
  { id: "beds_baths_sqft", label: "Beds, Baths, SqFt" },
  { id: "estimated_value", label: "Estimated Value" },
  { id: "motivation_score", label: "Motivation Score" },
  { id: "distress_indicators", label: "Distress Indicators" },
];

export function ExportListModal({
  open,
  onOpenChange,
  listId,
  listName,
  totalRecords,
  filteredRecords,
  selectedRecords,
}: ExportListModalProps) {
  const [recordScope, setRecordScope] = useState("all");
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "address",
    "owner_name",
    "mailing_address",
    "property_type",
    "estimated_value",
    "motivation_score",
  ]);
  const [format, setFormat] = useState("csv");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const toggleField = (fieldId: string) => {
    if (fieldId === "address") return; // Required field
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Fetch records
      const { data: records, error } = await supabase
        .from("list_records")
        .select("*")
        .eq("list_id", listId)
        .neq("status", "removed");

      if (error) throw error;

      if (!records || records.length === 0) {
        toast.error("No records to export");
        return;
      }

      // Build CSV content
      const headers: string[] = [];
      if (selectedFields.includes("address")) {
        headers.push("Address", "City", "State", "Zip");
      }
      if (selectedFields.includes("owner_name")) {
        headers.push("Owner Name");
      }
      if (selectedFields.includes("mailing_address")) {
        headers.push("Mailing Address", "Mailing City", "Mailing State", "Mailing Zip");
      }
      if (selectedFields.includes("phone")) {
        headers.push("Phone");
      }
      if (selectedFields.includes("email")) {
        headers.push("Email");
      }
      if (selectedFields.includes("property_type")) {
        headers.push("Property Type");
      }
      if (selectedFields.includes("beds_baths_sqft")) {
        headers.push("Beds", "Baths", "SqFt");
      }
      if (selectedFields.includes("estimated_value")) {
        headers.push("Estimated Value");
      }
      if (selectedFields.includes("motivation_score")) {
        headers.push("Motivation Score");
      }
      if (selectedFields.includes("distress_indicators")) {
        headers.push("Distress Indicators");
      }

      const rows = records.map((record) => {
        const row: string[] = [];
        if (selectedFields.includes("address")) {
          row.push(
            `"${record.address || ""}"`,
            `"${record.city || ""}"`,
            `"${record.state || ""}"`,
            `"${record.zip || ""}"`
          );
        }
        if (selectedFields.includes("owner_name")) {
          row.push(`"${record.owner_name || ""}"`);
        }
        if (selectedFields.includes("mailing_address")) {
          row.push(
            `"${record.mailing_address || ""}"`,
            `"${record.mailing_city || ""}"`,
            `"${record.mailing_state || ""}"`,
            `"${record.mailing_zip || ""}"`
          );
        }
        if (selectedFields.includes("phone")) {
          row.push(`"${record.phone || ""}"`);
        }
        if (selectedFields.includes("email")) {
          row.push(`"${record.email || ""}"`);
        }
        if (selectedFields.includes("property_type")) {
          row.push(`"${record.property_type || ""}"`);
        }
        if (selectedFields.includes("beds_baths_sqft")) {
          row.push(
            String(record.beds || ""),
            String(record.baths || ""),
            String(record.sqft || "")
          );
        }
        if (selectedFields.includes("estimated_value")) {
          row.push(String(record.estimated_value || ""));
        }
        if (selectedFields.includes("motivation_score")) {
          row.push(String(record.motivation_score || ""));
        }
        if (selectedFields.includes("distress_indicators")) {
          row.push(`"${(record.distress_indicators || []).join(", ")}"`);
        }
        return row.join(",");
      });

      let csvContent = "";
      if (includeHeader) {
        csvContent = headers.join(",") + "\n";
      }
      csvContent += rows.join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${listName.replace(/\s+/g, "_")}_export.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${records.length} records`);
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export list");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export List</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Which records */}
          <div className="space-y-3">
            <Label>Which records?</Label>
            <RadioGroup value={recordScope} onValueChange={setRecordScope}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <label htmlFor="all" className="text-sm cursor-pointer">
                  All records ({totalRecords.toLocaleString()})
                </label>
              </div>
              {filteredRecords !== totalRecords && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filtered" id="filtered" />
                  <label htmlFor="filtered" className="text-sm cursor-pointer">
                    Filtered records ({filteredRecords.toLocaleString()})
                  </label>
                </div>
              )}
              {selectedRecords > 0 && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <label htmlFor="selected" className="text-sm cursor-pointer">
                    Selected records ({selectedRecords.toLocaleString()})
                  </label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Which fields */}
          <div className="space-y-3">
            <Label>Which fields?</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {exportFields.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                    disabled={field.required}
                  />
                  <label
                    htmlFor={field.id}
                    className={`text-sm cursor-pointer ${field.required ? "text-muted-foreground" : ""}`}
                  >
                    {field.label}
                    {field.required && " (required)"}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <label htmlFor="csv" className="text-sm cursor-pointer">
                  CSV (Excel compatible)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" disabled />
                <label htmlFor="xlsx" className="text-sm cursor-pointer text-muted-foreground">
                  Excel (.xlsx) - Coming soon
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="header"
              checked={includeHeader}
              onCheckedChange={(c) => setIncludeHeader(!!c)}
            />
            <label htmlFor="header" className="text-sm cursor-pointer">
              Include header row
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
