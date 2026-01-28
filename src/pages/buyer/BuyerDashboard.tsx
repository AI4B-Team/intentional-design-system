import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Heart,
  MessageSquare,
  ShoppingCart,
  User,
  LogOut,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Building,
  Bed,
  Bath,
  Square,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { buyer, logout } = useBuyerAuth();
  const [filter, setFilter] = useState('all');

  // Fetch active deals
  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['buyer-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispo_deals')
        .select('*')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch buyer's interests
  const { data: interests } = useQuery({
    queryKey: ['buyer-interests', buyer?.id],
    queryFn: async () => {
      if (!buyer?.id) return [];
      const { data, error } = await supabase
        .from('deal_interests')
        .select('*, deal:dispo_deals(*)')
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!buyer?.id,
  });

  // Saved deals (using local storage for now)
  const [savedDealIds, setSavedDealIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`saved_deals_${buyer?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSaveDeal = (dealId: string) => {
    setSavedDealIds((prev) => {
      const updated = prev.includes(dealId)
        ? prev.filter((id) => id !== dealId)
        : [...prev, dealId];
      localStorage.setItem(`saved_deals_${buyer?.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Check if deal matches buyer criteria
  const isDealMatch = (deal: any) => {
    if (!buyer) return false;

    const priceMatch =
      (!buyer.min_price || deal.asking_price >= buyer.min_price) &&
      (!buyer.max_price || deal.asking_price <= buyer.max_price);

    const marketMatch =
      !buyer.markets?.length ||
      buyer.markets.some(
        (m) =>
          deal.city?.toLowerCase().includes(m.toLowerCase()) ||
          deal.state?.toLowerCase().includes(m.toLowerCase())
      );

    return priceMatch && marketMatch;
  };

  // Filter deals
  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    
    switch (filter) {
      case 'matches':
        return deals.filter(isDealMatch);
      case 'saved':
        return deals.filter((d) => savedDealIds.includes(d.id));
      default:
        return deals;
    }
  }, [deals, filter, savedDealIds, buyer]);

  const savedDeals = deals?.filter((d) => savedDealIds.includes(d.id)) || [];

  const handleLogout = () => {
    logout();
    navigate('/buyer/login');
  };

  const displayName = buyer?.first_name || buyer?.full_name?.split(' ')[0] || 'Buyer';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Welcome, {displayName}</p>
              <p className="text-sm text-muted-foreground">{buyer?.company_name || buyer?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/buyer/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Home className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{deals?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{savedDealIds.length}</p>
                  <p className="text-xs text-muted-foreground">Saved Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{interests?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Your Interests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{buyer?.deals_purchased || 0}</p>
                  <p className="text-xs text-muted-foreground">Purchases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Deals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Deals</h2>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deals</SelectItem>
                <SelectItem value="matches">My Matches</SelectItem>
                <SelectItem value="saved">Saved Deals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dealsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDeals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No deals available</h3>
                <p className="text-muted-foreground">
                  {filter === 'saved'
                    ? "You haven't saved any deals yet"
                    : filter === 'matches'
                    ? 'No deals match your criteria right now'
                    : 'Check back soon for new opportunities'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDeals.map((deal) => {
                const isMatch = isDealMatch(deal);
                const isSaved = savedDealIds.includes(deal.id);
                const equity = deal.arv && deal.asking_price
                  ? deal.arv - deal.asking_price - (deal.repair_estimate || 0)
                  : null;
                const photos = deal.photos as string[] | null;

                return (
                  <Card key={deal.id} className="overflow-hidden group">
                    <div className="relative aspect-video bg-muted">
                      {photos?.[0] ? (
                        <img
                          src={photos[0]}
                          alt={deal.address}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {isMatch && (
                        <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                          MATCH!
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                        onClick={() => toggleSaveDeal(deal.id)}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 truncate">{deal.address}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {deal.city}, {deal.state}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {deal.beds && (
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {deal.beds}
                          </span>
                        )}
                        {deal.baths && (
                          <span className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {deal.baths}
                          </span>
                        )}
                        {deal.sqft && (
                          <span className="flex items-center gap-1">
                            <Square className="h-4 w-4" />
                            {deal.sqft.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-bold text-lg">
                            ${deal.asking_price?.toLocaleString()}
                          </span>
                        </div>
                        {equity && equity > 0 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">${equity.toLocaleString()} Equity</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => navigate(`/deals/${deal.slug}`)}
                        >
                          View Deal
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Saved Deals */}
        {savedDeals.length > 0 && filter !== 'saved' && (
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Your Saved Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedDeals.slice(0, 3).map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{deal.address}</p>
                        <p className="text-sm text-muted-foreground">
                          ${deal.asking_price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/deals/${deal.slug}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveDeal(deal.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Your Interests */}
        {interests && interests.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Deals You're Interested In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {interests.map((interest: any) => (
                    <div
                      key={interest.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {interest.deal?.address || 'Unknown Deal'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {interest.interest_level} • {new Date(interest.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={interest.status === 'pending' ? 'secondary' : 'default'}>
                        {interest.status || 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
