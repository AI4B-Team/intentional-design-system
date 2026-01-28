import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationContext } from '@/hooks/useOrganizationId';
import { useGeolocation } from './useGeolocation';
import { toast } from 'sonner';

interface DrivingSession {
  id: string;
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  totalMiles: number;
  propertiesTagged: number;
  photosTaken: number;
  routeCoordinates: Array<{ lat: number; lng: number; timestamp: string }>;
}

interface RoutePoint {
  session_id: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  recorded_at: string;
}

export function useDrivingSession() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const [session, setSession] = useState<DrivingSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [activeDuration, setActiveDuration] = useState(0);
  
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const routePointsBufferRef = useRef<RoutePoint[]>([]);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track position changes
  const handlePositionChange = useCallback((pos: { 
    latitude: number | null; 
    longitude: number | null;
    altitude: number | null;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
  }) => {
    if (!session || isPaused || !pos.latitude || !pos.longitude) return;
    
    const point: RoutePoint = {
      session_id: session.id,
      latitude: pos.latitude,
      longitude: pos.longitude,
      altitude: pos.altitude,
      accuracy: pos.accuracy,
      speed: pos.speed,
      heading: pos.heading,
      recorded_at: new Date().toISOString()
    };
    
    routePointsBufferRef.current.push(point);
    
    // Calculate distance from last point
    if (lastPositionRef.current) {
      const distance = calculateDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        pos.latitude,
        pos.longitude
      );
      
      // Only count if moved more than ~50 feet (0.01 miles)
      if (distance > 0.01) {
        setSession(prev => prev ? {
          ...prev,
          totalMiles: prev.totalMiles + distance,
          routeCoordinates: [
            ...prev.routeCoordinates,
            { lat: pos.latitude!, lng: pos.longitude!, timestamp: new Date().toISOString() }
          ]
        } : null);
      }
    }
    
    lastPositionRef.current = { lat: pos.latitude, lng: pos.longitude };
  }, [session, isPaused]);

  const { 
    latitude, 
    longitude, 
    speed, 
    heading, 
    accuracy, 
    altitude,
    error: geoError,
    isTracking,
    startTracking, 
    stopTracking 
  } = useGeolocation({
    watchPosition: isActive && !isPaused,
    onPositionChange: handlePositionChange
  });

  // Flush route points to database
  const flushRoutePoints = useCallback(async () => {
    if (routePointsBufferRef.current.length === 0) return;
    
    const points = [...routePointsBufferRef.current];
    routePointsBufferRef.current = [];
    
    const { error } = await supabase.from('d4d_route_points').insert(points);
    if (error) {
      console.error('Failed to save route points:', error);
      // Put points back in buffer on failure
      routePointsBufferRef.current = [...points, ...routePointsBufferRef.current];
    }
  }, []);

  // Start new session
  const startSession = useCallback(async (name?: string) => {
    if (!user) {
      toast.error('Please sign in to start a session');
      return null;
    }
    
    const sessionName = name || `Drive ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const { data, error } = await supabase
      .from('driving_sessions')
      .insert({
        user_id: user.id,
        organization_id: organizationId,
        name: sessionName,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to start session');
      console.error('Session start error:', error);
      return null;
    }
    
    const newSession: DrivingSession = {
      id: data.id,
      status: 'active',
      startedAt: data.started_at,
      totalMiles: 0,
      propertiesTagged: 0,
      photosTaken: 0,
      routeCoordinates: []
    };
    
    setSession(newSession);
    setIsActive(true);
    setIsPaused(false);
    setDuration(0);
    setActiveDuration(0);
    startTracking();
    
    // Start duration timer
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      setActiveDuration(prev => prev + 1);
    }, 1000);
    
    // Start periodic flush (every 30 seconds)
    flushIntervalRef.current = setInterval(() => {
      flushRoutePoints();
    }, 30000);
    
    toast.success('Driving session started!');
    
    return data;
  }, [user, organizationId, startTracking, flushRoutePoints]);

  // Pause session
  const pauseSession = useCallback(async () => {
    if (!session) return;
    
    setIsPaused(true);
    await flushRoutePoints();
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // Keep total duration ticking, but stop active duration
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    
    await supabase
      .from('driving_sessions')
      .update({ status: 'paused' })
      .eq('id', session.id);
    
    setSession(prev => prev ? { ...prev, status: 'paused' } : null);
    toast('Session paused');
  }, [session, flushRoutePoints]);

  // Resume session
  const resumeSession = useCallback(async () => {
    if (!session) return;
    
    setIsPaused(false);
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      setActiveDuration(prev => prev + 1);
    }, 1000);
    
    await supabase
      .from('driving_sessions')
      .update({ status: 'active' })
      .eq('id', session.id);
    
    setSession(prev => prev ? { ...prev, status: 'active' } : null);
    toast.success('Session resumed');
  }, [session]);

  // End session
  const endSession = useCallback(async () => {
    if (!session) return;
    
    await flushRoutePoints();
    stopTracking();
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current);
      flushIntervalRef.current = null;
    }
    
    const { error } = await supabase
      .from('driving_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        total_duration_seconds: duration,
        active_duration_seconds: activeDuration,
        total_miles: session.totalMiles,
        properties_tagged: session.propertiesTagged,
        photos_taken: session.photosTaken
      })
      .eq('id', session.id);
    
    if (!error && user) {
      // Create mileage log entry
      await supabase.from('d4d_mileage_log').insert({
        user_id: user.id,
        organization_id: organizationId,
        session_id: session.id,
        date: new Date().toISOString().split('T')[0],
        description: `Driving for dollars - ${session.propertiesTagged} properties tagged`,
        calculated_miles: session.totalMiles,
        final_miles: session.totalMiles
      });
    }
    
    const finalMiles = session.totalMiles;
    const finalProps = session.propertiesTagged;
    
    setSession(null);
    setIsActive(false);
    setIsPaused(false);
    setDuration(0);
    setActiveDuration(0);
    lastPositionRef.current = null;
    routePointsBufferRef.current = [];
    
    toast.success(`Session complete! ${finalMiles.toFixed(1)} miles driven, ${finalProps} properties tagged.`);
  }, [session, duration, activeDuration, user, organizationId, flushRoutePoints, stopTracking]);

  // Update session stats
  const incrementPropertiesTagged = useCallback(() => {
    setSession(prev => prev ? {
      ...prev,
      propertiesTagged: prev.propertiesTagged + 1
    } : null);
  }, []);

  const incrementPhotosTaken = useCallback(() => {
    setSession(prev => prev ? {
      ...prev,
      photosTaken: prev.photosTaken + 1
    } : null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
    };
  }, []);

  return {
    session,
    isActive,
    isPaused,
    isTracking,
    duration,
    activeDuration,
    currentLocation: { 
      latitude, 
      longitude, 
      speed, 
      heading, 
      accuracy, 
      altitude 
    },
    geoError,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    incrementPropertiesTagged,
    incrementPhotosTaken
  };
}

// Haversine formula for calculating distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
