import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  MapPin, 
  Camera, 
  Route, 
  History, 
  Map as MapIcon, 
  Bookmark,
  Lightbulb,
  AlertCircle,
  Play,
  Flame,
  DollarSign
} from "lucide-react";
import { MileageWidget } from "./mileage-widget";
import { cn } from "@/lib/utils";

interface D4DStartScreenProps {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onStartSession: () => void;
  geoError: string | null;
}

const tips = [
  "Look for overgrown lawns and piled-up mail",
  "Use voice notes for hands-free recording",
  "Tag properties quickly - add details later",
  "Check for boarded windows and code violation signs",
  "Note 'For Sale By Owner' signs - often motivated sellers",
  "Drive slowly through older neighborhoods"
];

export function D4DStartScreen({
  sessionName,
  onSessionNameChange,
  onStartSession,
  geoError
}: D4DStartScreenProps) {
  const navigate = useNavigate();
  const [currentTip, setCurrentTip] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  // Auto-rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setIsStarting(true);
    await onStartSession();
    setIsStarting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Map Background (simulated) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-repeat" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <Route className="h-5 w-5" />
        </Button>
        <Badge variant="outline" className="gap-1">
          <Car className="h-3 w-3" />
          D4D
        </Badge>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Car className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-success flex items-center justify-center">
            <MapPin className="h-4 w-4 text-success-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Driving for Dollars
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          Find distressed properties while driving neighborhoods
        </p>

        {/* Mileage Widget */}
        <div className="w-full max-w-sm mb-6">
          <MileageWidget />
        </div>

        {/* Session Name Input */}
        <div className="w-full max-w-sm mb-4">
          <Input
            placeholder="Session name (optional)"
            value={sessionName}
            onChange={(e) => onSessionNameChange(e.target.value)}
            className="text-center"
          />
        </div>

        {/* GPS Error */}
        {geoError && (
          <div className="w-full max-w-sm mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{geoError}</span>
          </div>
        )}

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full max-w-sm h-14 text-lg gap-2"
          onClick={handleStart}
          disabled={isStarting}
        >
          {isStarting ? (
            <>
              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start Driving
            </>
          )}
        </Button>

        {/* Quick Links */}
        <div className="flex gap-5 mt-6">
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/d4d/properties')}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Properties</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/d4d/history')}
          >
            <History className="h-5 w-5" />
            <span className="text-xs">History</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/d4d/mileage')}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs">Mileage</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/d4d/heatmap')}
          >
            <Flame className="h-5 w-5" />
            <span className="text-xs">Heat Map</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/d4d/areas')}
          >
            <Bookmark className="h-5 w-5" />
            <span className="text-xs">Areas</span>
          </button>
        </div>
      </main>

      {/* Tips Carousel */}
      <footer className="relative z-10 p-4 pb-safe">
        <Card className="bg-card/80 backdrop-blur">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Tip</p>
              <p className="text-sm truncate">{tips[currentTip]}</p>
            </div>
            <div className="flex gap-1">
              {tips.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentTip ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
