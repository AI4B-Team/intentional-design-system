import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ChevronLeft,
  MapPin,
  Layers,
  TrendingUp,
  Navigation,
  Lightbulb,
  ChevronUp,
  BarChart3,
  Route,
} from 'lucide-react';
import { useHeatMapData, DateRange } from '@/hooks/useHeatMapData';
import { D4DHeatMapLegend } from '@/components/d4d/d4d-heat-map-legend';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function D4DHeatMap() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const { data, isLoading, stats, areaCoverage, suggestions } = useHeatMapData(dateRange);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-background z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/d4d')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Coverage Heat Map</h1>
                <p className="text-sm text-muted-foreground">
                  {stats?.totalProperties || 0} properties tagged
                </p>
              </div>
            </div>

            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <>
              {/* Map placeholder with heat visualization */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                {/* Simulated heat spots */}
                {showHeatMap && data?.heatPoints && data.heatPoints.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Create a gradient overlay simulating heat */}
                    <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-red-500/30 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-orange-500/25 blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-yellow-500/20 blur-3xl" />
                  </div>
                )}

                {/* Property markers */}
                {showProperties && data?.properties && (
                  <div className="absolute inset-0 pointer-events-none">
                    {data.properties.slice(0, 20).map((prop, i) => (
                      <div
                        key={prop.latitude + '-' + i}
                        className="absolute w-2 h-2 rounded-full bg-primary border border-white"
                        style={{
                          left: `${20 + (i * 3) % 60}%`,
                          top: `${15 + (i * 5) % 70}%`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Center info */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6 rounded-xl bg-slate-900/80 backdrop-blur">
                    <Navigation className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <p className="font-medium text-white mb-1">
                      {stats?.coverageAreaSqMi?.toFixed(1) || '0.0'} sq mi covered
                    </p>
                    <p className="text-sm text-slate-400">
                      {data?.heatPoints?.length || 0} data points
                    </p>
                  </div>
                </div>
              </div>

              {/* Map controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Card className="p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">Heat Map</span>
                    <Switch checked={showHeatMap} onCheckedChange={setShowHeatMap} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">Properties</span>
                    <Switch checked={showProperties} onCheckedChange={setShowProperties} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">Areas</span>
                    <Switch checked={showAreas} onCheckedChange={setShowAreas} />
                  </div>
                </Card>
              </div>

              {/* Legend */}
              <D4DHeatMapLegend className="absolute bottom-20 left-4" />
            </>
          )}
        </div>

        {/* Insights Bottom Sheet */}
        <Sheet open={insightsOpen} onOpenChange={setInsightsOpen}>
          <SheetTrigger asChild>
            <button className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-background shadow-lg border">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">Coverage Insights</span>
              <ChevronUp className={cn('h-4 w-4 transition-transform', insightsOpen && 'rotate-180')} />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Coverage Insights
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-full mt-4">
              <div className="space-y-6 pb-8">
                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Route className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">
                        {stats?.coverageAreaSqMi?.toFixed(1) || '0.0'}
                      </p>
                      <p className="text-xs text-muted-foreground">sq mi covered</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold">{stats?.mostDrivenArea || 'None'}</p>
                      <p className="text-xs text-muted-foreground">Most driven</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Coverage by area table */}
                {areaCoverage.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Coverage by Area</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {areaCoverage.map((area) => (
                          <div key={area.name} className="flex items-center justify-between p-3">
                            <div>
                              <p className="font-medium text-sm">{area.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {area.lastDriven
                                  ? formatDistanceToNow(new Date(area.lastDriven), { addSuffix: true })
                                  : 'Never driven'}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p>{area.drives} drives</p>
                              <p className="text-muted-foreground">
                                {area.miles.toFixed(1)} mi · {area.properties} props
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-warning" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {suggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-muted/50 text-sm flex items-start gap-2"
                        >
                          <span className="text-warning">•</span>
                          {suggestion}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
