import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  Navigation,
  Star,
  Upload,
  Mail,
  UserSearch,
  Trash2,
  RefreshCw,
  ExternalLink,
  Play,
  Pause,
  Loader2,
  Check,
  Clock,
  XCircle,
  Camera,
} from 'lucide-react';
import { useD4DProperties } from '@/hooks/useD4DProperties';
import { D4DPhotoCarousel } from '@/components/d4d/d4d-photo-carousel';
import { CameraCapture } from '@/components/d4d/camera-capture';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type D4DProperty = Database['public']['Tables']['d4d_properties']['Row'];

const propertyTypeOptions = [
  { value: 'sfh', label: 'Single Family' },
  { value: 'multi', label: 'Multi-Family' },
  { value: 'condo', label: 'Condo/Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
];

const conditionOptions = [
  { value: 'distressed', label: 'Distressed' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'good', label: 'Good' },
];

const occupancyOptions = [
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'unknown', label: 'Unknown' },
];

const observationOptions = [
  { id: 'has_overgrown_lawn', label: 'Overgrown lawn' },
  { id: 'has_mail_pileup', label: 'Mail pileup' },
  { id: 'has_boarded_windows', label: 'Boarded windows' },
  { id: 'has_roof_damage', label: 'Roof damage' },
  { id: 'has_peeling_paint', label: 'Peeling paint' },
  { id: 'has_code_violations', label: 'Code violations' },
  { id: 'has_broken_windows', label: 'Broken windows' },
  { id: 'has_abandoned_vehicles', label: 'Abandoned vehicles' },
  { id: 'has_for_sale_sign', label: 'For sale sign' },
  { id: 'has_notice_on_door', label: 'Notice on door' },
];

export default function D4DPropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProperty, deleteProperty, syncProperty } = useD4DProperties();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedNotes, setEditedNotes] = useState<string | null>(null);
  const [notesSaving, setNotesSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Fetch property
  const { data: property, isLoading, refetch } = useQuery({
    queryKey: ['d4d-property', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('d4d_properties')
        .select('*, driving_sessions(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as D4DProperty & { driving_sessions: { name: string } | null };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full py-16">
          <p className="text-muted-foreground">Property not found</p>
          <Button variant="link" onClick={() => navigate('/d4d/properties')}>
            Back to properties
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const photos = (property.photos as string[]) || [];
  const address = property.formatted_address || `${property.street_number} ${property.street_name}`;

  const getSyncStatusBadge = () => {
    switch (property.sync_status) {
      case 'synced':
        return (
          <Badge variant="outline" className="text-success border-success/30 bg-success/10">
            <Check className="h-3 w-3 mr-1" />
            Synced
          </Badge>
        );
      case 'skipped':
        return (
          <Badge variant="outline" className="text-muted-foreground border-border">
            <XCircle className="h-3 w-3 mr-1" />
            Skipped
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
            <Clock className="h-3 w-3 mr-1" />
            Pending Sync
          </Badge>
        );
    }
  };

  // Handle field updates
  const handleUpdate = async (updates: Database['public']['Tables']['d4d_properties']['Update']) => {
    await updateProperty.mutateAsync({ id: property.id, updates });
    refetch();
  };

  // Handle observation toggle
  const handleObservationToggle = (obsId: string, checked: boolean) => {
    handleUpdate({ [obsId]: checked });
  };

  // Handle notes save
  const handleNotesSave = async () => {
    if (editedNotes === null) return;
    setNotesSaving(true);
    await handleUpdate({ written_notes: editedNotes });
    setEditedNotes(null);
    setNotesSaving(false);
  };

  // Handle sync
  const handleSync = async () => {
    await syncProperty.mutateAsync(property);
    refetch();
  };

  // Handle delete
  const handleDelete = async () => {
    await deleteProperty.mutateAsync(property.id);
    navigate('/d4d/properties');
  };

  // Handle photo capture - receives blob from camera
  const handlePhotoCapture = async (blob: Blob) => {
    setPhotoUploading(true);
    try {
      const fileName = `${property.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('d4d-photos')
        .upload(`photos/${fileName}`, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('d4d-photos')
        .getPublicUrl(`photos/${fileName}`);

      const updatedPhotos = [...photos, publicUrl];
      await handleUpdate({ photos: updatedPhotos as unknown as Database['public']['Tables']['d4d_properties']['Update']['photos'] });
      toast.success('Photo added!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
      setShowCamera(false);
    }
  };

  // Get directions
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;
    window.open(url, '_blank');
  };

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
                onClick={() => navigate('/d4d/properties')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">{address}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {getSyncStatusBadge()}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-safe">
          {/* Photos */}
          <D4DPhotoCarousel
            photos={photos}
            onAddPhoto={() => setShowCamera(true)}
          />

          {/* Map Card */}
          <Card>
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleGetDirections}
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </Button>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Address</span>
                <p className="text-sm font-medium">{address}</p>
              </div>

              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Tagged</span>
                <p className="text-sm">
                  {property.tagged_at
                    ? format(new Date(property.tagged_at), 'MMM d, yyyy \'at\' h:mm a')
                    : 'Unknown'}
                </p>
              </div>

              {property.driving_sessions?.name && (
                <div className="grid gap-1">
                  <span className="text-sm text-muted-foreground">Session</span>
                  <p className="text-sm">{property.driving_sessions.name}</p>
                </div>
              )}

              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Property Type</span>
                <Select
                  value={property.property_type || ''}
                  onValueChange={(v) => handleUpdate({ property_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Condition</span>
                <Select
                  value={property.condition || ''}
                  onValueChange={(v) => handleUpdate({ condition: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Occupancy</span>
                <Select
                  value={property.occupancy || ''}
                  onValueChange={(v) => handleUpdate({ occupancy: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupancy..." />
                  </SelectTrigger>
                  <SelectContent>
                    {occupancyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <span className="text-sm text-muted-foreground">Priority</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="p-1 touch-target"
                      onClick={() => handleUpdate({ priority: star })}
                    >
                      <Star
                        className={cn(
                          'h-7 w-7 transition-colors',
                          star <= (property.priority || 3)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Distress Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {observationOptions.map((obs) => (
                  <label
                    key={obs.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={!!property[obs.id as keyof D4DProperty]}
                      onCheckedChange={(checked) =>
                        handleObservationToggle(obs.id, checked === true)
                      }
                    />
                    <span className="text-sm">{obs.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Voice note player */}
              {property.voice_note_url && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 ml-0.5" />
                      )}
                    </Button>
                    <div className="flex-1 h-8 bg-muted rounded-full" />
                  </div>
                  {property.voice_note_transcript && (
                    <p className="text-sm text-muted-foreground mt-3 italic">
                      "{property.voice_note_transcript}"
                    </p>
                  )}
                </div>
              )}

              {/* Written notes */}
              <Textarea
                placeholder="Add notes about this property..."
                value={editedNotes ?? property.written_notes ?? ''}
                onChange={(e) => setEditedNotes(e.target.value)}
                onBlur={handleNotesSave}
                rows={4}
              />
              {notesSaving && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            {property.sync_status === 'synced' ? (
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => navigate(`/properties/${property.synced_to_property_id}`)}
              >
                <ExternalLink className="h-4 w-4" />
                View in Properties
              </Button>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={handleSync}
                disabled={syncProperty.isPending}
              >
                {syncProperty.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Sync to Properties
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Send Mail
              </Button>
              <Button variant="outline" className="gap-2">
                <UserSearch className="h-4 w-4" />
                Skip Trace
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera capture */}
      {showCamera && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
          isUploading={photoUploading}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This property will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
