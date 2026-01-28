/**
 * Heat map data generation utilities for D4D coverage visualization
 */

export interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface TaggedProperty {
  latitude: number;
  longitude: number;
  tagged_at: string | null;
}

export interface CoverageStats {
  totalAreaSqMi: number;
  mostDrivenArea: string | null;
  coveragePercentage: number;
}

/**
 * Generate heat map data from route points and tagged properties
 * Points are weighted by recency (decay over 90 days) and type
 */
export function generateHeatMapData(
  routePoints: RoutePoint[],
  taggedProperties: TaggedProperty[]
): HeatPoint[] {
  const points: HeatPoint[] = [];
  const now = Date.now();

  // Add route points with time decay
  routePoints.forEach((point) => {
    const recordedAt = point.recorded_at ? new Date(point.recorded_at).getTime() : now;
    const ageDays = (now - recordedAt) / (1000 * 60 * 60 * 24);
    const weight = Math.max(0.2, 1 - ageDays / 90); // Decay over 90 days

    points.push({
      lat: point.latitude,
      lng: point.longitude,
      weight: weight * 0.5, // Route points weighted less
    });
  });

  // Add property points with higher weight
  taggedProperties.forEach((prop) => {
    const taggedAt = prop.tagged_at ? new Date(prop.tagged_at).getTime() : now;
    const ageDays = (now - taggedAt) / (1000 * 60 * 60 * 24);
    const weight = Math.max(0.3, 1 - ageDays / 90);

    points.push({
      lat: prop.latitude,
      lng: prop.longitude,
      weight: weight * 1.5, // Properties weighted more
    });
  });

  return points;
}

/**
 * Get color for heat intensity (0-1 scale)
 */
export function getHeatColor(intensity: number): string {
  if (intensity >= 0.8) return 'hsl(0, 80%, 50%)'; // Red - heavily covered
  if (intensity >= 0.5) return 'hsl(30, 80%, 50%)'; // Orange - moderately covered
  if (intensity >= 0.2) return 'hsl(50, 80%, 50%)'; // Yellow - lightly covered
  return 'hsl(220, 10%, 60%)'; // Gray - minimal coverage
}

/**
 * Calculate approximate coverage area from points using bounding box
 */
export function calculateCoverageArea(points: HeatPoint[]): number {
  if (points.length < 2) return 0;

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Approximate conversion (varies by latitude)
  const latMiles = (maxLat - minLat) * 69; // ~69 miles per degree latitude
  const lngMiles = (maxLng - minLng) * 69 * Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);

  return latMiles * lngMiles;
}

/**
 * Group points into grid cells for intensity calculation
 */
export function createGridCells(
  points: HeatPoint[],
  gridSize: number = 0.001 // ~100m cells
): Map<string, number> {
  const grid = new Map<string, number>();

  points.forEach((point) => {
    const cellKey = `${Math.floor(point.lat / gridSize)},${Math.floor(point.lng / gridSize)}`;
    const currentWeight = grid.get(cellKey) || 0;
    grid.set(cellKey, currentWeight + point.weight);
  });

  return grid;
}

/**
 * Check if a point is inside a polygon (for saved areas)
 */
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    if (yi > point.lng !== yj > point.lng && point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculate distance between two points in miles
 */
export function distanceBetweenPoints(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
