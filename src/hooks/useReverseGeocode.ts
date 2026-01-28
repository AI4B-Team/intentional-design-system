import { useState, useCallback } from 'react';

interface AddressComponents {
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  formattedAddress: string;
}

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (
    lat: number, 
    lng: number
  ): Promise<AddressComponents | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Try using Google Maps Geocoding API if key is available
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (apiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          const components = result.address_components;
          
          const getComponent = (type: string) => {
            const comp = components.find((c: { types: string[]; long_name?: string; short_name?: string }) => 
              c.types.includes(type)
            );
            return comp?.long_name || comp?.short_name || '';
          };
          
          return {
            streetNumber: getComponent('street_number'),
            streetName: getComponent('route'),
            city: getComponent('locality') || getComponent('sublocality'),
            state: getComponent('administrative_area_level_1'),
            zip: getComponent('postal_code'),
            county: getComponent('administrative_area_level_2'),
            formattedAddress: result.formatted_address
          };
        }
      }
      
      // Fallback: Use OpenStreetMap Nominatim (free, no API key required)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DealFlow-D4D/1.0'
          }
        }
      );
      
      const nominatimData = await nominatimResponse.json();
      
      if (nominatimData && nominatimData.address) {
        const addr = nominatimData.address;
        return {
          streetNumber: addr.house_number || '',
          streetName: addr.road || addr.street || '',
          city: addr.city || addr.town || addr.village || addr.municipality || '',
          state: addr.state || '',
          zip: addr.postcode || '',
          county: addr.county || '',
          formattedAddress: nominatimData.display_name || ''
        };
      }
      
      return null;
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setError('Failed to get address for location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Simple address formatter
  const formatAddress = useCallback((components: AddressComponents | null): string => {
    if (!components) return 'Unknown address';
    
    const parts = [];
    if (components.streetNumber && components.streetName) {
      parts.push(`${components.streetNumber} ${components.streetName}`);
    } else if (components.streetName) {
      parts.push(components.streetName);
    }
    
    if (components.city) parts.push(components.city);
    if (components.state) parts.push(components.state);
    if (components.zip) parts.push(components.zip);
    
    return parts.join(', ') || 'Unknown address';
  }, []);

  return { 
    reverseGeocode, 
    formatAddress,
    loading, 
    error 
  };
}
