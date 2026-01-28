import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  Plus,
  Search,
  Eye,
  Heart,
  Calendar,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Mail,
  CheckCircle,
  Trash2,
  Edit,
  LayoutGrid,
  List,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  FileCheck,
} from 'lucide-react';
import { useDispoDeals, useDispoStats, useUpdateDispoDeal, useDeleteDispoDeal } from '@/hooks/useDispoDeals';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: 'Active', color: 'bg-green-500', icon: '🟢' },
  coming_soon: { label: 'Coming Soon', color: 'bg-amber-500', icon: '🟡' },
  under_contract: { label: 'Under Contract', color: 'bg-blue-500', icon: '🔵' },
  sold: { label: 'Sold', color: 'bg-purple-500', icon: '✅' },
  draft: { label: 'Draft', color: 'bg-muted', icon: '⚪' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: '❌' },
};

export default function DispoDeals() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: deals, isLoading } = useDispoDeals({
    status: statusFilter,
    search,
    sort: sortBy,
  });

  const { data: stats } = useDispoStats();
  const updateDeal = useUpdateDispoDeal();
  const deleteDeal = useDeleteDispoDeal();

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/deals/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updates: Record<string, any> = { status: newStatus };
    if (newStatus === 'active' && !deals?.find(d => d.id === id)?.published_at) {
      updates.published_at = new Date().toISOString();
    }
    if (newStatus === 'under_contract') {
      updates.under_contract_at = new Date().toISOString();
    }
    if (newStatus === 'sold') {
      updates.sold_at = new Date().toISOString();
    }
    updateDeal.mutate({ id, updates });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      deleteDeal.mutate(id);
    }
  };

  return (
    <PageLayout
      title="Deal Marketing"
      headerActions={
        <Button onClick={() => navigate('/dispo/deals/new')} icon={<Plus />}>
          New Deal
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Subtitle */}
        <p className="text-muted-foreground -mt-4">
          Market your wholesale deals to cash buyers
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.activeDeals || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalInterests || 0}</p>
                  <p className="text-xs text-muted-foreground">Interests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <FileCheck className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.underContract || 0}</p>
                  <p className="text-xs text-muted-foreground">Under Contract</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.soldLast30Days || 0}</p>
                  <p className="text-xs text-muted-foreground">Sold (30d)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="coming_soon">Coming Soon</SelectItem>
              <SelectItem value="under_contract">Under Contract</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="views">Most Views</SelectItem>
              <SelectItem value="interests">Most Interest</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Deals Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !deals?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deals yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first deal to start marketing to cash buyers
              </p>
              <Button onClick={() => navigate('/dispo/deals/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onEdit={() => navigate(`/dispo/deals/${deal.id}/edit`)}
                onView={() => navigate(`/dispo/deals/${deal.id}`)}
                onViewPage={() => window.open(`/deals/${deal.slug}`, '_blank')}
                onCopyLink={() => handleCopyLink(deal.slug)}
                onStatusChange={(status) => handleStatusChange(deal.id, status)}
                onDelete={() => handleDelete(deal.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <DealListItem
                key={deal.id}
                deal={deal}
                onEdit={() => navigate(`/dispo/deals/${deal.id}/edit`)}
                onView={() => navigate(`/dispo/deals/${deal.id}`)}
                onViewPage={() => window.open(`/deals/${deal.slug}`, '_blank')}
                onCopyLink={() => handleCopyLink(deal.slug)}
                onStatusChange={(status) => handleStatusChange(deal.id, status)}
                onDelete={() => handleDelete(deal.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

interface DealCardProps {
  deal: any;
  onEdit: () => void;
  onView: () => void;
  onViewPage: () => void;
  onCopyLink: () => void;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
}

function DealCard({ deal, onEdit, onView, onViewPage, onCopyLink, onStatusChange, onDelete }: DealCardProps) {
  const status = statusConfig[deal.status] || statusConfig.draft;
  const primaryPhoto = deal.photos?.find((p: any) => p.is_primary) || deal.photos?.[0];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Photo */}
      <div className="relative aspect-video bg-muted">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.url}
            alt={deal.address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Photo
          </div>
        )}
        <Badge
          className={`absolute top-3 right-3 ${status.color} text-white border-0`}
        >
          {status.icon} {status.label}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Address */}
        <div>
          <h3 
            className="font-semibold text-foreground hover:text-primary cursor-pointer truncate"
            onClick={onView}
          >
            {deal.address}
          </h3>
          <p className="text-sm text-muted-foreground">
            {deal.city}, {deal.state}
          </p>
        </div>

        {/* Specs */}
        <p className="text-sm text-muted-foreground">
          {deal.beds} bed | {deal.baths} bath | {deal.sqft?.toLocaleString()} sqft
        </p>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">💰</span>
            <span className="font-semibold ml-1">${deal.asking_price?.toLocaleString()}</span>
          </div>
          {deal.arv && (
            <div>
              <span className="text-muted-foreground">📊 ARV:</span>
              <span className="font-medium ml-1">${deal.arv.toLocaleString()}</span>
            </div>
          )}
        </div>

        {deal.equity_amount && (
          <div className="text-sm">
            <span className="text-muted-foreground">📈 Equity:</span>
            <span className="font-semibold text-green-600 ml-1">
              ${deal.equity_amount.toLocaleString()} ({deal.equity_percentage?.toFixed(0)}%)
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {deal.view_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {deal.interest_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {deal.created_at ? formatDistanceToNow(new Date(deal.created_at), { addSuffix: true }) : 'N/A'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onViewPage}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email Blast
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {deal.status !== 'under_contract' && deal.status !== 'sold' && (
                <DropdownMenuItem onClick={() => onStatusChange('under_contract')}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Mark Under Contract
                </DropdownMenuItem>
              )}
              {deal.status !== 'sold' && (
                <DropdownMenuItem onClick={() => onStatusChange('sold')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Sold
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function DealListItem({ deal, onEdit, onView, onViewPage, onCopyLink, onStatusChange, onDelete }: DealCardProps) {
  const status = statusConfig[deal.status] || statusConfig.draft;
  const primaryPhoto = deal.photos?.find((p: any) => p.is_primary) || deal.photos?.[0];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Photo */}
          <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {primaryPhoto ? (
              <img
                src={primaryPhoto.url}
                alt={deal.address}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                No Photo
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="font-semibold text-foreground hover:text-primary cursor-pointer truncate"
                onClick={onView}
              >
                {deal.address}
              </h3>
              <Badge className={`${status.color} text-white border-0 text-xs`}>
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {deal.city}, {deal.state} • {deal.beds} bed | {deal.baths} bath | {deal.sqft?.toLocaleString()} sqft
            </p>
          </div>

          {/* Pricing */}
          <div className="hidden md:block text-right">
            <p className="font-semibold">${deal.asking_price?.toLocaleString()}</p>
            {deal.equity_amount && (
              <p className="text-sm text-green-600">
                +${deal.equity_amount.toLocaleString()} equity
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {deal.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {deal.interest_count || 0}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onViewPage}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('under_contract')}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Mark Under Contract
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('sold')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Sold
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
