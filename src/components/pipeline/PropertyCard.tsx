import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bed,
  Bath,
  Ruler,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  MoreVertical,
  Image as ImageIcon,
} from "lucide-react";

// Dummy placeholder image for properties without photos
const DUMMY_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop";

export interface PropertyCardData {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  price?: number;
  arv?: number;
  homeType?: string;
  leadType?: string;
  daysInStage?: number;
  sellerPhone?: string;
  sellerEmail?: string;
  images?: string[];
}

function formatMoney(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPhoneForTel(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? digits : `+1${digits}`;
}

interface PropertyCardProps {
  property: PropertyCardData;
  onOpenDetails?: (id: string) => void;
}

export function PropertyCard({
  property,
  onOpenDetails,
}: PropertyCardProps) {
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const imgs = property.images?.length ? property.images : [DUMMY_PROPERTY_IMAGE];
  const thumb = imgs[0];

  const locationLine = `${property.city}, ${property.state} ${property.zip}`;

  const canCall = !!property.sellerPhone;
  const canEmail = !!property.sellerEmail;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "bg-card rounded-2xl border border-border-subtle shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden"
        )}
        onClick={() => onOpenDetails?.(property.id)}
      >
        {/* Top row: homeType badge + time badge + menu */}
        <div className="p-3 pb-0">
          <div className="flex items-center justify-between">
            {/* Left: homeType badge only */}
            <div className="flex items-center gap-2">
              {property.homeType && (
                <Badge variant="secondary" size="sm">
                  {property.homeType}
                </Badge>
              )}
            </div>

            {/* Right: time badge + 3-dot menu */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-muted text-muted-foreground border border-border-subtle">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-medium tabular-nums">
                      {property.daysInStage != null ? `${property.daysInStage}d` : "—"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{property.daysInStage ?? 0} days in current stage</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onOpenDetails?.(property.id)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Middle content */}
        <div className="p-3 pt-2">
          <p className="text-sm font-semibold text-foreground leading-snug break-words">
            {property.address}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locationLine}
          </p>

          {/* Specs row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {property.beds != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" />
                {property.beds}
              </span>
            )}
            {property.baths != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {property.baths}
              </span>
            )}
            {property.sqft != null && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" />
                {property.sqft.toLocaleString()} SF
              </span>
            )}
          </div>

          {/* Price + ARV */}
          <div className="flex items-center gap-3 mt-2">
            <div className="text-base font-bold text-success">
              {formatMoney(property.price)}
            </div>
            {property.arv != null && (
              <div className="text-xs text-muted-foreground">
                ARV: {formatMoney(property.arv)}
              </div>
            )}
          </div>
        </div>

        {/* Property thumbnail */}
        <div className="px-3 pb-2">
          <button
            type="button"
            className="w-full rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setGalleryOpen(true);
            }}
            aria-label="Open photos"
          >
            <img
              src={thumb}
              alt="Property"
              className="w-full h-24 object-cover"
            />
          </button>
        </div>

        <Separator />

        {/* Bottom utility row */}
        <div className="p-3 pt-2">
          <div className="flex items-center justify-end gap-0.5">
            {/* Photo count button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryOpen(true);
                  }}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{imgs.length} Photo{imgs.length !== 1 ? "s" : ""}</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 mx-1" />

            {/* Contact icons - tightly grouped */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    canCall ? "text-muted-foreground hover:text-success" : "text-muted-foreground/40 cursor-not-allowed"
                  )}
                  disabled={!canCall}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (property.sellerPhone) {
                      window.open(`tel:${formatPhoneForTel(property.sellerPhone)}`);
                    }
                  }}
                  aria-label="Call seller"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{canCall ? "Call seller" : "No phone on file"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    canEmail ? "text-muted-foreground hover:text-primary" : "text-muted-foreground/40 cursor-not-allowed"
                  )}
                  disabled={!canEmail}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (property.sellerEmail) {
                      window.open(`mailto:${property.sellerEmail}`);
                    }
                  }}
                  aria-label="Email seller"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{canEmail ? "Email seller" : "No email on file"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open comments/notes panel
                  }}
                  aria-label="View comments"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>View Comments</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Gallery modal */}
        <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
          <DialogContent size="lg" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                {property.address}, {property.city}, {property.state} {property.zip}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2">
              {imgs.map((src, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-md">
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    className="h-44 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
