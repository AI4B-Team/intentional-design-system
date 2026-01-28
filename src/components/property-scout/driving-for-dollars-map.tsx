import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, 
  Navigation, 
  Camera, 
  Save, 
  Trash2,
  Play,
  Pause,
  Flag,
  Home,
  Sparkles,
  Route,
  MapPinned,
  X,
  Check,
  Locate
} from 'lucide-react';
import { D4DProperty, PropertyLead } from '@/types/property-scout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DrivingForDollarsMapProps {
  scoutId: string;
  onSaveProperty: (property: Partial<PropertyLead>) => void;
  enableAI?: boolean;
}

export function DrivingForDollarsMap({
  scoutId,
  onSaveProperty,
  enableAI = false
}: DrivingForDollarsMapProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<{ lat: number; lng: number }[]>([]);
  const [properties, setProperties] = useState<D4DProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<D4DProperty | null>(null);
  const [autoCapture, setAutoCapture] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const watchIdRef = useRef<number | null>(null);

  // Calculate distance driven in miles
  const distanceDriven = useCallback(() => {
    if (route.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < route.length; i++) {
      const R = 3959; // Earth's radius in miles
      const dLat = (route[i].lat - route[i - 1].lat) * Math.PI / 180;
      const dLon = (route[i].lng - route[i - 1].lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(route[i - 1].lat * Math.PI / 180) * Math.cos(route[i].lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total;
  }, [route]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(newLocation);
        setRoute(prev => [...prev, newLocation]);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
    setIsTracking(true);
    toast.success('Tracking started');
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    toast.info('Tracking stopped');
  }, []);

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Get current location once
  const getCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success('Location updated');
      },
      (error) => {
        toast.error('Unable to get location');
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Capture property at current location
  const captureProperty = useCallback(async () => {
    if (!currentLocation) {
      toast.error('No location available');
      return;
    }

    const newProperty: D4DProperty = {
      id: `d4d_${Date.now()}`,
      coordinates: currentLocation,
      address: `${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`,
      photos: [],
      notes: '',
      timestamp: new Date().toISOString()
    };

    // AI analysis simulation
    if (enableAI) {
      newProperty.aiAnalysis = {
        condition: ['excellent', 'good', 'fair', 'poor', 'distressed'][Math.floor(Math.random() * 5)],
        estimatedValue: Math.floor(Math.random() * 200000) + 150000,
        insights: [
          'Property appears to be single-family home',
          'Visible deferred maintenance on exterior',
          'Comparable sales in area suggest good potential'
        ]
      };
    }

    setProperties(prev => [...prev, newProperty]);
    setSelectedProperty(newProperty);
    toast.success('Property captured!');
  }, [currentLocation, enableAI]);

  // Photo capture
  const capturePhoto = useCallback(() => {
    if (!selectedProperty) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoUrl = event.target?.result as string;
          setProperties(prev => prev.map(p =>
            p.id === selectedProperty.id
              ? { ...p, photos: [...p.photos, photoUrl] }
              : p
          ));
          setSelectedProperty(prev => prev ? { ...prev, photos: [...prev.photos, photoUrl] } : null);
          toast.success('Photo added');
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }, [selectedProperty]);

  // Delete property
  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }
    toast.success('Property removed');
  }, [selectedProperty]);

  // Save notes
  const saveNotes = useCallback((id: string) => {
    setProperties(prev => prev.map(p =>
      p.id === id ? { ...p, notes: notesDraft } : p
    ));
    if (selectedProperty?.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, notes: notesDraft } : null);
    }
    setEditingNotes(null);
    setNotesDraft('');
    toast.success('Notes saved');
  }, [notesDraft, selectedProperty]);

  // Convert to lead
  const convertToLead = useCallback((property: D4DProperty) => {
    const lead: Partial<PropertyLead> = {
      scoutId,
      address: {
        street: property.address,
        city: '',
        state: '',
        zipCode: '',
        coordinates: property.coordinates
      },
      source: 'driving_for_dollars',
      drivingForDollars: {
        capturedAt: property.timestamp,
        deviceLocation: property.coordinates
      },
      scoutNotes: property.notes,
      photos: property.photos.map((url, i) => ({
        url,
        caption: `D4D Photo ${i + 1}`,
        uploadedAt: new Date().toISOString()
      }))
    };

    if (property.aiAnalysis) {
      lead.condition = property.aiAnalysis.condition as PropertyLead['condition'];
      lead.estimatedValue = property.aiAnalysis.estimatedValue;
      lead.aiAnalysis = {
        dealScore: 75,
        insights: property.aiAnalysis.insights,
        estimatedRepairCost: 30000,
        marketAnalysis: 'AI-generated market analysis',
        analyzedAt: new Date().toISOString()
      };
    }

    onSaveProperty(lead);
    toast.success('Lead saved successfully!');
  }, [scoutId, onSaveProperty]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Control Bar */}
      <div className="flex-shrink-0 border-b bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={toggleTracking}
              variant={isTracking ? 'destructive' : 'default'}
              className="gap-2"
            >
              {isTracking ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Tracking
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={getCurrentLocation}
              title="Get current location"
            >
              <Locate className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Switch
                id="auto-capture"
                checked={autoCapture}
                onCheckedChange={setAutoCapture}
              />
              <label htmlFor="auto-capture" className="text-sm text-muted-foreground cursor-pointer">
                Auto-capture
              </label>
            </div>

            {enableAI && (
              <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent border-0">
                <Sparkles className="h-3 w-3" />
                AI Active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPinned className="h-4 w-4 text-success" />
              {properties.length} Properties
            </span>
            <span className="flex items-center gap-1.5">
              <Route className="h-4 w-4 text-accent" />
              {distanceDriven().toFixed(1)} mi
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            {/* Map Placeholder */}
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Navigation className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Map View</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isTracking ? 'Tracking your location...' : 'Start tracking to see your route'}
              </p>
              {currentLocation && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
            <Button
              size="lg"
              onClick={captureProperty}
              disabled={!currentLocation}
              className="gap-2 shadow-lg"
            >
              <Flag className="h-5 w-5" />
              Mark Property
            </Button>
            {selectedProperty && (
              <Button
                size="lg"
                variant="secondary"
                onClick={capturePhoto}
                className="gap-2 shadow-lg"
              >
                <Camera className="h-5 w-5" />
                Take Photo
              </Button>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Captured Properties</h3>
            </div>
          </div>

          <ScrollArea className="h-[400px] lg:h-[calc(100vh-280px)]">
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="font-medium text-foreground">No properties captured yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start tracking and mark properties
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {properties.map(property => (
                  <Card
                    key={property.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedProperty?.id === property.id && "ring-2 ring-accent"
                    )}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {property.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(property.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProperty(property.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Photos */}
                      {property.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {property.photos.slice(0, 3).map((photo, i) => (
                            <img
                              key={i}
                              src={photo}
                              alt={`Property photo ${i + 1}`}
                              className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                            />
                          ))}
                          {property.photos.length > 3 && (
                            <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-muted-foreground">
                                +{property.photos.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {editingNotes === property.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Add notes..."
                            className="min-h-[80px]"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveNotes(property.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNotes(null);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="text-sm text-muted-foreground cursor-text hover:bg-muted/50 rounded p-2 -m-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNotes(property.id);
                            setNotesDraft(property.notes);
                          }}
                        >
                          {property.notes || 'Click to add notes...'}
                        </div>
                      )}

                      {/* AI Analysis */}
                      {property.aiAnalysis && (
                        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
                          <div className="flex items-center gap-1.5 text-accent text-sm font-medium">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI Analysis
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Est. Value:</span>
                              <span className="ml-1 font-medium">
                                ${property.aiAnalysis.estimatedValue.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Condition:</span>
                              <Badge variant="outline" className="ml-1 capitalize">
                                {property.aiAnalysis.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Save as Lead Button */}
                      <Button
                        className="w-full bg-success hover:bg-success/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          convertToLead(property);
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save as Lead
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="flex-shrink-0 border-t bg-card px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Session: {new Date().toLocaleTimeString()}</span>
            <span>Properties: {properties.length}</span>
            <span>Photos: {properties.reduce((acc, p) => acc + p.photos.length, 0)}</span>
          </div>
          {currentLocation && (
            <Badge variant="outline" className="gap-1.5 text-success border-success/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              GPS Active
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
