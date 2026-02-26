import { useCallback } from "react";

export interface GeocodedLocation {
  lat: number;
  lng: number;
  bbox?: [string, string, string, string];
  displayName: string;
  type: string;
}

export function useGeocodeSearch() {
  const geocode = useCallback(async (query: string): Promise<GeocodedLocation | null> => {
    if (!query.trim()) return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&addressdetails=1&limit=1`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'en-US,en' }
      });
      const data = await response.json();
      if (!data || data.length === 0) return null;
      const r = data[0];
      return {
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        bbox: r.boundingbox,
        displayName: r.display_name,
        type: r.type || r.class || 'place',
      };
    } catch {
      return null;
    }
  }, []);

  return { geocode };
}
