import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MERGE_FIELDS = [
  { field: "{owner_name}", label: "Owner Name (Full)" },
  { field: "{owner_first_name}", label: "Owner First Name" },
  { field: "{property_address}", label: "Property Address (Full)" },
  { field: "{property_street}", label: "Street Address Only" },
  { field: "{property_city}", label: "City" },
  { field: "{property_state}", label: "State" },
  { field: "{property_zip}", label: "ZIP Code" },
  { field: "{your_name}", label: "Your Name" },
  { field: "{your_company}", label: "Your Company" },
  { field: "{your_phone}", label: "Your Phone" },
  { field: "{tracking_phone}", label: "Tracking Phone" },
  { field: "{offer_amount}", label: "Offer Amount" },
  { field: "{current_date}", label: "Current Date" },
];

const FONT_FAMILIES = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "'Caveat', cursive", label: "Caveat (Handwriting)" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans" },
];

const TEXT_COLORS = [
  { value: "#1f2937", label: "Dark Gray" },
  { value: "#374151", label: "Gray" },
  { value: "#1565C0", label: "Blue" },
  { value: "#2563eb", label: "Primary Blue" },
  { value: "#dc2626", label: "Red" },
  { value: "#16a34a", label: "Green" },
  { value: "#000000", label: "Black" },
  { value: "#ffffff", label: "White" },
];

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  isYellowLetter?: boolean;
}

export function RichTextEditor({ content, onChange, placeholder, isYellowLetter }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start typing your content...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none",
          isYellowLetter && "bg-[#FFF9C4]"
        ),
        style: isYellowLetter ? "font-family: 'Caveat', cursive; font-size: 20px;" : "",
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const insertMergeField = (field: string) => {
    editor
      .chain()
      .focus()
      .insertContent(`<span style="background: #dbeafe; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${field}</span>&nbsp;`)
      .run();
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setFontFamily = (font: string) => {
    editor.chain().focus().setMark("textStyle", { fontFamily: font }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Type className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Font</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Font Family</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {FONT_FAMILIES.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => setFontFamily(font.value)}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Bold */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("bold") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>

        {/* Italic */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("italic") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>

        {/* Underline */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("underline") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <div className="h-4 w-4 rounded border flex items-center justify-center">
                <div className="h-3 w-3 rounded-sm bg-current" />
              </div>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className="h-8 w-8 rounded border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => editor.chain().focus().setColor(color.value).run()}
                  title={color.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive({ textAlign: "left" }) && "bg-muted")}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive({ textAlign: "center" }) && "bg-muted")}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive({ textAlign: "right" }) && "bg-muted")}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Image */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Merge Fields */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 ml-1 text-brand">
              <span className="text-xs">{`{...}`}</span>
              <span className="text-xs hidden sm:inline">Merge Field</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuLabel>Insert Merge Field</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {MERGE_FIELDS.map((field) => (
              <DropdownMenuItem
                key={field.field}
                onClick={() => insertMergeField(field.field)}
              >
                <span className="font-mono text-brand mr-2">{field.field}</span>
                <span className="text-content-secondary text-xs">{field.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className={cn(isYellowLetter && "bg-[#FFF9C4]")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
