import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Layers, ChevronUp, ChevronDown, MapPin, PenTool, X, TrendingUp, Percent, Zap, RotateCcw, BarChart3, Brain, Home, DollarSign, ScanSearch, Loader2, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MarketplaceDeal } from "@/hooks/useMockDeals";
import { cn } from "@/lib/utils";
import { generateD4DProperties, getDistressColor, type D4DProperty } from "./d4d-scan-data";
import { D4DScanPanel } from "./D4DScanPanel";
import { D4DScanOverlay } from "./D4DScanOverlay";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useD4DScan } from "@/contexts/D4DScanContext";

interface AnalysisResult {
  propertyCount: number;
  avgArv: number;
  avgDiscount: number;
  aiDealDensity: number;
  flipCount: number;
}

interface MarketplaceMapProps {
  deals: MarketplaceDeal[];
  searchLocation?: {
    lat: number;
    lng: number;
    bbox?: [string, string, string, string];
    zoom?: number;
  } | null;
  onSearch?: (query: string) => void;
}

// Grouped heat map options with section headers
const heatMapGroups = [
  {
    label: "Market Signals",
    icon: BarChart3,
    options: [
      "Property Value By County",
      "Property Value By Zip",
      "Flips By County",
      "Flips By Zip",
      "Signal AI By County",
      "Signal AI By Zip",
    ],
  },
];

