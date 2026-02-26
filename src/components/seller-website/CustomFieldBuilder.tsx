import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, X, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { CustomFormField, CustomFieldType, CUSTOM_FIELD_TYPES } from "@/types/custom-form-fields";

interface CustomFieldBuilderProps {
  customFields: CustomFormField[];
  onUpdate: (fields: CustomFormField[]) => void;
  formFields: string[];
  onUpdateFormFields: (fields: string[]) => void;
}

export function CustomFieldBuilder({
  customFields,
  onUpdate,
  formFields,
  onUpdateFormFields,
}: CustomFieldBuilderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFormField | null>(null);
  const [draft, setDraft] = useState<Partial<CustomFormField>>({});
  const [optionInput, setOptionInput] = useState("");

  const needsOptions = (type: CustomFieldType) =>
    ["dropdown", "radio", "checkbox"].includes(type);

  const openCreate = () => {
    setEditingField(null);
    setDraft({ type: "text", label: "", placeholder: "", required: false, options: [] });
    setOptionInput("");
    setDialogOpen(true);
  };

  const openEdit = (field: CustomFormField) => {
    setEditingField(field);
    setDraft({ ...field });
    setOptionInput("");
    setDialogOpen(true);
  };

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed) return;
    setDraft((d) => ({ ...d, options: [...(d.options || []), trimmed] }));
    setOptionInput("");
  };

  const removeOption = (idx: number) => {
    setDraft((d) => ({ ...d, options: (d.options || []).filter((_, i) => i !== idx) }));
  };

  const save = () => {
    if (!draft.label?.trim() || !draft.type) return;
    if (needsOptions(draft.type) && (!draft.options || draft.options.length < 2)) return;

    if (editingField) {
      // Update existing
      const updated = customFields.map((f) =>
        f.id === editingField.id ? { ...f, ...draft } as CustomFormField : f
      );
      onUpdate(updated);
    } else {
      // Create new
      const id = `custom_${Date.now()}`;
      const newField: CustomFormField = {
        id,
        type: draft.type as CustomFieldType,
        label: draft.label!.trim(),
        placeholder: draft.placeholder || "",
        required: draft.required || false,
        options: draft.options || [],
        icon: CUSTOM_FIELD_TYPES.find((t) => t.value === draft.type)?.icon || "✏️",
      };
      onUpdate([...customFields, newField]);
      // Auto-add to active form fields
      onUpdateFormFields([...formFields, id]);
    }
    setDialogOpen(false);
  };

  const deleteField = (fieldId: string) => {
    onUpdate(customFields.filter((f) => f.id !== fieldId));
    onUpdateFormFields(formFields.filter((f) => f !== fieldId));
  };

  const activeCustomFields = customFields.filter((f) => formFields.includes(f.id));
  const inactiveCustomFields = customFields.filter((f) => !formFields.includes(f.id));

  const toggleCustomField = (fieldId: string) => {
    if (formFields.includes(fieldId)) {
      onUpdateFormFields(formFields.filter((f) => f !== fieldId));
    } else {
      onUpdateFormFields([...formFields, fieldId]);
    }
  };

  return (
    <div className="space-y-2 mt-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Custom Fields</Label>
        <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={openCreate}>
          <Plus className="h-3 w-3" />
          Add Custom Field
        </Button>
      </div>

      {/* Active custom fields in form */}
      {activeCustomFields.length > 0 && (
        <div className="space-y-1">
          {activeCustomFields.map((field) => (
            <div key={field.id} className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
              <span className="text-sm">{field.icon}</span>
              <span className="text-xs flex-1">
                {field.label}
                <span className="text-[10px] text-muted-foreground ml-1.5">
                  ({CUSTOM_FIELD_TYPES.find((t) => t.value === field.type)?.label})
                </span>
              </span>
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => openEdit(field)}>
                <Pencil className="h-3 w-3" />
              </button>
              <button type="button" className="text-destructive hover:text-destructive/80" onClick={() => toggleCustomField(field.id)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inactive custom fields */}
      {inactiveCustomFields.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {inactiveCustomFields.map((field) => (
            <button
              key={field.id}
              type="button"
              className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-[10px] hover:bg-muted transition-colors"
              onClick={() => toggleCustomField(field.id)}
            >
              <Plus className="h-3 w-3" />
              {field.icon} {field.label}
            </button>
          ))}
        </div>
      )}

      {customFields.length === 0 && (
        <p className="text-[10px] text-muted-foreground">
          Create custom fields like text inputs, dropdowns, radio buttons, checkboxes, and more.
        </p>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingField ? "Edit Custom Field" : "Add Custom Field"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Field Type */}
            <div>
              <Label className="text-xs">Field Type</Label>
              <Select
                value={draft.type || "text"}
                onValueChange={(v) => setDraft((d) => ({ ...d, type: v as CustomFieldType, options: needsOptions(v as CustomFieldType) ? d.options || [] : [] }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOM_FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                        <span className="text-muted-foreground text-xs">— {t.description}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div>
              <Label className="text-xs">Field Label *</Label>
              <Input
                value={draft.label || ""}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="e.g. Asking Price, Garage Size"
                className="mt-1"
              />
            </div>

            {/* Placeholder */}
            <div>
              <Label className="text-xs">Placeholder Text</Label>
              <Input
                value={draft.placeholder || ""}
                onChange={(e) => setDraft((d) => ({ ...d, placeholder: e.target.value }))}
                placeholder="e.g. Enter your answer..."
                className="mt-1"
              />
            </div>

            {/* Required toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Required Field</Label>
              <Switch
                checked={draft.required || false}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, required: v }))}
              />
            </div>

            {/* Options for dropdown/radio/checkbox */}
            {needsOptions(draft.type as CustomFieldType) && (
              <div>
                <Label className="text-xs">Options (min 2)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    placeholder="Add an option..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" onClick={addOption} disabled={!optionInput.trim()}>
                    Add
                  </Button>
                </div>
                <div className="space-y-1 mt-2">
                  {(draft.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded border bg-muted/30 px-2 py-1">
                      <span className="text-xs flex-1">{opt}</span>
                      <button type="button" className="text-destructive hover:text-destructive/80" onClick={() => removeOption(idx)}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {(draft.options || []).length < 2 && (
                  <p className="text-[10px] text-destructive mt-1">Add at least 2 options.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            {editingField && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteField(editingField.id);
                  setDialogOpen(false);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={save}
              disabled={!draft.label?.trim() || (needsOptions(draft.type as CustomFieldType) && (draft.options || []).length < 2)}
            >
              {editingField ? "Save Changes" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
