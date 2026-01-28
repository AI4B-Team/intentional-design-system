import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  error: string | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  watchPosition?: boolean;
  onPositionChange?: (position: GeolocationState) => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { 
    enableHighAccuracy = true, 
    watchPosition = false,
    onPositionChange 
  } = options;
  
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    altitude: null,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: null,
    error: null
  });
  
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const onPositionChangeRef = useRef(onPositionChange);

  // Keep callback ref updated
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const newState: GeolocationState = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed ? position.coords.speed * 2.237 : null, // m/s to mph
      heading: position.coords.heading,
      timestamp: position.timestamp,
      error: null
    };
    setState(newState);
    onPositionChangeRef.current?.(newState);
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unknown error';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable. Please check your GPS.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.';
        break;
    }
    setState(prev => ({
      ...prev,
      error: errorMessage
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported by this browser' }));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 0
    });
  }, [enableHighAccuracy, handleSuccess, handleError]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported by this browser' }));
      return;
    }
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 0
      }
    );
    setIsTracking(true);
  }, [enableHighAccuracy, handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (watchPosition) {
      startTracking();
    } else {
      getCurrentPosition();
    }
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [watchPosition, startTracking, getCurrentPosition]);

  return {
    ...state,
    isTracking,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
    getCurrentPosition,
    startTracking,
    stopTracking
  };
}
