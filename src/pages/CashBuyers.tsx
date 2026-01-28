import React, { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Upload,
  Search,
  MoreHorizontal,
  Edit,
  Mail,
  Send,
  CheckCircle,
  Tag,
  Ban,
  Trash2,
  Users,
  Star,
  Loader2,
  XCircle,
  Download,
} from 'lucide-react';
import {
  useCashBuyers,
  useCashBuyerStats,
  useUpdateCashBuyer,
  useDeleteCashBuyer,
  useDeleteCashBuyers,
  CashBuyer,
} from '@/hooks/useCashBuyers';
import { AddBuyerModal, BuyerDetailPanel, ImportBuyersModal } from '@/components/cash-buyers';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<string, { label: string; icon: string; color: string }> = {
  active: { label: 'Active', icon: '🟢', color: 'bg-green-500' },
  inactive: { label: 'Inactive', icon: '⚪', color: 'bg-muted' },
  blocked: { label: 'Blocked', icon: '🔴', color: 'bg-red-500' },
  unsubscribed: { label: 'Unsubscribed', icon: '🟡', color: 'bg-amber-500' },
};

export default function CashBuyers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<CashBuyer | null>(null);
  const [editBuyer, setEditBuyer] = useState<CashBuyer | null>(null);

  const { data: buyers, isLoading } = useCashBuyers({
    status: statusFilter,
    verified: verifiedFilter,
    rating: ratingFilter !== 'all' ? ratingFilter : undefined,
    search,
    sort: sortBy,
  });

  const { data: stats } = useCashBuyerStats();
  const updateBuyer = useUpdateCashBuyer();
  const deleteBuyer = useDeleteCashBuyer();
  const deleteBuyers = useDeleteCashBuyers();

  const handleSelectAll = () => {
    if (selectedBuyers.length === buyers?.length) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(buyers?.map((b) => b.id) || []);
    }
  };

  const handleSelectBuyer = (id: string) => {
    setSelectedBuyers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (buyer: CashBuyer) => {
    setSelectedBuyer(buyer);
    setDetailPanelOpen(true);
  };

  const handleEdit = (buyer: CashBuyer, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditBuyer(buyer);
    setAddModalOpen(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Are you sure you want to delete this buyer?')) {
      await deleteBuyer.mutateAsync(id);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedBuyers.length} buyers?`)) {
      await deleteBuyers.mutateAsync(selectedBuyers);
      setSelectedBuyers([]);
    }
  };

  const handleStatusChange = async (id: string, status: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await updateBuyer.mutateAsync({ id, updates: { status } });
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <PageLayout
      title="Cash Buyers"
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => { setEditBuyer(null); setAddModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Buyer
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Subtitle */}
        <p className="text-muted-foreground -mt-4">Manage your investor buyer list</p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Buyers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.active || 0}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.verified || 0}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.vip || 0}</p>
                  <p className="text-xs text-muted-foreground">VIP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.avgRating?.toFixed(1) || '-'} ⭐</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Verified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="last_active">Last Active</SelectItem>
              <SelectItem value="deals">Deals Purchased</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedBuyers.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">{selectedBuyers.length} selected</span>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-1" />
              Email All
            </Button>
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-1" />
              Add Tags
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !buyers?.length ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No buyers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first cash buyer to start building your list
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => setImportModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button onClick={() => setAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Buyer
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedBuyers.length === buyers.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Markets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyers.map((buyer) => {
                    const status = statusConfig[buyer.status || 'active'];
                    const displayName =
                      buyer.full_name ||
                      `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() ||
                      buyer.email;

                    return (
                      <TableRow
                        key={buyer.id}
                        className="cursor-pointer"
                        onClick={() => handleRowClick(buyer)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedBuyers.includes(buyer.id)}
                            onCheckedChange={() => handleSelectBuyer(buyer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{displayName}</p>
                            <p className="text-sm text-muted-foreground">{buyer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{buyer.company_name || '-'}</TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate">
                            {buyer.markets?.slice(0, 2).join(', ') || '-'}
                            {(buyer.markets?.length || 0) > 2 && (
                              <span className="text-muted-foreground">
                                {' '}+{buyer.markets!.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${status.color} text-white border-0`}
                          >
                            {status.icon} {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {buyer.is_verified ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Yes
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <XCircle className="h-4 w-4" />
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{renderStars(buyer.buyer_rating)}</TableCell>
                        <TableCell>
                          {buyer.last_active_at
                            ? formatDistanceToNow(new Date(buyer.last_active_at), {
                                addSuffix: true,
                              })
                            : '-'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleEdit(buyer, e as any)}>
                                <Edit className="h-4 w-4 mr-2" />
                                View/Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Send Deal
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Verify POF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="h-4 w-4 mr-2" />
                                Add Tags
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {buyer.status === 'blocked' ? (
                                <DropdownMenuItem
                                  onClick={(e) => handleStatusChange(buyer.id, 'active', e as any)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Unblock
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={(e) => handleStatusChange(buyer.id, 'blocked', e as any)}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Block
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => handleDelete(buyer.id, e as any)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AddBuyerModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open);
          if (!open) setEditBuyer(null);
        }}
        editBuyer={editBuyer}
      />

      <ImportBuyersModal open={importModalOpen} onOpenChange={setImportModalOpen} />

      <BuyerDetailPanel
        buyer={selectedBuyer}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
        onEdit={() => {
          setDetailPanelOpen(false);
          if (selectedBuyer) handleEdit(selectedBuyer);
        }}
      />
    </PageLayout>
  );
}
