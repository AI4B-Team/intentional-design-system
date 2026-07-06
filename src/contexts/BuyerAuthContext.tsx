import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CashBuyer } from '@/hooks/useCashBuyers';

interface BuyerAuthContextType {
  buyer: CashBuyer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyToken: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshBuyer: () => Promise<void>;
}

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

const BUYER_SESSION_KEY = 'buyer_session_token';

async function callAuth(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke('buyer-portal-auth', {
    body: { action, ...payload },
  });
  if (error) {
    return { success: false, error: error.message || 'Request failed' } as const;
  }
  return data as { success: boolean; error?: string; session_token?: string; buyer?: CashBuyer };
}

export function BuyerAuthProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<CashBuyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBuyerBySession = useCallback(async (sessionToken: string) => {
    try {
      const res = await callAuth('get_session', { session_token: sessionToken });
      if (!res.success || !res.buyer) {
        localStorage.removeItem(BUYER_SESSION_KEY);
        return null;
      }
      return res.buyer;
    } catch (error) {
      console.error('Error fetching buyer session:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const sessionToken = localStorage.getItem(BUYER_SESSION_KEY);
      if (sessionToken) {
        const buyerData = await fetchBuyerBySession(sessionToken);
        setBuyer(buyerData);
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchBuyerBySession]);

  const login = async (email: string) => {
    try {
      const res = await callAuth('login', { email });
      if (!res.success) return { success: false, error: res.error || 'Failed to send login link' };
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  const verifyToken = async (token: string) => {
    try {
      const res = await callAuth('verify_token', { token });
      if (!res.success || !res.session_token) {
        return { success: false, error: res.error || 'Invalid or expired link.' };
      }
      localStorage.setItem(BUYER_SESSION_KEY, res.session_token);
      const buyerData = await fetchBuyerBySession(res.session_token);
      if (buyerData) {
        setBuyer(buyerData);
        return { success: true };
      }
      return { success: false, error: 'Failed to load your account' };
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  const logout = () => {
    const sessionToken = localStorage.getItem(BUYER_SESSION_KEY);
    if (sessionToken) {
      callAuth('logout', { session_token: sessionToken }).catch(() => {});
    }
    localStorage.removeItem(BUYER_SESSION_KEY);
    setBuyer(null);
  };

  const refreshBuyer = async () => {
    const sessionToken = localStorage.getItem(BUYER_SESSION_KEY);
    if (sessionToken) {
      const buyerData = await fetchBuyerBySession(sessionToken);
      setBuyer(buyerData);
    }
  };

  return (
    <BuyerAuthContext.Provider
      value={{
        buyer,
        isLoading,
        isAuthenticated: !!buyer,
        login,
        verifyToken,
        logout,
        refreshBuyer,
      }}
    >
      {children}
    </BuyerAuthContext.Provider>
  );
}

export function useBuyerAuth() {
  const context = useContext(BuyerAuthContext);
  if (context === undefined) {
    throw new Error('useBuyerAuth must be used within a BuyerAuthProvider');
  }
  return context;
}
