import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  MapPin,
  DollarSign,
  Home,
  Building2,
  Bed,
  Bath,
  Square,
  TrendingUp,
} from 'lucide-react';
import { BuyBox } from '@/types/property-scout';

interface BuyBoxCardProps {
  buyBox: BuyBox & { matchCount?: number };
  onEdit: (buyBox: BuyBox) => void;
  onDuplicate: (buyBox: BuyBox) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

export const BuyBoxCard: React.FC<BuyBoxCardProps> = ({
  buyBox,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  viewMode = 'grid',
}) => {
  const formatPrice = (price?: number) => {
    if (!price) return null;
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${(price / 1000).toFixed(0)}k`;
  };

  const getPropertyTypeLabel = (types?: string[]) => {
    if (!types || types.length === 0) return null;
    if (types.includes('multi_family')) return 'Multi-Family';
    if (types.includes('single_family')) return 'Single Family';
    if (types.length === 1) return types[0].replace('_', ' ');
    return `${types.length} Types`;
  };

  const getPropertyTypeIcon = (types?: string[]) => {
    if (!types || types.length === 0) return <Home className="h-3.5 w-3.5" />;
    if (types.includes('multi_family')) return <Building2 className="h-3.5 w-3.5" />;
    return <Home className="h-3.5 w-3.5" />;
  };

  if (viewMode === 'list') {
    return (
      <Card
        className={`relative transition-all hover:shadow-md ${
          !buyBox.isActive ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Icon */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
              buyBox.isActive ? 'bg-primary/10' : 'bg-muted'
            }`}
          >
            <Target
              className={`h-5 w-5 ${buyBox.isActive ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{buyBox.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {buyBox.description || 'No description'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-5">
            {buyBox.criteria.states && buyBox.criteria.states.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{buyBox.criteria.states.slice(0, 2).join(', ')}</span>
              </div>
            )}
            {(buyBox.criteria.minPrice || buyBox.criteria.maxPrice) && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>
                  {formatPrice(buyBox.criteria.minPrice) || '$0'} -{' '}
                  {formatPrice(buyBox.criteria.maxPrice) || 'Any'}
                </span>
              </div>
            )}
            {buyBox.criteria.minBedrooms && (
              <div className="flex items-center gap-1.5 text-sm">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{buyBox.criteria.minBedrooms}+</span>
                <span className="text-muted-foreground">Beds</span>
              </div>
            )}
            {buyBox.criteria.minBathrooms && (
              <div className="flex items-center gap-1.5 text-sm">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{buyBox.criteria.minBathrooms}+</span>
                <span className="text-muted-foreground">Baths</span>
              </div>
            )}
            {buyBox.criteria.minSquareFeet && (
              <div className="flex items-center gap-1.5 text-sm">
                <Square className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{(buyBox.criteria.minSquareFeet / 1000).toFixed(1)}k+</span>
                <span className="text-muted-foreground">SqFt</span>
              </div>
            )}
          </div>

          {/* Status & Matches */}
          <div className="flex items-center gap-4">
            <Badge variant={buyBox.isActive ? 'default' : 'secondary'}>
              {buyBox.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <div className="text-sm">
              <span className="text-muted-foreground">Matches: </span>
              <span className="font-semibold text-primary">{buyBox.matchCount || 0}</span>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white z-[100]">
              <DropdownMenuItem onClick={() => onEdit(buyBox)} className="gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(buyBox)} className="gap-2 cursor-pointer">
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(buyBox.id)} className="gap-2 cursor-pointer">
                {buyBox.isActive ? (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(buyBox.id)}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  // Grid Card View
  return (
    <Card
      className={`relative transition-all hover:shadow-md hover:-translate-y-0.5 ${
        !buyBox.isActive ? 'opacity-60' : ''
      }`}
    >
      {/* Header Row - Title top left, Menu top right */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
              buyBox.isActive ? 'bg-primary/10' : 'bg-muted'
            }`}
          >
            <Target
              className={`h-5 w-5 ${buyBox.isActive ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="font-semibold text-base truncate leading-tight">{buyBox.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {buyBox.description || 'No description'}
            </p>
          </div>
        </div>
        
        {/* Menu - Aligned to top right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-1 -mr-1">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white z-[100]">
            <DropdownMenuItem onClick={() => onEdit(buyBox)} className="gap-2 cursor-pointer">
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(buyBox)} className="gap-2 cursor-pointer">
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(buyBox.id)} className="gap-2 cursor-pointer">
              {buyBox.isActive ? (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(buyBox.id)}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Location & Property Type Row */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {buyBox.criteria.states && buyBox.criteria.states.length > 0 && (
            <Badge variant="outline" className="text-xs gap-1.5 bg-background font-normal">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              {buyBox.criteria.states.slice(0, 2).join(', ')}
              {buyBox.criteria.states.length > 2 && ` +${buyBox.criteria.states.length - 2}`}
            </Badge>
          )}
          {buyBox.criteria.propertyTypes && buyBox.criteria.propertyTypes.length > 0 && (
            <Badge variant="outline" className="text-xs gap-1.5 bg-background font-normal">
              {getPropertyTypeIcon(buyBox.criteria.propertyTypes)}
              <span className="capitalize">{getPropertyTypeLabel(buyBox.criteria.propertyTypes)}</span>
            </Badge>
          )}
          {buyBox.criteria.minEquity && (
            <Badge variant="outline" className="text-xs gap-1.5 bg-background font-normal">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              {buyBox.criteria.minEquity}%+ Equity
            </Badge>
          )}
        </div>
      </div>

      {/* Price Range Section */}
      {(buyBox.criteria.minPrice || buyBox.criteria.maxPrice) && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Price Range:</span>
            <span className="font-medium">
              {formatPrice(buyBox.criteria.minPrice) || '$0'} - {formatPrice(buyBox.criteria.maxPrice) || 'Any'}
            </span>
          </div>
        </div>
      )}

      {/* Beds / Baths / SqFt Row - Like Marketplace Listing */}
      {(buyBox.criteria.minBedrooms || buyBox.criteria.minBathrooms || buyBox.criteria.minSquareFeet) && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-4 text-sm">
            {buyBox.criteria.minBedrooms && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{buyBox.criteria.minBedrooms}+</span>
                <span className="text-muted-foreground">Beds</span>
              </div>
            )}
            {buyBox.criteria.minBathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{buyBox.criteria.minBathrooms}+</span>
                <span className="text-muted-foreground">Baths</span>
              </div>
            )}
            {buyBox.criteria.minSquareFeet && (
              <div className="flex items-center gap-1.5">
                <Square className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{(buyBox.criteria.minSquareFeet / 1000).toFixed(1)}k+</span>
                <span className="text-muted-foreground">SqFt</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between pt-3 border-t">
          <Badge variant={buyBox.isActive ? 'default' : 'secondary'} className="text-xs">
            {buyBox.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Matches:</span>
            <span className="font-semibold text-primary">{buyBox.matchCount || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
