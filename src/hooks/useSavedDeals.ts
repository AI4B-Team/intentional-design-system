import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "marketplace-saved-deals";

// Simple hook to manage saved deals with localStorage persistence
export function useSavedDeals() {
  const [savedDealIds, setSavedDealIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever savedDealIds changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDealIds));
  }, [savedDealIds]);

  const toggleSave = useCallback((dealId: string) => {
    setSavedDealIds(prev =>
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  }, []);

  const isSaved = useCallback((dealId: string) => {
    return savedDealIds.includes(dealId);
  }, [savedDealIds]);

  return {
    savedDealIds,
    toggleSave,
    isSaved,
    savedCount: savedDealIds.length,
  };
}