// Grouped parcel map options with section headers
const parcelMapGroups = [
  {
    label: "AI Scores",
    icon: Brain,
    options: [
      "All Parcels",
      "AI Retail Score",
      "AI Rental Score",
      "AI Wholesale Score",
    ],
  },
  {
    label: "Property Traits",
    icon: Home,
    options: [
      "Cash Buyer",
      "Vacant",
      "Loan to Value",
      "Square Footage",
      "Lot Size",
      "Last Sale Date",
      "Last Sale Price",
    ],
  },
];
export function MarketplaceMap({ deals, searchLocation, onSearch }: MarketplaceMapProps) {
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [overlaysOpen, setOverlaysOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Map filter sliders
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sqftRange, setSqftRange] = useState<[number, number]>([0, 5000]);
  const [pricePerSqftRange, setPricePerSqftRange] = useState<[number, number]>([0, 500]);
  
  // Calculate min/max values from deals
  const filterBounds = useMemo(() => {
    if (deals.length === 0) {
      return {
        minPrice: 0, maxPrice: 1000000,
        minSqft: 0, maxSqft: 5000,
        minPricePerSqft: 0, maxPricePerSqft: 500,
      };
    }
    const prices = deals.map(d => d.price);
    const sqfts = deals.map(d => d.sqft);
    const pricesPerSqft = deals.map(d => Math.round(d.price / d.sqft));
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minSqft: Math.min(...sqfts),
      maxSqft: Math.max(...sqfts),
      minPricePerSqft: Math.min(...pricesPerSqft),
      maxPricePerSqft: Math.max(...pricesPerSqft),
    };
  }, [deals]);
  
  // Filter deals based on slider values
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const pricePerSqft = deal.price / deal.sqft;
      return (
        deal.price >= priceRange[0] && deal.price <= priceRange[1] &&
        deal.sqft >= sqftRange[0] && deal.sqft <= sqftRange[1] &&
        pricePerSqft >= pricePerSqftRange[0] && pricePerSqft <= pricePerSqftRange[1]
      );
    });
  }, [deals, priceRange, sqftRange, pricePerSqftRange]);
  
  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      priceRange[0] > filterBounds.minPrice ||
      priceRange[1] < filterBounds.maxPrice ||
      sqftRange[0] > filterBounds.minSqft ||
      sqftRange[1] < filterBounds.maxSqft ||
      pricePerSqftRange[0] > filterBounds.minPricePerSqft ||
      pricePerSqftRange[1] < filterBounds.maxPricePerSqft
    );
  }, [priceRange, sqftRange, pricePerSqftRange, filterBounds]);
  
  // Reset filters to default
  const resetFilters = useCallback(() => {
    setPriceRange([filterBounds.minPrice, filterBounds.maxPrice]);
    setSqftRange([filterBounds.minSqft, filterBounds.maxSqft]);
    setPricePerSqftRange([filterBounds.minPricePerSqft, filterBounds.maxPricePerSqft]);
  }, [filterBounds]);
  
  // Draw to Analyze states
  const [isDrawing, setIsDrawing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const drawnLayerRef = useRef<any>(null);
  const drawingPointsRef = useRef<[number, number][]>([]);
  
  // Overlay states
  const [heatMapsEnabled, setHeatMapsEnabled] = useState(false);
  const [selectedHeatMap, setSelectedHeatMap] = useState<string | null>(null);
  const [parcelMapsEnabled, setParcelMapsEnabled] = useState(false);
  const [selectedParcelMap, setSelectedParcelMap] = useState<string>("All Parcels");
  const [showLegend, setShowLegend] = useState(false);
  const [showLocationOutline, setShowLocationOutline] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  
  // D4D Scan states — persisted in context so results survive tab switches
  const { scanActive, setScanActive, scanLoading, setScanLoading, scanProperties, setScanProperties, scanPanelExpanded, setScanPanelExpanded, clearScan } = useD4DScan();
  const scanMarkersRef = useRef<any[]>([]);

  const loadedRef = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Check if a point is inside a polygon using ray casting algorithm
  const isPointInPolygon = useCallback((point: [number, number], polygon: [number, number][]) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }, []);

  // Analyze deals within the drawn area
  const analyzeArea = useCallback((polygon: [number, number][]) => {
    const dealsInArea = deals.filter(deal => 
      isPointInPolygon([deal.lat, deal.lng], polygon)
    );
    
    if (dealsInArea.length === 0) {
      setAnalysisResult({
        propertyCount: 0,
        avgArv: 0,
        avgDiscount: 0,
        aiDealDensity: 0,
        flipCount: 0,
      });
      return;
    }
    
    const avgArv = dealsInArea.reduce((sum, d) => sum + d.arv, 0) / dealsInArea.length;
    const avgDiscount = dealsInArea.reduce((sum, d) => sum + (100 - d.arvPercent), 0) / dealsInArea.length;
    
    // Mock AI deal density (properties per sq mile estimate)
    const aiDealDensity = Math.min(10, dealsInArea.length * 0.8 + Math.random() * 2);
    
    // Mock flip count based on tags
    const flipCount = dealsInArea.filter(d => 
      d.tags.some(t => t.toLowerCase().includes('flip') || t.toLowerCase().includes('fixer'))
    ).length || Math.floor(dealsInArea.length * 0.3);
    
    setAnalysisResult({
      propertyCount: dealsInArea.length,
      avgArv: Math.round(avgArv),
      avgDiscount: Math.round(avgDiscount * 10) / 10,
      aiDealDensity: Math.round(aiDealDensity * 10) / 10,
      flipCount,
    });
  }, [deals, isPointInPolygon]);

  // Clear drawn area
  const clearDrawing = useCallback(() => {
    if (drawnLayerRef.current && mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.removeLayer(drawnLayerRef.current);
      drawnLayerRef.current = null;
    }
    drawingPointsRef.current = [];
    setAnalysisResult(null);
    setIsDrawing(false);
  }, []);

  // Handle draw mode toggle
  const toggleDrawMode = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
    } else {
      clearDrawing();
      setIsDrawing(true);
      drawingPointsRef.current = [];
    }
  }, [isDrawing, clearDrawing]);

  const defaultCenter: [number, number] = [27.9944, -81.7603];

  useEffect(() => {
    if (loadedRef.current || !mapContainerRef.current) return;
    loadedRef.current = true;

    const initMap = async () => {
      try {
        // Import leaflet CSS
        await import("leaflet/dist/leaflet.css");
        
        // Import leaflet
        const L = (await import("leaflet")).default;

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create map instance
        if (mapContainerRef.current && !mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(defaultCenter, 7);
          L.control.zoom({ position: 'bottomright' }).addTo(map);
          mapInstanceRef.current = { map, L };

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to load map:", error);
        setHasError(true);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filteredDeals change
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return;
    
    const { map, L } = mapInstanceRef.current;
    
    // Remove existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];
    
    // Add markers for filtered deals
    filteredDeals.forEach((deal) => {
      const formattedPrice = deal.price >= 1000000 
        ? `${(deal.price / 1000000).toFixed(1)}M` 
        : `${Math.round(deal.price / 1000)}K`;

      const priceIcon = L.divIcon({
        className: "custom-price-marker",
        html: `<div class="price-marker">${formattedPrice}</div>`,
        iconSize: [60, 28],
        iconAnchor: [30, 28],
      });

      const marker = L.marker([deal.lat, deal.lng], { icon: priceIcon }).addTo(map);
      
      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <img src="${deal.imageUrl}" alt="${deal.address}" class="w-full h-24 object-cover rounded-md mb-2" />
          <p class="font-semibold text-sm">${deal.address}</p>
          <p class="text-xs text-gray-500">${deal.city}, ${deal.state} ${deal.zip}</p>
          <p class="text-lg font-bold text-emerald-600 mt-1">$${deal.price.toLocaleString()}</p>
          <p class="text-xs text-gray-500">${deal.beds} bd | ${deal.baths} ba | ${deal.sqft.toLocaleString()} sqft</p>
        </div>
      `);
      
      markersRef.current.push(marker);
    });
  }, [filteredDeals, isReady]);

  // Fly map to searchLocation when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady || !searchLocation) return;
    const { map } = mapInstanceRef.current;

    if (searchLocation.bbox) {
      const [south, north, west, east] = searchLocation.bbox.map(parseFloat);
      try {
        map.fitBounds([[south, west], [north, east]], { 
          animate: true, 
          duration: 0.8,
          maxZoom: 14,
          padding: [40, 40]
        });
      } catch {
        map.flyTo([searchLocation.lat, searchLocation.lng], searchLocation.zoom || 11, {
          animate: true,
          duration: 0.8
        });
      }
    } else {
      map.flyTo([searchLocation.lat, searchLocation.lng], searchLocation.zoom || 13, {
        animate: true,
        duration: 0.8
      });
    }
  }, [searchLocation, isReady]);

  // D4D Scan handler
  const handleScan = useCallback(() => {
    if (scanActive) {
      setScanActive(false);
      setScanProperties([]);
      if (mapInstanceRef.current) {
        scanMarkersRef.current.forEach(m => mapInstanceRef.current.map.removeLayer(m));
        scanMarkersRef.current = [];
      }
      return;
    }
    setScanLoading(true);
  }, [scanActive]);

  const handleScanComplete = useCallback(() => {
    try {
      const center = mapInstanceRef.current?.map?.getCenter?.();
      const lat = center?.lat ?? 27.9944;
      const lng = center?.lng ?? -81.7603;
      const properties = generateD4DProperties(lat, lng, 200);
      setScanProperties(properties);
      setScanActive(true);
      setScanLoading(false);
    } catch (err) {
      console.error("[D4D] Error generating properties:", err);
      // Fallback: generate with default seed to ensure results always show
      try {
        const fallback = generateD4DProperties(27.9506, -82.4572, 50, 1);
        setScanProperties(fallback);
        setScanActive(true);
      } catch (_) { /* noop */ }
      setScanLoading(false);
    }
  }, []);

  // Render scan markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return;
    const { map, L } = mapInstanceRef.current;
    scanMarkersRef.current.forEach(m => map.removeLayer(m));
    scanMarkersRef.current = [];
    if (!scanActive || scanProperties.length === 0) return;

    scanProperties.forEach(prop => {
      const color = getDistressColor(prop.distressScore);
      const isHigh = prop.distressScore >= 70;
      const size = isHigh ? 16 : prop.distressScore >= 45 ? 12 : 8;
      const pulseClass = isHigh ? "d4d-pulse" : "";
      const icon = L.divIcon({
        className: "d4d-marker",
        html: `<div class="${pulseClass}" style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);opacity:${prop.distressScore >= 45 ? 0.95 : 0.6};"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([prop.lat, prop.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:240px;padding:0;">
          <img src="${prop.streetViewUrl}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;" />
          <div style="padding:8px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;background:${color}22;color:${color};font-weight:800;font-size:13px;">${prop.distressScore}</span>
              <div>
                <div style="font-weight:700;font-size:13px;">${prop.address}</div>
                <div style="font-size:11px;opacity:0.6;">${prop.city}, ${prop.state} ${prop.zip}</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin:6px 0;">
              <div style="text-align:center;background:#f3f4f6;border-radius:6px;padding:4px;">
                <div style="font-size:10px;opacity:0.6;">Value</div>
                <div style="font-weight:700;font-size:12px;">$${(prop.estimatedValue / 1000).toFixed(0)}K</div>
              </div>
              <div style="text-align:center;background:#f3f4f6;border-radius:6px;padding:4px;">
                <div style="font-size:10px;opacity:0.6;">ARV</div>
                <div style="font-weight:700;font-size:12px;">$${(prop.arvEstimate / 1000).toFixed(0)}K</div>
              </div>
              <div style="text-align:center;background:#ecfdf5;border-radius:6px;padding:4px;">
                <div style="font-size:10px;color:#047857;">Spread</div>
                <div style="font-weight:700;font-size:12px;color:#065f46;">$${(prop.wholesaleSpread / 1000).toFixed(0)}K</div>
              </div>
            </div>
            <div style="font-size:11px;opacity:0.7;">${prop.beds}bd / ${prop.baths}ba • ${prop.sqft.toLocaleString()} sqft</div>
            <div style="font-size:11px;margin-top:2px;opacity:0.7;">👤 ${prop.ownerName}</div>
            <div style="font-size:11px;margin-top:4px;display:flex;flex-wrap:wrap;gap:3px;">
              ${prop.vacant ? '<span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:4px;font-size:10px;">Vacant</span>' : ''}
              ${prop.preForeclosure ? '<span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:4px;font-size:10px;">Pre-FC</span>' : ''}
              ${prop.taxLien ? '<span style="background:#ffedd5;color:#9a3412;padding:1px 6px;border-radius:4px;font-size:10px;">Tax Lien</span>' : ''}
              ${prop.probate ? '<span style="background:#ede9fe;color:#5b21b6;padding:1px 6px;border-radius:4px;font-size:10px;">Probate</span>' : ''}
              ${prop.highEquity ? '<span style="background:#dcfce7;color:#166534;padding:1px 6px;border-radius:4px;font-size:10px;">' + prop.estimatedEquityPct + '% Equity</span>' : ''}
              ${prop.phoneAvailable ? '<span style="background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:4px;font-size:10px;">📞 Phone</span>' : ''}
            </div>
          </div>
        </div>
      `, { maxWidth: 280 });
      scanMarkersRef.current.push(marker);
    });
  }, [scanActive, scanProperties, isReady]);

  const handleFocusScanProperty = useCallback((prop: D4DProperty) => {
    if (mapInstanceRef.current?.map) {
      mapInstanceRef.current.map.setView([prop.lat, prop.lng], 16, { animate: true });
    }
  }, []);

  // Update tile layer when map type changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const { map, L } = mapInstanceRef.current;
    
    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer based on mapType
    const tileUrl = mapType === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }, [mapType]);

  // Handle drawing mode
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const { map, L } = mapInstanceRef.current;
    
    if (isDrawing) {
      map.getContainer().style.cursor = 'crosshair';
      
      const handleClick = (e: any) => {
        const { lat, lng } = e.latlng;
        drawingPointsRef.current.push([lat, lng]);
        
        // Update the visual polygon
        if (drawnLayerRef.current) {
          map.removeLayer(drawnLayerRef.current);
        }
        
        if (drawingPointsRef.current.length >= 2) {
          drawnLayerRef.current = L.polygon(drawingPointsRef.current, {
            color: '#3b82f6',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            dashArray: '5, 5',
          }).addTo(map);
        }
      };
      
      const handleDoubleClick = (e: any) => {
        e.originalEvent.preventDefault();
        if (drawingPointsRef.current.length >= 3) {
          // Finalize the polygon
          if (drawnLayerRef.current) {
            map.removeLayer(drawnLayerRef.current);
          }
          drawnLayerRef.current = L.polygon(drawingPointsRef.current, {
            color: '#3b82f6',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
          }).addTo(map);
          
          setIsDrawing(false);
          analyzeArea(drawingPointsRef.current);
        }
      };
      
      map.on('click', handleClick);
      map.on('dblclick', handleDoubleClick);
      map.doubleClickZoom.disable();
      
      return () => {
        map.off('click', handleClick);
        map.off('dblclick', handleDoubleClick);
        map.doubleClickZoom.enable();
        map.getContainer().style.cursor = '';
      };
    } else {
      map.getContainer().style.cursor = '';
      map.doubleClickZoom.enable();
    }
  }, [isDrawing, analyzeArea]);

  if (hasError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <MapPin className="h-10 w-10" />
          <p className="text-sm">Failed to load map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
    <div className="relative flex-1 z-0">
      {/* Map Type Toggle */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex">
          <button
            onClick={() => setMapType("map")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mapType === "map"
                ? "bg-white text-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType("satellite")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-l ${
              mapType === "satellite"
                ? "bg-white text-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Right side controls: Scan + Draw + Intel */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {/* Scan Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={scanActive ? "default" : "outline"}
                className={cn(
                  "shadow-md gap-2",
                  scanActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-white"
                )}
                onClick={handleScan}
                disabled={scanLoading}
              >
                {scanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                {scanLoading ? "Scanning..." : scanActive ? "Clear Scan" : "Scan"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">AI Driving for Dollars — scan visible area</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* Draw Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isDrawing ? "default" : "outline"}
                className={cn(
                  "shadow-md gap-2",
                  isDrawing ? "bg-primary text-primary-foreground" : "bg-white"
                )}
                onClick={toggleDrawMode}
              >
                <PenTool className="h-4 w-4" />
                {isDrawing ? "Drawing..." : "Draw"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-white text-foreground z-[200]"><p className="text-xs">Draw a polygon to filter properties</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Popover open={overlaysOpen} onOpenChange={setOverlaysOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-white shadow-md gap-2">
              <Layers className="h-4 w-4" />
              Intel
              {overlaysOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-white p-0 shadow-lg" align="end">
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Heat Maps Section */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Heat Maps</span>
                  <Checkbox 
                    checked={heatMapsEnabled}
                    onCheckedChange={(checked) => {
                      setHeatMapsEnabled(!!checked);
                      if (!checked) setSelectedHeatMap(null);
                    }}
                  />
                </div>
                {heatMapGroups.map((group, groupIdx) => (
                  <div key={group.label} className={cn(groupIdx > 0 && "mt-3 pt-3 border-t border-border/50")}>
                    <span className="text-xs font-medium text-muted-foreground/80 mb-1.5 flex items-center gap-1.5">
                      <group.icon className="h-3.5 w-3.5" />
                      {group.label}
                    </span>
                    <div className="space-y-1.5 pl-2">
                      {group.options.map((option) => (
                        <div key={option} className="flex items-center justify-between">
                          <Label className="text-sm text-muted-foreground cursor-pointer">{option}</Label>
                          <input
                            type="radio"
                            name="heatMap"
                            checked={selectedHeatMap === option}
                            onChange={() => {
                              setSelectedHeatMap(option);
                              setHeatMapsEnabled(true);
                            }}
                            className="h-4 w-4 text-primary border-muted-foreground"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Parcel Maps Section */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Parcel Maps</span>
                  <Checkbox 
                    checked={parcelMapsEnabled}
                    onCheckedChange={(checked) => setParcelMapsEnabled(!!checked)}
                  />
                </div>
                {parcelMapGroups.map((group, groupIdx) => (
                  <div key={group.label} className={cn(groupIdx > 0 && "mt-3 pt-3 border-t border-border/50")}>
                    <span className="text-xs font-medium text-muted-foreground/80 mb-1.5 flex items-center gap-1.5">
                      <group.icon className="h-3.5 w-3.5" />
                      {group.label}
                    </span>
                    <div className="space-y-1.5 pl-2">
                      {group.options.map((option) => (
                        <div key={option} className="flex items-center justify-between">
                          <Label 
                            className={cn(
                              "text-sm cursor-pointer",
                              selectedParcelMap === option ? "text-primary font-medium" : "text-muted-foreground"
                            )}
                          >
                            {option}
                          </Label>
                          <input
                            type="radio"
                            name="parcelMap"
                            checked={selectedParcelMap === option}
                            onChange={() => {
                              setSelectedParcelMap(option);
                              setParcelMapsEnabled(true);
                            }}
                            className="h-4 w-4 text-primary border-muted-foreground accent-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Options */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Legend</Label>
                  <Checkbox 
                    checked={showLegend}
                    onCheckedChange={(checked) => setShowLegend(!!checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Location outline</Label>
                  <Checkbox 
                    checked={showLocationOutline}
                    onCheckedChange={(checked) => setShowLocationOutline(!!checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Clusters</Label>
                  <Checkbox 
                    checked={showClusters}
                    onCheckedChange={(checked) => setShowClusters(!!checked)}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Loading state overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-[5]">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <MapPin className="h-10 w-10 animate-pulse" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Draw to Analyze Results Panel */}
      {analysisResult && (
        <Card className="absolute bottom-20 left-3 z-10 w-80 p-0 shadow-lg overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Area Analysis</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                onClick={clearDrawing}
                title="Clear & Redraw"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setAnalysisResult(null)}
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          {analysisResult.propertyCount === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No properties found in this area
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="text-center pb-2 border-b">
                <span className="text-2xl font-bold text-primary">{analysisResult.propertyCount}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  {analysisResult.propertyCount === 1 ? 'Property' : 'Properties'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-xs whitespace-nowrap">Avg ARV</span>
                  </div>
                  <span className="text-sm font-semibold">
                    ${(analysisResult.avgArv / 1000).toFixed(0)}K
                  </span>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Percent className="h-3.5 w-3.5" />
                    <span className="text-xs whitespace-nowrap">Avg Discount</span>
                  </div>
                  <span className="text-sm font-semibold text-success">
                    {analysisResult.avgDiscount}%
                  </span>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-xs whitespace-nowrap">AI Deal Density</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {analysisResult.aiDealDensity}/mi²
                  </span>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="text-xs whitespace-nowrap">Flip Count</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {analysisResult.flipCount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Drawing Instructions */}
      {isDrawing && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Click to add points • Double-click to complete
        </div>
      )}

      {/* D4D Scan Overlay */}
      {scanLoading && (
        <D4DScanOverlay
          onComplete={handleScanComplete}
          onStop={() => setScanLoading(false)}
        />
      )}


      {/* Custom CSS for price markers and zoom controls */}
      <style>{`
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-pane {
          z-index: 0 !important;
        }
        .leaflet-tile-pane {
          z-index: 0 !important;
        }
        .leaflet-overlay-pane {
          z-index: 1 !important;
        }
        .leaflet-shadow-pane {
          z-index: 2 !important;
        }
        .leaflet-marker-pane {
          z-index: 3 !important;
        }
        .leaflet-tooltip-pane {
          z-index: 4 !important;
        }
        .leaflet-popup-pane {
          z-index: 5 !important;
        }
        .leaflet-control {
          z-index: 1000 !important;
        }
        .leaflet-control-container,
        .leaflet-bottom,
        .leaflet-right,
        .leaflet-bottom.leaflet-right {
          z-index: 1000 !important;
          pointer-events: auto !important;
        }
        /* Zoom controls styling */
        .leaflet-bottom.leaflet-right .leaflet-control-zoom {
          margin: 0 10px 10px 0 !important;
          border: 1px solid hsl(var(--border)) !important;
          box-shadow: 0 2px 6px hsl(var(--foreground) / 0.25) !important;
          overflow: hidden;
        }
        .leaflet-bottom.leaflet-right .leaflet-control-zoom a {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }
        .price-marker {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          text-align: center;
        }
        .price-marker::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #16a34a;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .d4d-pulse {
          animation: d4d-pulse-anim 2s ease-in-out infinite;
        }
        @keyframes d4d-pulse-anim {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>

    {/* D4D Scan Panel */}
    {scanActive && (
      <D4DScanPanel
        properties={scanProperties}
        onClose={() => {
          setScanActive(false);
          setScanProperties([]);
          setScanPanelExpanded(false);
          if (mapInstanceRef.current) {
            scanMarkersRef.current.forEach(m => mapInstanceRef.current.map.removeLayer(m));
            scanMarkersRef.current = [];
          }
        }}
        onFocusProperty={handleFocusScanProperty}
        totalScanned={scanProperties.length}
        isExpanded={scanPanelExpanded}
        onToggleExpand={() => setScanPanelExpanded(!scanPanelExpanded)}
        onRescan={handleScan}
      />
    )}
    </div>
  );
}
