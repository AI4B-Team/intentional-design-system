import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  MapPin,
  Trash2,
  Locate,
  Loader2,
  Square,
  Circle,
  Pentagon,
} from 'lucide-react';
import { useD4DAreas } from '@/hooks/useD4DAreas';
import { cn } from '@/lib/utils';

const colorOptions = [
  { value: 'hsl(220, 90%, 56%)', label: 'Blue' },
  { value: 'hsl(0, 84%, 60%)', label: 'Red' },
  { value: 'hsl(142, 76%, 36%)', label: 'Green' },
  { value: 'hsl(25, 95%, 53%)', label: 'Orange' },
  { value: 'hsl(280, 87%, 60%)', label: 'Purple' },
  { value: 'hsl(50, 98%, 50%)', label: 'Yellow' },
];

type DrawingTool = 'polygon' | 'circle' | 'rectangle';

export default function D4DAreaEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { useArea, createArea, updateArea } = useD4DAreas();
  const { data: existingArea, isLoading } = useArea(isNew ? undefined : id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('polygon');
  const [saving, setSaving] = useState(false);

  // Load existing area data
  useEffect(() => {
    if (existingArea) {
      setName(existingArea.name);
      setDescription(existingArea.description || '');
      setColor(existingArea.color || colorOptions[0].value);
    }
  }, [existingArea]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (isNew) {
        await createArea.mutateAsync({
          name: name.trim(),
          description: description.trim() || null,
          color,
          // In a real implementation, we'd include the boundary_coordinates here
        });
      } else if (id) {
        await updateArea.mutateAsync({
          id,
          updates: {
            name: name.trim(),
            description: description.trim() || null,
            color,
          },
        });
      }
      navigate('/d4d/areas');
    } catch {
      // Error handled in hook
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

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
                onClick={() => navigate('/d4d/areas')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">
                {isNew ? 'Create New Area' : 'Edit Area'}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-safe">
          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Name</label>
            <Input
              placeholder="e.g., Oak Hills, Downtown East"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description (optional)</label>
            <Textarea
              placeholder="Notes about this area..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Map with drawing tools */}
          <div>
            <label className="text-sm font-medium mb-2 block">Area Boundary</label>
            <Card>
              <CardContent className="p-0">
                {/* Drawing toolbar */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex gap-2">
                    <Button
                      variant={drawingTool === 'polygon' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDrawingTool('polygon')}
                    >
                      <Pentagon className="h-4 w-4 mr-1" />
                      Polygon
                    </Button>
                    <Button
                      variant={drawingTool === 'circle' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDrawingTool('circle')}
                    >
                      <Circle className="h-4 w-4 mr-1" />
                      Circle
                    </Button>
                    <Button
                      variant={drawingTool === 'rectangle' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDrawingTool('rectangle')}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Rectangle
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Locate className="h-4 w-4 mr-1" />
                      My Location
                    </Button>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="h-64 bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Tap to draw {drawingTool} boundary
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Map integration coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColor(option.value)}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all',
                    color === option.value && 'ring-2 ring-offset-2 ring-primary'
                  )}
                  style={{ backgroundColor: option.value }}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isNew ? 'Save Area' : 'Update Area'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
