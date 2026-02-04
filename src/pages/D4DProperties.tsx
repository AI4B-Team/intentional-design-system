import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  ChevronLeft,
  MoreVertical,
  RefreshCw,
  Trash2,
  Upload,
  Mail,
  Loader2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { D4DPropertyCard } from '@/components/d4d/d4d-property-card';
import { D4DQuickEditModal } from '@/components/d4d/d4d-quick-edit-modal';
import { useD4DProperties, D4DPropertyFilters, D4DPropertySort } from '@/hooks/useD4DProperties';
import type { Database } from '@/integrations/supabase/types';

type D4DProperty = Database['public']['Tables']['d4d_properties']['Row'];

export default function D4DProperties() {
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState<D4DPropertyFilters>({
    status: 'all',
    dateRange: 'all',
  });
  const [sort, setSort] = useState<D4DPropertySort>({
    field: 'tagged_at',
    direction: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Quick edit modal
  const [editProperty, setEditProperty] = useState<D4DProperty | null>(null);

  // Bulk action states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const {
    properties,
    isLoading,
    updateProperty,
    deleteProperty,
    syncProperty,
    bulkSyncProperties,
    bulkDeleteProperties,
  } = useD4DProperties(
    { ...filters, search: searchQuery },
    sort
  );

  // Stats
  const stats = useMemo(() => {
    return {
      total: properties.length,
      pending: properties.filter((p) => p.sync_status === 'pending' || !p.sync_status).length,
      synced: properties.filter((p) => p.sync_status === 'synced').length,
    };
  }, [properties]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map((p) => p.id)));
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSet = new Set(selectedIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  // Bulk actions
  const handleBulkSync = async () => {
    setBulkActionLoading(true);
    await bulkSyncProperties.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSelectMode(false);
    setBulkActionLoading(false);
  };

  const handleBulkDelete = async () => {
    setBulkActionLoading(true);
    await bulkDeleteProperties.mutateAsync(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSelectMode(false);
    setBulkActionLoading(false);
    setShowDeleteConfirm(false);
  };

  // Quick edit save
  const handleQuickEditSave = async (id: string, updates: Database['public']['Tables']['d4d_properties']['Update']) => {
    await updateProperty.mutateAsync({ id, updates });
    setEditProperty(null);
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
                onClick={() => navigate('/d4d')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Tagged Properties</h1>
                <p className="text-sm text-muted-foreground">
                  {stats.total} properties · {stats.pending} pending
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={selectMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectMode(!selectMode);
                  if (selectMode) setSelectedIds(new Set());
                }}
              >
                {selectMode ? 'Cancel' : 'Select'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filters row */}
          {showFilters && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v as D4DPropertyFilters['status'] })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="synced">Synced</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.dateRange}
                onValueChange={(v) => setFilters({ ...filters, dateRange: v as D4DPropertyFilters['dateRange'] })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.condition || 'all'}
                onValueChange={(v) => setFilters({ ...filters, condition: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="distressed">Distressed</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sort.field}-${sort.direction}`}
                onValueChange={(v) => {
                  const [field, direction] = v.split('-') as [D4DPropertySort['field'], D4DPropertySort['direction']];
                  setSort({ field, direction });
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tagged_at-desc">Newest First</SelectItem>
                  <SelectItem value="tagged_at-asc">Oldest First</SelectItem>
                  <SelectItem value="priority-desc">Priority (High)</SelectItem>
                  <SelectItem value="priority-asc">Priority (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Select all bar */}
          {selectMode && (
            <div className="px-4 pb-3 flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {selectedIds.size === properties.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedIds.size === properties.length ? 'Deselect all' : 'Select all'}
              </button>
              <Badge variant="secondary">{selectedIds.size} selected</Badge>
            </div>
          )}
        </div>

        {/* Property list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-medium mb-1">No properties found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Start a driving session to tag properties'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => (
                <D4DPropertyCard
                  key={property.id}
                  property={property}
                  selected={selectedIds.has(property.id)}
                  onSelect={selectMode ? handleSelect : undefined}
                  onClick={() => {
                    if (selectMode) {
                      handleSelect(property.id, !selectedIds.has(property.id));
                    } else {
                      navigate(`/d4d/properties/${property.id}`);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bulk action bar */}
        {selectMode && selectedIds.size > 0 && (
          <div className="flex-shrink-0 border-t bg-background p-4">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleBulkSync}
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Sync Selected ({selectedIds.size})
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={bulkActionLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick edit modal */}
      <D4DQuickEditModal
        property={editProperty}
        open={!!editProperty}
        onOpenChange={(open) => !open && setEditProperty(null)}
        onSave={handleQuickEditSave}
        saving={updateProperty.isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} properties?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected properties will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkActionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
