import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, Eye, MessageSquare, Users, ArrowRight, Megaphone } from 'lucide-react';
import { useDispoStats } from '@/hooks/useDispoDeals';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function DispoWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDispoStats();

  // Fetch recent interests
  const { data: recentInterests, isLoading: interestsLoading } = useQuery({
    queryKey: ['dispo-recent-interests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_interests')
        .select('id, guest_name, guest_email, interest_type, created_at, deal:dispo_deals(address)')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch buyer count
  const { data: buyerCount } = useQuery({
    queryKey: ['dispo-buyer-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cash_buyers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const isLoading = statsLoading || interestsLoading;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">Deal Marketing</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dispo/deals')}
          className="text-muted-foreground hover:text-foreground"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Home className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold">{stats?.activeDeals || 0}</p>
                <p className="text-xs text-muted-foreground">Active Deals</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MessageSquare className="h-4 w-4 text-accent" />
                </div>
                <p className="text-xl font-bold">{stats?.totalInterests || 0}</p>
                <p className="text-xs text-muted-foreground">Interests</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-success" />
                </div>
                <p className="text-xl font-bold">{buyerCount || 0}</p>
                <p className="text-xs text-muted-foreground">Buyers</p>
              </div>
            </div>

            {/* Recent Interests */}
            {recentInterests && recentInterests.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Recent Interest:</p>
                <div className="space-y-2">
                  {recentInterests.map((interest: any) => (
                    <div
                      key={interest.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{interest.guest_name || interest.guest_email}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {interest.deal?.address || 'Unknown deal'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(interest.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!recentInterests || recentInterests.length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent interests</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
