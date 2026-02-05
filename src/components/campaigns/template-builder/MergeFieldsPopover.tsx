import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  User,
  Home,
  DollarSign,
  Briefcase,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

interface MergeField {
  value: string;
  label: string;
  preview: string;
  description?: string;
}

interface FieldCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  fields: MergeField[];
}

const EMAIL_FIELD_CATEGORIES: FieldCategory[] = [
  {
    id: "agent",
    label: "Agent Info",
    icon: User,
    fields: [
      { value: "agent_name", label: "Agent Name", preview: "John Smith", description: "Full name of the listing agent" },
      { value: "agent_first_name", label: "Agent First Name", preview: "John", description: "First name only for casual tone" },
      { value: "agent_email", label: "Agent Email", preview: "john@realty.com", description: "Agent's email address" },
      { value: "agent_phone", label: "Agent Phone", preview: "(555) 123-4567", description: "Agent's phone number" },
      { value: "brokerage", label: "Brokerage", preview: "ABC Realty", description: "Agent's brokerage name" },
    ],
  },
  {
    id: "property",
    label: "Property",
    icon: Home,
    fields: [
      { value: "property_address", label: "Full Address", preview: "123 Main St, Austin, TX", description: "Complete property address" },
      { value: "property_street", label: "Street", preview: "123 Main St", description: "Street address only" },
      { value: "property_city", label: "City", preview: "Austin", description: "City name" },
      { value: "property_state", label: "State", preview: "TX", description: "State abbreviation" },
      { value: "property_zip", label: "ZIP Code", preview: "78701", description: "ZIP/Postal code" },
      { value: "beds", label: "Bedrooms", preview: "3", description: "Number of bedrooms" },
      { value: "baths", label: "Bathrooms", preview: "2", description: "Number of bathrooms" },
      { value: "sqft", label: "Square Feet", preview: "1,850", description: "Property square footage" },
      { value: "list_price", label: "List Price", preview: "$425,000", description: "Current listing price" },
      { value: "days_on_market", label: "Days on Market", preview: "45", description: "Days since listing" },
    ],
  },
  {
    id: "offer",
    label: "Offer Terms",
    icon: DollarSign,
    fields: [
      { value: "offer_amount", label: "Offer Amount", preview: "$380,000", description: "Your calculated offer price" },
      { value: "earnest_money", label: "Earnest Money", preview: "$5,000", description: "Earnest money deposit amount" },
      { value: "closing_timeline", label: "Closing Timeline", preview: "21 days", description: "Proposed closing period" },
      { value: "inspection_period", label: "Due Diligence", preview: "10 days", description: "Inspection/due diligence period" },
    ],
  },
  {
    id: "sender",
    label: "Your Info",
    icon: Briefcase,
    fields: [
      { value: "your_name", label: "Your Name", preview: "Jane Doe", description: "Your full name" },
      { value: "your_company", label: "Your Company", preview: "Acme Investments", description: "Your company name" },
      { value: "your_phone", label: "Your Phone", preview: "(555) 987-6543", description: "Your contact phone" },
      { value: "your_email", label: "Your Email", preview: "jane@acme.com", description: "Your email address" },
    ],
  },
];

const SMS_FIELD_CATEGORIES: FieldCategory[] = [
  {
    id: "agent",
    label: "Agent",
    icon: User,
    fields: [
      { value: "agent_first_name", label: "Agent First Name", preview: "John", description: "Keeps SMS personal" },
    ],
  },
  {
    id: "property",
    label: "Property",
    icon: Home,
    fields: [
      { value: "property_address", label: "Address", preview: "123 Main St", description: "Property street address" },
    ],
  },
  {
    id: "offer",
    label: "Offer",
    icon: DollarSign,
    fields: [
      { value: "offer_amount", label: "Offer", preview: "$380K", description: "Your offer amount" },
    ],
  },
  {
    id: "sender",
    label: "You",
    icon: Briefcase,
    fields: [
      { value: "your_name", label: "Your Name", preview: "Jane", description: "Your name for sign-off" },
      { value: "your_phone", label: "Your Phone", preview: "(555) 987-6543", description: "Callback number" },
    ],
  },
];

interface MergeFieldsPopoverProps {
  onInsert: (field: string) => void;
  variant?: "email" | "sms";
  triggerClassName?: string;
}

export function MergeFieldsPopover({
  onInsert,
  variant = "email",
  triggerClassName,
}: MergeFieldsPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [recentFields, setRecentFields] = React.useState<string[]>([]);

  const categories = variant === "email" ? EMAIL_FIELD_CATEGORIES : SMS_FIELD_CATEGORIES;

  // Filter fields based on search
  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return categories;
    
    const searchLower = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        fields: cat.fields.filter(
          (field) =>
            field.label.toLowerCase().includes(searchLower) ||
            field.value.toLowerCase().includes(searchLower) ||
            field.preview.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((cat) => cat.fields.length > 0);
  }, [categories, search]);

  const handleInsert = (field: MergeField) => {
    onInsert(`{${field.value}}`);
    setRecentFields((prev) => {
      const updated = [field.value, ...prev.filter((f) => f !== field.value)].slice(0, 3);
      return updated;
    });
    setOpen(false);
    setSearch("");
  };

  const getRecentFields = () => {
    return recentFields
      .map((value) => {
        for (const cat of categories) {
          const field = cat.fields.find((f) => f.value === value);
          if (field) return field;
        }
        return null;
      })
      .filter(Boolean) as MergeField[];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all",
            triggerClassName
          )}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">Insert Merge Field</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 shadow-xl border-border/50"
        sideOffset={8}
      >
        {/* Header with search */}
        <div className="p-3 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fields..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-background"
            />
          </div>
        </div>

        <ScrollArea className="h-[320px]">
          <div className="p-2">
            {/* Recent fields */}
            {!search && recentFields.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1.5 text-tiny font-medium text-muted-foreground uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  Recently Used
                </div>
                <div className="flex flex-wrap gap-1.5 px-2 pt-1">
                  {getRecentFields().map((field) => (
                    <button
                      key={field.value}
                      onClick={() => handleInsert(field)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-tiny font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <span className="font-mono">{`{${field.value}}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category tabs */}
            {!search && (
              <div className="flex gap-1 px-2 pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-tiny font-medium transition-colors",
                    activeCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  All
                </button>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-tiny font-medium transition-colors",
                        activeCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fields list */}
            <div className="space-y-3">
              {filteredCategories
                .filter((cat) => !activeCategory || cat.id === activeCategory)
                .map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id}>
                      {(search || !activeCategory) && (
                        <div className="flex items-center gap-2 px-2 py-1.5 text-tiny font-medium text-muted-foreground uppercase tracking-wider">
                          <Icon className="h-3 w-3" />
                          {category.label}
                        </div>
                      )}
                      <div className="space-y-0.5">
                        {category.fields.map((field) => (
                          <TooltipProvider key={field.value} delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleInsert(field)}
                                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors group text-left"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <code className="text-tiny font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                        {`{${field.value}}`}
                                      </code>
                                      <span className="text-small text-foreground truncate">
                                        {field.label}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-tiny text-muted-foreground bg-muted/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {field.preview}
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[200px]">
                                <p className="text-tiny">{field.description}</p>
                                <p className="text-tiny text-muted-foreground mt-1">
                                  Preview: <span className="font-medium">{field.preview}</span>
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-small">No fields match "{search}"</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer tip */}
        <div className="p-2 border-t bg-muted/20">
          <p className="text-tiny text-muted-foreground text-center">
            Fields auto-populate with real data when sending
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
