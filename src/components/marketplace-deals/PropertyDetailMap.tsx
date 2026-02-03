import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";

interface CompData {
  id: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  salePrice: number;
  pricePerSqft: number;
  distanceMiles: number;
  similarity: number;
  saleDate: string;
  quality: "excellent" | "good";
  saleType: string;
}

interface PropertyDetailMapProps {
  subjectProperty: {
    address: string;
    city: string;
    state: string;
    zip: string;
    beds: number;
    baths: number;
    sqft: number;
    price: number;
    arv: number;
    latitude?: number;
    longitude?: number;
  };
  comps: CompData[];
}

// Generate mock coordinates around a center point
function generateMockCoords(
  centerLat: number,
  centerLng: number,
  index: number,
  distance: number
): [number, number] {
  const angle = (index * 90 + 45) * (Math.PI / 180);
  const latOffset = Math.cos(angle) * (distance / 69);
  const lngOffset = Math.sin(angle) * (distance / 54.6);
  return [centerLat + latOffset, centerLng + lngOffset];
}

export function PropertyDetailMap({ subjectProperty, comps }: PropertyDetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Default to Austin, TX if no coords
    const centerLat = subjectProperty.latitude || 30.2672;
    const centerLng = subjectProperty.longitude || -97.7431;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Subject property marker (blue, larger)
    const subjectIcon = L.divIcon({
      className: "subject-marker",
      html: `
        <div style="
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const subjectMarker = L.marker([centerLat, centerLng], { icon: subjectIcon }).addTo(map);
    subjectMarker.bindPopup(`
      <div style="min-width: 200px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Subject Property</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${subjectProperty.address}</div>
        <div style="font-weight: 700; font-size: 18px; color: #3b82f6;">$${subjectProperty.price.toLocaleString()}</div>
        <div style="font-size: 12px; color: #64748b;">ARV: $${subjectProperty.arv.toLocaleString()}</div>
        <div style="font-size: 12px; margin-top: 4px;">
          ${subjectProperty.beds} bd • ${subjectProperty.baths} ba • ${subjectProperty.sqft.toLocaleString()} sqft
        </div>
      </div>
    `);

    // Add search radius circle
    L.circle([centerLat, centerLng], {
      radius: 1609.34, // 1 mile in meters
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.08,
      weight: 2,
      dashArray: "5, 5",
    }).addTo(map);

    // Comp markers
    const bounds = L.latLngBounds([[centerLat, centerLng]]);

    comps.forEach((comp, index) => {
      const [lat, lng] = generateMockCoords(centerLat, centerLng, index, comp.distanceMiles);
      bounds.extend([lat, lng]);

      const isExcellent = comp.quality === "excellent";
      const compIcon = L.divIcon({
        className: "comp-marker",
        html: `
          <div style="
            background: ${isExcellent ? "#22c55e" : "#eab308"};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: white;
          ">${index + 1}</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon: compIcon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width: 180px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">${comp.address}</div>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
            <span style="
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 4px;
              background: ${isExcellent ? "#dcfce7" : "#fef9c3"};
              color: ${isExcellent ? "#166534" : "#854d0e"};
            ">${comp.similarity}% Match</span>
            <span style="font-size: 10px; color: #64748b;">${comp.saleType}</span>
          </div>
          <div style="font-weight: 700; font-size: 16px; color: #10b981;">$${comp.salePrice.toLocaleString()}</div>
          <div style="font-size: 11px; color: #64748b;">$${comp.pricePerSqft}/sqft • ${comp.distanceMiles} mi</div>
          <div style="font-size: 11px; margin-top: 4px;">
            ${comp.beds} bd • ${comp.baths} ba • ${comp.sqft.toLocaleString()} sqft
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            Sold ${new Date(comp.saleDate).toLocaleDateString()}
          </div>
        </div>
      `);
    });

    // Fit bounds to show all markers
    if (comps.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup handled by React
    };
  }, [subjectProperty, comps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg border p-3 shadow-lg z-[1000]">
        <p className="text-xs font-medium text-muted-foreground mb-2">Map Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-white shadow" />
            <span className="text-xs">Subject Property</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-success border-2 border-white shadow" />
            <span className="text-xs">Excellent Match (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-warning border-2 border-white shadow" />
            <span className="text-xs">Good Match (70-89%)</span>
          </div>
        </div>
      </div>

      {/* Property Quick Info */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg border p-3 shadow-lg z-[1000] max-w-[280px]">
        <Badge className="mb-2 bg-primary text-primary-foreground">Subject Property</Badge>
        <p className="font-semibold text-sm">{subjectProperty.address}</p>
        <p className="text-xs text-muted-foreground mb-2">
          {subjectProperty.city}, {subjectProperty.state} {subjectProperty.zip}
        </p>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold">${subjectProperty.price.toLocaleString()}</span>
          <span className="text-success font-semibold">ARV: ${subjectProperty.arv.toLocaleString()}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {subjectProperty.beds} bd • {subjectProperty.baths} ba • {subjectProperty.sqft.toLocaleString()} sqft
        </p>
      </div>

      {/* Comp Count */}
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg border px-3 py-2 shadow-lg z-[1000]">
        <p className="text-sm font-medium">{comps.length} Comps Shown</p>
      </div>
    </div>
  );
}
