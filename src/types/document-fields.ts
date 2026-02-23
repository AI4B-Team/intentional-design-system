// ─── Document Field Types ───────────────────────────────────

export type FieldType = "signature" | "initials" | "date" | "text" | "checkbox" | "attachment";

export interface DocumentField {
  id: string;
  type: FieldType;
  label: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage
  height: number; // percentage
  page: number;
  required: boolean;
  assignedTo: "sender" | "recipient";
  value?: string;
}

export const fieldTypeConfig: Record<
  FieldType,
  { label: string; icon: string; defaultWidth: number; defaultHeight: number; color: string }
> = {
  signature: {
    label: "Signature",
    icon: "PenTool",
    defaultWidth: 20,
    defaultHeight: 4,
    color: "bg-brand/10 border-brand/30 text-brand",
  },
  initials: {
    label: "Initials",
    icon: "Type",
    defaultWidth: 8,
    defaultHeight: 4,
    color: "bg-purple-100 border-purple-300 text-purple-700",
  },
  date: {
    label: "Date",
    icon: "Calendar",
    defaultWidth: 14,
    defaultHeight: 3.5,
    color: "bg-amber-100 border-amber-300 text-amber-700",
  },
  text: {
    label: "Text",
    icon: "AlignLeft",
    defaultWidth: 18,
    defaultHeight: 3.5,
    color: "bg-blue-100 border-blue-300 text-blue-700",
  },
  checkbox: {
    label: "Checkbox",
    icon: "CheckSquare",
    defaultWidth: 3,
    defaultHeight: 3,
    color: "bg-emerald-100 border-emerald-300 text-emerald-700",
  },
  attachment: {
    label: "Attachment",
    icon: "Paperclip",
    defaultWidth: 16,
    defaultHeight: 4,
    color: "bg-rose-100 border-rose-300 text-rose-700",
  },
};
