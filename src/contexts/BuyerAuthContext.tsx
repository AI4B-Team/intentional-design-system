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

export function BuyerAuthProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<CashBuyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBuyerBySession = useCallback(async (sessionToken: string) => {
    try {
      // Check if session is valid
      const { data: session, error: sessionError } = await supabase
        .from('buyer_portal_sessions')
        .select('buyer_id, expires_at')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session) {
        localStorage.removeItem(BUYER_SESSION_KEY);
        return null;
      }

      // Fetch buyer data
      const { data: buyerData, error: buyerError } = await supabase
        .from('cash_buyers')
        .select('*')
        .eq('id', session.buyer_id)
        .single();

      if (buyerError || !buyerData) {
        localStorage.removeItem(BUYER_SESSION_KEY);
        return null;
      }

      // Update last active
      await supabase
        .from('buyer_portal_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('session_token', sessionToken);

      await supabase
        .from('cash_buyers')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', session.buyer_id);

      return buyerData as CashBuyer;
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

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find buyer by email
      const { data: buyerData, error: buyerError } = await supabase
        .from('cash_buyers')
        .select('id, email, first_name')
        .eq('email', email.toLowerCase())
        .single();

      if (buyerError || !buyerData) {
        return { success: false, error: 'No account found with this email. Please register first.' };
      }

      // Generate magic link token
      const magicToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days session
      const magicLinkExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min magic link

      // Create session with magic link
      const { error: sessionError } = await supabase
        .from('buyer_portal_sessions')
        .insert({
          buyer_id: buyerData.id,
          session_token: crypto.randomUUID(),
          expires_at: expiresAt.toISOString(),
          magic_link_token: magicToken,
          magic_link_expires_at: magicLinkExpiresAt.toISOString(),
        });

      if (sessionError) {
        return { success: false, error: 'Failed to create login session' };
      }

      // In production, send email via edge function
      // For now, we'll log the magic link
      const magicLink = `${window.location.origin}/buyer/auth?token=${magicToken}`;
      console.log('Magic link (would be emailed):', magicLink);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  const verifyToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find session by magic link token
      const { data: session, error: sessionError } = await supabase
        .from('buyer_portal_sessions')
        .select('*')
        .eq('magic_link_token', token)
        .gt('magic_link_expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session) {
        return { success: false, error: 'Invalid or expired link. Please request a new one.' };
      }

      // Clear magic link token (one-time use)
      await supabase
        .from('buyer_portal_sessions')
        .update({ 
          magic_link_token: null, 
          magic_link_expires_at: null,
          last_active_at: new Date().toISOString()
        })
        .eq('id', session.id);

      // Store session token
      localStorage.setItem(BUYER_SESSION_KEY, session.session_token);

      // Fetch buyer
      const buyerData = await fetchBuyerBySession(session.session_token);
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
      supabase
        .from('buyer_portal_sessions')
        .delete()
        .eq('session_token', sessionToken)
        .then(() => {});
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
