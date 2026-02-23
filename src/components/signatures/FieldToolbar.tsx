import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenTool,
  Type,
  Calendar,
  AlignLeft,
  CheckSquare,
  Paperclip,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldType, fieldTypeConfig, DocumentField } from "@/types/document-fields";

const iconMap: Record<string, React.ElementType> = {
  PenTool,
  Type,
  Calendar,
  AlignLeft,
  CheckSquare,
  Paperclip,
};

interface FieldToolbarProps {
  onAddField: (type: FieldType) => void;
  fields: DocumentField[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onRemoveField: (id: string) => void;
}

export function FieldToolbar({
  onAddField,
  fields,
  selectedFieldId,
  onSelectField,
  onRemoveField,
}: FieldToolbarProps) {
  return (
    <div className="w-56 flex-shrink-0 space-y-4">
      {/* Add Fields */}
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
          Add Fields
        </p>
        <div className="space-y-1">
          {(Object.keys(fieldTypeConfig) as FieldType[]).map((type) => {
            const config = fieldTypeConfig[type];
            const Icon = iconMap[config.icon] || PenTool;
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => onAddField(type)}
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Placed Fields */}
      {fields.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
            Placed ({fields.length})
          </p>
          <div className="space-y-1">
            {fields.map((field) => {
              const config = fieldTypeConfig[field.type];
              return (
                <button
                  key={field.id}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors",
                    selectedFieldId === field.id
                      ? "bg-brand/10 text-brand"
                      : "hover:bg-surface-secondary text-content-secondary"
                  )}
                  onClick={() => onSelectField(field.id)}
                >
                  <GripVertical className="h-3 w-3 flex-shrink-0 opacity-50" />
                  <span className="truncate flex-1">
                    {config.label}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
                  </span>
                  <Badge variant="outline" className="text-[9px] h-4 capitalize">
                    {field.assignedTo}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
