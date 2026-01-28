import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  Plus,
  MapPin,
} from 'lucide-react';
import { D4DAreaCard } from '@/components/d4d/d4d-area-card';
import { useD4DAreas } from '@/hooks/useD4DAreas';

export default function D4DAreas() {
  const navigate = useNavigate();
  const { areas, isLoading, toggleFavorite } = useD4DAreas();

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-background">
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
                <h1 className="text-lg font-semibold">Saved Areas</h1>
                <p className="text-sm text-muted-foreground">
                  {areas.length} areas saved
                </p>
              </div>
            </div>

            <Button size="sm" onClick={() => navigate('/d4d/areas/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Area
            </Button>
          </div>
        </div>

        {/* Areas List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-medium mb-1">No saved areas yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create areas to track coverage in specific neighborhoods
              </p>
              <Button onClick={() => navigate('/d4d/areas/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Area
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {areas.map((area) => (
                <D4DAreaCard
                  key={area.id}
                  area={area}
                  onStartDriving={() => navigate('/d4d')}
                  onViewDetails={() => navigate(`/d4d/areas/${area.id}`)}
                  onToggleFavorite={() =>
                    toggleFavorite.mutate({ id: area.id, isFavorite: !area.is_favorite })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
