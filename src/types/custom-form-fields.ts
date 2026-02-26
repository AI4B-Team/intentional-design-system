export type CustomFieldType = "text" | "textarea" | "dropdown" | "radio" | "checkbox" | "number" | "date" | "email" | "phone" | "url" | "rating";

export interface CustomFormField {
  id: string;
  type: CustomFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For dropdown, radio, checkbox
  icon?: string;
}

export const CUSTOM_FIELD_TYPES: { value: CustomFieldType; label: string; icon: string; description: string }[] = [
  { value: "text", label: "Short Text", icon: "✏️", description: "Single line text input" },
  { value: "textarea", label: "Long Text", icon: "📄", description: "Multi-line text area" },
  { value: "dropdown", label: "Dropdown", icon: "📋", description: "Select from a list" },
  { value: "radio", label: "Radio Buttons", icon: "🔘", description: "Choose one option" },
  { value: "checkbox", label: "Checkboxes", icon: "☑️", description: "Select multiple options" },
  { value: "number", label: "Number", icon: "🔢", description: "Numeric input" },
  { value: "date", label: "Date", icon: "📅", description: "Date picker" },
  { value: "email", label: "Email", icon: "📧", description: "Email address" },
  { value: "phone", label: "Phone", icon: "📱", description: "Phone number" },
  { value: "url", label: "Website URL", icon: "🔗", description: "Website link" },
  { value: "rating", label: "Rating (1-5)", icon: "⭐", description: "Star rating scale" },
];
