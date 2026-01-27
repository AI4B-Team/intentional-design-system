import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface CreditTransaction {
  id: string;
  type: "purchase" | "usage" | "refund" | "bonus";
  amount: number;
  balance_after: number;
  description: string | null;
  service: string | null;
  created_at: string;
}

export function useCredits() {
  const { user } = useAuth();

  const {
    data: creditsData,
    isLoading: loading,
    refetch: refreshBalance,
  } = useQuery({
    queryKey: ["user-credits", user?.id],
    queryFn: async () => {
      if (!user) return { balance: 0, lifetimePurchased: 0, lifetimeUsed: 0 };

      const { data, error } = await supabase
        .from("user_credits")
        .select("balance, lifetime_purchased, lifetime_used")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      return {
        balance: data?.balance ?? 0,
        lifetimePurchased: data?.lifetime_purchased ?? 0,
        lifetimeUsed: data?.lifetime_used ?? 0,
      };
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    refetch: refreshTransactions,
  } = useQuery({
    queryKey: ["credit-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as CreditTransaction[];
    },
    enabled: !!user,
  });

  return {
    balance: creditsData?.balance ?? 0,
    lifetimePurchased: creditsData?.lifetimePurchased ?? 0,
    lifetimeUsed: creditsData?.lifetimeUsed ?? 0,
    loading,
    refreshBalance,
    transactions,
    transactionsLoading,
    refreshTransactions,
  };
}
