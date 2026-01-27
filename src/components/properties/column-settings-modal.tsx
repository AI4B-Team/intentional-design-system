import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical } from "lucide-react";

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  locked?: boolean;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "checkbox", label: "Select", visible: true, locked: true },
  { id: "colorLabel", label: "Color Label", visible: true },
  { id: "address", label: "Address", visible: true, locked: true },
  { id: "city", label: "City", visible: true },
  { id: "state", label: "State", visible: true },
  { id: "zip", label: "Zip", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "dateAdded", label: "Date Added", visible: true },
  { id: "propertyType", label: "Property Type", visible: false },
  { id: "motivation", label: "Motivation Score", visible: false },
  { id: "arv", label: "ARV", visible: false },
  { id: "mao", label: "MAO", visible: false },
  { id: "spread", label: "Spread", visible: false },
  { id: "beds", label: "Beds", visible: false },
  { id: "baths", label: "Baths", visible: false },
  { id: "sqft", label: "Sq Ft", visible: false },
  { id: "source", label: "Source", visible: false },
  { id: "ownerName", label: "Seller Name", visible: false },
  { id: "ownerEmail", label: "Seller Email", visible: false },
  { id: "ownerPhone", label: "Seller Phone", visible: false },
  { id: "county", label: "County", visible: false },
  { id: "dealType", label: "Deal Type", visible: false },
  { id: "appointment", label: "Next Appointment", visible: false },
  { id: "lastContact", label: "Last Contact", visible: false },
  { id: "daysInPipeline", label: "Days in Pipeline", visible: false },
  { id: "actions", label: "Actions", visible: true, locked: true },
];

interface ColumnSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export function ColumnSettingsModal({
  open,
  onOpenChange,
  columns,
  onColumnsChange,
}: ColumnSettingsModalProps) {
  const [localColumns, setLocalColumns] = React.useState<ColumnConfig[]>(columns);

  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns, open]);

  const toggleColumn = (id: string) => {
    setLocalColumns((prev) =>
      prev.map((col) =>
        col.id === id && !col.locked ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSave = () => {
    onColumnsChange(localColumns);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalColumns(DEFAULT_COLUMNS);
  };

  const visibleCount = localColumns.filter((c) => c.visible).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
          <DialogDescription>
            Select which columns to display in the table view. {visibleCount} columns selected.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {localColumns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <Checkbox
                  id={column.id}
                  checked={column.visible}
                  disabled={column.locked}
                  onCheckedChange={() => toggleColumn(column.id)}
                />
                <Label
                  htmlFor={column.id}
                  className={`flex-1 cursor-pointer ${column.locked ? "text-muted-foreground" : ""}`}
                >
                  {column.label}
                  {column.locked && (
                    <span className="text-xs text-muted-foreground ml-2">(Required)</span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
