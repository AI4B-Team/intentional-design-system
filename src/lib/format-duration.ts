/**
 * Format seconds into a human-readable duration string
 * @param seconds - Total seconds to format
 * @returns Formatted string like "1:23:45" or "23:45"
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds into a verbose duration string
 * @param seconds - Total seconds to format  
 * @returns Formatted string like "1h 23m" or "23 min"
 */
export function formatDurationVerbose(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  if (mins > 0) {
    return `${mins} min`;
  }
  return `${seconds}s`;
}

/**
 * Format miles with appropriate precision
 * @param miles - Distance in miles
 * @returns Formatted string like "1.2 mi" or "0.05 mi"
 */
export function formatMiles(miles: number): string {
  if (miles < 0.1) {
    return `${(miles * 5280).toFixed(0)} ft`; // Convert to feet for short distances
  }
  return `${miles.toFixed(1)} mi`;
}

/**
 * Format speed in mph
 * @param speed - Speed in mph
 * @returns Formatted string like "25 mph"
 */
export function formatSpeed(speed: number | null): string {
  if (speed === null || isNaN(speed)) return '--';
  return `${Math.round(speed)} mph`;
}

/**
 * Format heading as cardinal direction
 * @param heading - Heading in degrees (0-360)
 * @returns Cardinal direction like "N", "NE", "E", etc.
 */
export function formatHeading(heading: number | null): string {
  if (heading === null || isNaN(heading)) return '--';
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
}
