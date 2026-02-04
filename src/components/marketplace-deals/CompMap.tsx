import React, { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CompMarker {
  id: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  salePrice: number;
  distanceMiles: number;
  quality: "excellent" | "good";
  latitude: number;
  longitude: number;
}

interface CompMapProps {
  subjectLat: number;
  subjectLng: number;
  subjectAddress: string;
  subjectPrice: number;
  comps: CompMarker[];
}

export function CompMap({
  subjectLat,
  subjectLng,
  subjectAddress,
  subjectPrice,
  comps,
}: CompMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const subjectLatLng = useMemo(() => L.latLng(subjectLat, subjectLng), [subjectLat, subjectLng]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [subjectLat, subjectLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    // Clear previous overlays
    group.clearLayers();

    const subjectIcon = L.divIcon({
      className: "subject-marker",
      html: `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background: hsl(var(--primary));
          border: 3px solid hsl(var(--background));
          box-shadow: 0 8px 18px hsl(var(--foreground) / 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: hsl(var(--primary-foreground));
        ">S</div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    // Subject marker
    const subjectMarker = L.marker(subjectLatLng, { icon: subjectIcon }).addTo(group);
    subjectMarker.bindPopup(`
      <div style="min-width: 180px;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">Subject Property</div>
        <div style="font-size: 12px; opacity: 0.85; margin-bottom: 6px;">${subjectAddress}</div>
        <div style="font-weight: 800; font-size: 16px;">$${subjectPrice.toLocaleString()}</div>
      </div>
    `);

    // 1 mile radius
    L.circle(subjectLatLng, {
      radius: 1609,
      color: "hsl(var(--primary))",
      fillColor: "hsl(var(--primary))",
      fillOpacity: 0.06,
      weight: 2,
      dashArray: "6 6",
    }).addTo(group);

    const bounds = L.latLngBounds([subjectLatLng]);

    // Comp markers
    comps.forEach((comp, idx) => {
      const latlng = L.latLng(comp.latitude, comp.longitude);
      bounds.extend(latlng);

      const compBg = comp.quality === "excellent" ? "hsl(var(--success))" : "hsl(var(--warning))";
      const compFg = "hsl(var(--primary-foreground))";

      const compIcon = L.divIcon({
        className: "comp-marker",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 9999px;
            background: ${compBg};
            border: 3px solid hsl(var(--background));
            box-shadow: 0 8px 18px hsl(var(--foreground) / 0.16);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 800;
            color: ${compFg};
          ">${idx + 1}</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker(latlng, { icon: compIcon }).addTo(group);
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px;">${comp.address}</div>
          <div style="font-size: 12px; opacity: 0.85; margin-bottom: 6px;">${comp.beds} bd • ${comp.baths} ba • ${comp.sqft.toLocaleString()} sqft</div>
          <div style="font-weight: 800; font-size: 16px;">$${comp.salePrice.toLocaleString()}</div>
          <div style="font-size: 12px; opacity: 0.85;">${comp.distanceMiles} mi away</div>
        </div>
      `);
    });

    // Fit bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    // Keep map centered nicely if it was already initialized
    // (fitBounds above handles it for first paint and subsequent updates)
  }, [comps, subjectAddress, subjectLat, subjectLatLng, subjectLng, subjectPrice]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerGroupRef.current = null;
    };
  }, []);

  return (
    <div className="h-[250px] rounded-lg overflow-hidden border bg-muted">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
