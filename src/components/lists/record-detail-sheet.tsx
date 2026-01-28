import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Building2,
  Home,
  Bed,
  Bath,
  Ruler,
  Calendar,
  DollarSign,
  Percent,
  Flame,
  User,
  History,
  FileText,
  Plus,
  Navigation,
  Layers3,
} from "lucide-react";
import { format } from "date-fns";

interface ListRecord {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  owner_name: string | null;
  owner_type: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
  is_absentee: boolean | null;
  phone: string | null;
  email: string | null;
  motivation_score: number | null;
  list_match_count: number | null;
  source_lists: string[] | null;
  status: string | null;
  distress_indicators: string[] | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  estimated_value: number | null;
  estimated_equity_percent: number | null;
  mailing_address: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  created_at: string;
}

interface RecordDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ListRecord | null;
  sourceListNames: Record<string, string>;
}

const distressLabels: Record<string, { label: string; color: string }> = {
  tax_delinquent: { label: "Tax Delinquent", color: "bg-red-500/10 text-red-600" },
  pre_foreclosure: { label: "Pre-Foreclosure", color: "bg-orange-500/10 text-orange-600" },
  probate: { label: "Probate", color: "bg-purple-500/10 text-purple-600" },
  divorce: { label: "Divorce", color: "bg-pink-500/10 text-pink-600" },
  vacant: { label: "Vacant", color: "bg-yellow-500/10 text-yellow-600" },
  code_violation: { label: "Code Violation", color: "bg-amber-500/10 text-amber-600" },
  high_equity: { label: "High Equity", color: "bg-emerald-500/10 text-emerald-600" },
  absentee: { label: "Absentee", color: "bg-blue-500/10 text-blue-600" },
  tired_landlord: { label: "Tired Landlord", color: "bg-indigo-500/10 text-indigo-600" },
  inherited: { label: "Inherited", color: "bg-violet-500/10 text-violet-600" },
};

export function RecordDetailSheet({
  open,
  onOpenChange,
  record,
  sourceListNames,
}: RecordDetailSheetProps) {
  if (!record) return null;

  const fullAddress = [record.address, record.city, record.state, record.zip]
    .filter(Boolean)
    .join(", ");

  const mailingAddress = [record.mailing_address, record.mailing_city, record.mailing_state, record.mailing_zip]
    .filter(Boolean)
    .join(", ");

  const getMotivationColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 800) return "text-red-500";
    if (score >= 600) return "text-orange-500";
    if (score >= 400) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left">{record.address}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {record.city}, {record.state} {record.zip}
          </p>
          <div className="flex gap-2 mt-2">
            <Button className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add to Properties
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="owner">Owner</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Map Preview Placeholder */}
            <Card className="overflow-hidden">
              <div className="h-32 bg-muted flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <CardContent className="p-3">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 hover:underline"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>

            {/* Source Info */}
            {record.source_lists && record.source_lists.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers3 className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">
                      Appears in {record.list_match_count || record.source_lists.length} lists
                    </span>
                    {(record.list_match_count || 0) >= 3 && (
                      <Flame className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {record.source_lists.map((listId) => (
                      <Badge key={listId} variant="outline" className="text-xs">
                        {sourceListNames[listId] || "Unknown List"}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Distress Indicators */}
            {record.distress_indicators && record.distress_indicators.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Distress Indicators</h4>
                <div className="flex flex-wrap gap-2">
                  {record.distress_indicators.map((indicator) => {
                    const config = distressLabels[indicator] || {
                      label: indicator,
                      color: "bg-muted text-muted-foreground",
                    };
                    return (
                      <Badge key={indicator} className={config.color}>
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Motivation Score */}
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Motivation Score</p>
                <div className="flex items-center justify-center gap-2">
                  {(record.motivation_score || 0) >= 800 && (
                    <Flame className="h-6 w-6 text-red-500" />
                  )}
                  <span className={`text-4xl font-bold ${getMotivationColor(record.motivation_score)}`}>
                    {record.motivation_score || 0}
                  </span>
                  <span className="text-2xl text-muted-foreground">/ 1000</span>
                </div>
              </CardContent>
            </Card>

            {/* Added Date */}
            <p className="text-sm text-muted-foreground">
              Added on {format(new Date(record.created_at), "MMM d, yyyy")}
            </p>
          </TabsContent>

          <TabsContent value="owner" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Owner Name</p>
                <div className="flex items-center gap-2">
                  {record.owner_type === "corporate" ? (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <p className="font-medium">{record.owner_name || "Unknown"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Owner Type</p>
                <Badge variant="outline" className="capitalize">
                  {record.owner_type || "Unknown"}
                </Badge>
              </div>

              <Separator />

              {record.phone ? (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${record.phone}`} className="font-medium text-primary hover:underline">
                      {record.phone}
                    </a>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${record.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`sms:${record.phone}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Text
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Phone</p>
                  <Button>
                    <Phone className="h-4 w-4 mr-2" />
                    Skip Trace
                  </Button>
                </div>
              )}

              {record.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${record.email}`} className="font-medium text-primary hover:underline">
                      {record.email}
                    </a>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Mailing Address</p>
                {mailingAddress ? (
                  <p className="font-medium">{mailingAddress}</p>
                ) : (
                  <p className="text-muted-foreground">Same as property</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Absentee Owner</p>
                <Badge variant={record.is_absentee ? "default" : "outline"}>
                  {record.is_absentee ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="property" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium capitalize">{record.property_type || "Unknown"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Beds / Baths</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{record.beds || "-"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{record.baths || "-"}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Square Feet</p>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {record.sqft ? record.sqft.toLocaleString() : "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Year Built</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{record.year_built || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Estimated Value</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-xl font-bold">
                  {record.estimated_value
                    ? `$${record.estimated_value.toLocaleString()}`
                    : "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Equity</p>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <p className="text-xl font-bold text-emerald-600">
                  ~{record.estimated_equity_percent || 0}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-medium text-sm">Added to list</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(record.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {record.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="font-medium text-sm">Skip traced - phone found</p>
                    <p className="text-xs text-muted-foreground">{record.phone}</p>
                  </div>
                </div>
              )}

              {record.status === "mailed" && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                  <div>
                    <p className="font-medium text-sm">Added to mail campaign</p>
                    <p className="text-xs text-muted-foreground">Q1 Outreach</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
