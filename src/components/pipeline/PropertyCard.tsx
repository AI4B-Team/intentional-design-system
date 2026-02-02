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

// Dummy placeholder images for properties without photos
const DUMMY_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
];

// Get a shuffled subset of images based on property ID for variety
function getPropertyImages(propertyId: string): string[] {
  // Simple hash from property ID to create variety
  const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const startIdx = hash % DUMMY_PROPERTY_IMAGES.length;
  const count = 5 + (hash % 8); // 5-12 images per property
  
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    images.push(DUMMY_PROPERTY_IMAGES[(startIdx + i) % DUMMY_PROPERTY_IMAGES.length]);
  }
  return images;
}

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
  const imgs = property.images?.length ? property.images : getPropertyImages(property.id);
  
  // Show 5 thumbnails max, with last one showing "+X" if more exist
  const maxThumbnails = 5;
  const displayThumbnails = imgs.slice(0, maxThumbnails);
  const remainingCount = imgs.length - maxThumbnails;

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
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/15 text-success border border-success/20">
                  {property.homeType}
                </span>
              )}
            </div>

            {/* Right: time badge + 3-dot menu - no box, tight spacing */}
            <div className="flex items-center gap-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-medium tabular-nums">
                      {property.daysInStage != null 
                        ? property.daysInStage === 0 
                          ? "Today" 
                          : `${property.daysInStage}D`
                        : "—"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{property.daysInStage ?? 0} days in current stage</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
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

        {/* Photo thumbnails row */}
        <div className="px-3 pb-2">
          <button
            type="button"
            className="flex gap-1.5 w-full justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setGalleryOpen(true);
            }}
            aria-label="Open photos"
          >
            {displayThumbnails.map((src, idx) => {
              const isLast = idx === displayThumbnails.length - 1;
              const showOverlay = isLast && remainingCount > 0;
              
              return (
                <div
                  key={idx}
                  className="relative h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0"
                >
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">+{remainingCount}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </button>
        </div>

        <Separator />

        {/* Bottom utility row */}
        <div className="p-3 pt-2">
          <div className="flex items-center justify-between">
            {/* Left: Photo count */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-foreground hover:text-foreground gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryOpen(true);
                  }}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-xs tabular-nums">{imgs.length}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{imgs.length} Photo{imgs.length !== 1 ? "s" : ""}</p>
              </TooltipContent>
            </Tooltip>

            {/* Right: Contact icons - tightly grouped */}
            <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-foreground hover:text-foreground"
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
                <p>{canCall ? "Call Seller" : "No Phone On File"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-foreground hover:text-foreground"
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
                <p>{canEmail ? "Email Seller" : "No Email On File"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-foreground hover:text-foreground gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open comments/notes panel
                  }}
                  aria-label="View comments"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs tabular-nums">5</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>View Comments (5)</p>
              </TooltipContent>
            </Tooltip>
            </div>
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
