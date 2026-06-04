import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Eye, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import { cn } from "@/lib/utils";

interface StreetViewPanelProps {
  open: boolean;
  lat: number | null;
  lng: number | null;
  address?: string;
  onClose: () => void;
}

export function StreetViewPanel({ open, lat, lng, address, onClose }: StreetViewPanelProps) {
  const panoRef = useRef<HTMLDivElement>(null);
  const panoInstance = useRef<google.maps.StreetViewPanorama | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "unavailable" | "error">("idle");

  useEffect(() => {
    if (!open || lat == null || lng == null) return;

    let cancelled = false;
    setState("loading");

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !panoRef.current) return;

        const svService = new google.maps.StreetViewService();
        svService.getPanorama(
          { location: { lat, lng }, radius: 80, source: google.maps.StreetViewSource.OUTDOOR },
          (data, status) => {
            if (cancelled) return;
            if (status !== google.maps.StreetViewStatus.OK || !data?.location?.latLng) {
              setState("unavailable");
              return;
            }

            const heading = google.maps.geometry?.spherical
              ? google.maps.geometry.spherical.computeHeading(data.location.latLng, new google.maps.LatLng(lat, lng))
              : 0;

            panoInstance.current = new google.maps.StreetViewPanorama(panoRef.current!, {
              pano: data.location.pano,
              pov: { heading, pitch: 0 },
              zoom: 1,
              addressControl: false,
              fullscreenControl: true,
              motionTracking: false,
              motionTrackingControl: false,
              zoomControl: true,
              panControl: true,
              linksControl: true,
              enableCloseButton: false,
            });
            setState("ready");
          }
        );
      })
      .catch((err) => {
        console.error("Street View load failed:", err);
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
      panoInstance.current = null;
    };
  }, [open, lat, lng]);

  if (!open) return null;

  const openInGoogle = () => {
    if (lat == null || lng == null) return;
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="absolute inset-y-0 right-0 z-[1100] w-full sm:w-[480px] lg:w-[560px] bg-background border-l border-border shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Street View</p>
            {address && <p className="text-xs text-muted-foreground truncate">{address}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openInGoogle} title="Open in Google Maps">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 bg-muted">
        <div ref={panoRef} className={cn("absolute inset-0", state !== "ready" && "invisible")} />

        {state === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading Street View…</p>
          </div>
        )}

        {state === "unavailable" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground px-6 text-center">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-sm font-medium">No Street View Imagery</p>
            <p className="text-xs">Google has no coverage within ~80m of this location.</p>
          </div>
        )}

        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-destructive px-6 text-center">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-sm font-medium">Failed to Load</p>
            <p className="text-xs text-muted-foreground">Check the Google Maps connector.</p>
          </div>
        )}
      </div>
    </div>
  );
}
