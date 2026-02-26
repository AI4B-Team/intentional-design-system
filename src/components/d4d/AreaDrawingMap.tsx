import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Pentagon, Trash2, Locate, MousePointer } from 'lucide-react';
import type { LatLngExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AreaDrawingMapProps {
  polygonCoords: LatLngTuple[];
  onPolygonChange: (coords: LatLngTuple[]) => void;
  fillColor?: string;
}

// Calculate polygon area in square miles using Shoelace formula on lat/lng
function calcAreaSqMiles(coords: LatLngTuple[]): number {
  if (coords.length < 3) return 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // earth radius in miles
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[j];
    area += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  area = (Math.abs(area) * R * R) / 2;
  return area;
}

function DrawingHandler({
  isDrawing,
  coords,
  onAddPoint,
  onClose,
}: {
  isDrawing: boolean;
  coords: LatLngTuple[];
  onAddPoint: (latlng: LatLngTuple) => void;
  onClose: () => void;
}) {
  useMapEvents({
    click(e) {
      if (!isDrawing) return;
      // If clicking near first point and have 3+ points, close polygon
      if (coords.length >= 3) {
        const first = coords[0];
        const dist = Math.sqrt(
          Math.pow(e.latlng.lat - first[0], 2) + Math.pow(e.latlng.lng - first[1], 2)
        );
        if (dist < 0.005) {
          onClose();
          return;
        }
      }
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
    dblclick(e) {
      if (!isDrawing) return;
      e.originalEvent.preventDefault();
      if (coords.length >= 3) {
        onClose();
      }
    },
  });
  return null;
}

function FlyToLocation({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function DraggablePolygon({
  coords,
  fillColor,
  onChange,
}: {
  coords: LatLngTuple[];
  fillColor: string;
  onChange: (coords: LatLngTuple[]) => void;
}) {
  const polygonRef = useRef<any>(null);

  useEffect(() => {
    const poly = polygonRef.current;
    if (!poly) return;
    // Enable editing
    if (poly.editing) {
      poly.editing.enable();
      poly.on('edit', () => {
        const latlngs = poly.getLatLngs()[0] as any[];
        onChange(latlngs.map((ll: any) => [ll.lat, ll.lng] as LatLngTuple));
      });
    }
    return () => {
      if (poly?.editing) poly.editing.disable();
    };
  }, [coords.length > 0]);

  if (coords.length < 3) return null;

  return (
    <Polygon
      ref={polygonRef}
      positions={coords as LatLngExpression[]}
      pathOptions={{
        color: fillColor,
        fillColor: fillColor,
        fillOpacity: 0.2,
        weight: 2,
      }}
    />
  );
}

const US_CENTER: LatLngTuple = [39.5, -98.35];

export function AreaDrawingMap({ polygonCoords, onPolygonChange, fillColor = '#3b82f6' }: AreaDrawingMapProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingCoords, setDrawingCoords] = useState<LatLngTuple[]>([]);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(US_CENTER);
  const [mapZoom, setMapZoom] = useState(4);
  const [locating, setLocating] = useState(false);

  // On mount, try GPS
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setMapZoom(12);
      },
      () => {} // Ignore error, keep fallback
    );
  }, []);

  // Fit to existing polygon
  useEffect(() => {
    if (polygonCoords.length >= 3) {
      const lats = polygonCoords.map((c) => c[0]);
      const lngs = polygonCoords.map((c) => c[1]);
      setMapCenter([
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ]);
      setMapZoom(13);
    }
  }, []);

  const handleAddPoint = useCallback((latlng: LatLngTuple) => {
    setDrawingCoords((prev) => [...prev, latlng]);
  }, []);

  const handleClosePolygon = useCallback(() => {
    setIsDrawing(false);
    onPolygonChange(drawingCoords);
    setDrawingCoords([]);
  }, [drawingCoords, onPolygonChange]);

  const handleClear = () => {
    setIsDrawing(false);
    setDrawingCoords([]);
    onPolygonChange([]);
  };

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setMapZoom(14);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingCoords([]);
    onPolygonChange([]);
  };

  const displayCoords = isDrawing ? drawingCoords : polygonCoords;
  const areaSqMiles = calcAreaSqMiles(polygonCoords);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex gap-2">
          <Button
            variant={isDrawing ? 'default' : 'outline'}
            size="sm"
            onClick={isDrawing ? handleClosePolygon : startDrawing}
            disabled={isDrawing && drawingCoords.length < 3}
          >
            {isDrawing ? (
              <>
                <MousePointer className="h-4 w-4 mr-1" />
                Finish ({drawingCoords.length} pts)
              </>
            ) : (
              <>
                <Pentagon className="h-4 w-4 mr-1" />
                Draw Area
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={polygonCoords.length === 0 && drawingCoords.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLocate} disabled={locating}>
            <Locate className="h-4 w-4 mr-1" />
            My Location
          </Button>
        </div>
      </div>

      {/* Drawing hint */}
      {isDrawing && (
        <div className="bg-primary/10 text-primary text-xs text-center py-1.5 border-b">
          Click on the map to add points. Click the first point or double-click to close the polygon.
        </div>
      )}

      {/* Map */}
      <div className="h-[300px] md:h-[400px]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full z-0"
          doubleClickZoom={!isDrawing}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToLocation center={mapCenter} zoom={mapZoom} />
          <DrawingHandler
            isDrawing={isDrawing}
            coords={drawingCoords}
            onAddPoint={handleAddPoint}
            onClose={handleClosePolygon}
          />

          {/* Show in-progress drawing */}
          {isDrawing && drawingCoords.length >= 2 && (
            <Polygon
              positions={drawingCoords as LatLngExpression[]}
              pathOptions={{
                color: fillColor,
                fillColor: fillColor,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '6 4',
              }}
            />
          )}

          {/* Show completed polygon */}
          {!isDrawing && polygonCoords.length >= 3 && (
            <DraggablePolygon
              coords={polygonCoords}
              fillColor={fillColor}
              onChange={onPolygonChange}
            />
          )}
        </MapContainer>
      </div>

      {/* Area stats */}
      {polygonCoords.length >= 3 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-t text-sm">
          <Pentagon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Estimated area:</span>
          <span className="font-medium">
            {areaSqMiles < 0.1 ? areaSqMiles.toFixed(3) : areaSqMiles.toFixed(2)} sq miles
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{polygonCoords.length} vertices</span>
        </div>
      )}
    </div>
  );
}
