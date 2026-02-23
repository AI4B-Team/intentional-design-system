import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  PenTool,
  Type,
  Calendar,
  AlignLeft,
  CheckSquare,
  Paperclip,
  Upload,
  FileText,
  X,
  Trash2,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  FieldType,
  DocumentField,
  fieldTypeConfig,
} from "@/types/document-fields";
import { FieldToolbar } from "./FieldToolbar";

const iconMap: Record<string, React.ElementType> = {
  PenTool,
  Type,
  Calendar,
  AlignLeft,
  CheckSquare,
  Paperclip,
};

interface DocumentFieldBuilderProps {
  fields: DocumentField[];
  onFieldsChange: (fields: DocumentField[]) => void;
  documentName?: string;
}

export function DocumentFieldBuilder({
  fields,
  onFieldsChange,
  documentName,
}: DocumentFieldBuilderProps) {
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [selectedFieldId, setSelectedFieldId] = React.useState<string | null>(null);
  const [draggingFieldId, setDraggingFieldId] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  // ─── Add Field ─────────────────────────────────────────────
  const handleAddField = (type: FieldType) => {
    const config = fieldTypeConfig[type];
    const newField: DocumentField = {
      id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      label: config.label,
      x: 10 + (fields.length * 3) % 60,
      y: 10 + (fields.length * 6) % 70,
      width: config.defaultWidth,
      height: config.defaultHeight,
      page: 1,
      required: type === "signature",
      assignedTo: "recipient",
    };
    onFieldsChange([...fields, newField]);
    setSelectedFieldId(newField.id);
    toast.success(`${config.label} field added`);
  };

  const handleRemoveField = (id: string) => {
    onFieldsChange(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleToggleRequired = (id: string) => {
    onFieldsChange(
      fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const handleToggleAssignee = (id: string) => {
    onFieldsChange(
      fields.map((f) =>
        f.id === id
          ? { ...f, assignedTo: f.assignedTo === "recipient" ? "sender" : "recipient" }
          : f
      )
    );
  };

  // ─── Drag on Canvas ───────────────────────────────────────
  const handleCanvasMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFieldId(fieldId);
    setSelectedFieldId(fieldId);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startFieldX = field.x;
    const startFieldY = field.y;

    const onMove = (ev: MouseEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      const newX = Math.max(0, Math.min(100 - field.width, startFieldX + dx));
      const newY = Math.max(0, Math.min(100 - field.height, startFieldY + dy));
      onFieldsChange(
        fields.map((f) => (f.id === fieldId ? { ...f, x: newX, y: newY } : f))
      );
    };

    const onUp = () => {
      setDraggingFieldId(null);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── File Upload ──────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB");
      return;
    }
    setUploadedFile(file);
    toast.success(`Uploaded: ${file.name}`);
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Toolbar */}
      <FieldToolbar
        onAddField={handleAddField}
        fields={fields}
        selectedFieldId={selectedFieldId}
        onSelectField={setSelectedFieldId}
        onRemoveField={handleRemoveField}
      />

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Upload Zone / Document Preview */}
        {!uploadedFile ? (
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border-subtle rounded-lg p-10 cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors min-h-[360px]">
            <Upload className="h-10 w-10 text-muted-foreground/60" />
            <div className="text-center">
              <p className="font-medium text-foreground">Upload a PDF</p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse · Max 20MB
              </p>
            </div>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        ) : (
          <div className="flex flex-col gap-2">
            {/* File Info Bar */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary border border-border-subtle">
              <FileText className="h-4 w-4 text-brand flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate flex-1">
                {uploadedFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024).toFixed(0)} KB
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setUploadedFile(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Document Canvas */}
            <div
              ref={canvasRef}
              className="relative bg-white border border-border-subtle rounded-lg shadow-sm"
              style={{ aspectRatio: "8.5 / 11", minHeight: 360 }}
              onClick={() => setSelectedFieldId(null)}
            >
              {/* Simulated PDF page lines */}
              <div className="absolute inset-0 p-8 pointer-events-none opacity-20">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-px bg-muted-foreground/40 mb-4"
                    style={{ width: `${60 + Math.random() * 35}%` }}
                  />
                ))}
              </div>

              {/* Document title */}
              {documentName && (
                <div className="absolute top-6 left-8 right-8 pointer-events-none">
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3 mb-3" />
                  <div className="h-2 bg-muted-foreground/10 rounded w-1/2" />
                </div>
              )}

              {/* Placed Fields */}
              {fields.map((field) => {
                const config = fieldTypeConfig[field.type];
                const Icon = iconMap[config.icon] || PenTool;
                const isSelected = selectedFieldId === field.id;
                const isDragging = draggingFieldId === field.id;

                return (
                  <div
                    key={field.id}
                    className={cn(
                      "absolute border-2 rounded-md flex items-center gap-1.5 px-2 py-1 cursor-move select-none transition-shadow text-xs",
                      config.color,
                      isSelected && "ring-2 ring-brand ring-offset-1 shadow-md",
                      isDragging && "opacity-80 shadow-lg"
                    )}
                    style={{
                      left: `${field.x}%`,
                      top: `${field.y}%`,
                      width: `${field.width}%`,
                      height: `${field.height}%`,
                      minHeight: 24,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFieldId(field.id);
                    }}
                    onMouseDown={(e) => handleCanvasMouseDown(e, field.id)}
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate font-medium">{config.label}</span>
                    {field.required && (
                      <span className="text-destructive font-bold">*</span>
                    )}
                  </div>
                );
              })}

              {fields.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-sm text-muted-foreground/60">
                    Click "Add Fields" to place signature fields on the document
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Field Properties */}
        {selectedField && (
          <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-surface-secondary border border-border-subtle">
            <span className="text-sm font-medium text-foreground">
              {fieldTypeConfig[selectedField.type].label}
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="field-required" className="text-xs">
                  Required
                </Label>
                <Switch
                  id="field-required"
                  checked={selectedField.required}
                  onCheckedChange={() => handleToggleRequired(selectedField.id)}
                />
              </div>

              <div className="flex items-center gap-1.5 ml-3">
                <Label htmlFor="field-assignee" className="text-xs">
                  Sender
                </Label>
                <Switch
                  id="field-assignee"
                  checked={selectedField.assignedTo === "sender"}
                  onCheckedChange={() => handleToggleAssignee(selectedField.id)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive ml-2"
                onClick={() => handleRemoveField(selectedField.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
