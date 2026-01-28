import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Copy, User, Home, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";

interface MergeFieldsSidebarProps {
  onInsert?: (field: string) => void;
}

const MERGE_FIELDS = [
  {
    category: "Contact Fields",
    icon: User,
    fields: [
      { code: "{{owner_name}}", description: "Full owner name" },
      { code: "{{owner_first_name}}", description: "First name only" },
      { code: "{{phone_number}}", description: "Contact phone" },
    ],
  },
  {
    category: "Property Fields",
    icon: Home,
    fields: [
      { code: "{{property_address}}", description: "Full address" },
      { code: "{{property_street}}", description: "Street only" },
      { code: "{{property_city}}", description: "City" },
      { code: "{{property_state}}", description: "State" },
      { code: "{{beds}}", description: "Bedrooms" },
      { code: "{{baths}}", description: "Bathrooms" },
      { code: "{{sqft}}", description: "Square footage" },
      { code: "{{estimated_value}}", description: "Est. value" },
      { code: "{{equity_percent}}", description: "Equity %" },
    ],
  },
  {
    category: "Your Info",
    icon: Briefcase,
    fields: [
      { code: "{{your_name}}", description: "Your name (from profile)" },
      { code: "{{your_company}}", description: "Your company" },
      { code: "{{your_phone}}", description: "Your callback number" },
    ],
  },
  {
    category: "Other",
    icon: Calendar,
    fields: [
      { code: "{{today_date}}", description: "Today's date" },
      { code: "{{follow_up_date}}", description: "Scheduled follow-up" },
    ],
  },
];

export function MergeFieldsSidebar({ onInsert }: MergeFieldsSidebarProps) {
  const [openCategories, setOpenCategories] = React.useState<string[]>(
    MERGE_FIELDS.map((c) => c.category)
  );

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
  };

  const handleInsert = (code: string) => {
    if (onInsert) {
      onInsert(code);
    } else {
      handleCopy(code);
    }
  };

  return (
    <div className="bg-white border border-border-subtle rounded-medium overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-foreground">Merge Fields</h3>
        <p className="text-tiny text-muted-foreground">
          Click to insert or copy
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {MERGE_FIELDS.map((category) => {
            const Icon = category.icon;
            const isOpen = openCategories.includes(category.category);

            return (
              <Collapsible
                key={category.category}
                open={isOpen}
                onOpenChange={() => toggleCategory(category.category)}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-small hover:bg-muted/50 text-left">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-small font-medium">
                    {category.category}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="pl-6 space-y-1 pb-2">
                    {category.fields.map((field) => (
                      <button
                        key={field.code}
                        onClick={() => handleInsert(field.code)}
                        className="group flex items-center justify-between w-full p-2 rounded-small hover:bg-primary/5 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <code className="text-tiny font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {field.code}
                          </code>
                          <p className="text-tiny text-muted-foreground mt-0.5 truncate">
                            {field.description}
                          </p>
                        </div>
                        <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
