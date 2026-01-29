import React, { createContext, useContext, useState, useCallback } from "react";

interface AIVAContextType {
  isOpen: boolean;
  openAIVA: () => void;
  closeAIVA: () => void;
  toggleAIVA: () => void;
}

const AIVAContext = createContext<AIVAContextType | undefined>(undefined);

export function AIVAProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAIVA = useCallback(() => setIsOpen(true), []);
  const closeAIVA = useCallback(() => setIsOpen(false), []);
  const toggleAIVA = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <AIVAContext.Provider value={{ isOpen, openAIVA, closeAIVA, toggleAIVA }}>
      {children}
    </AIVAContext.Provider>
  );
}

export function useAIVA() {
  const context = useContext(AIVAContext);
  if (context === undefined) {
    // Fail-safe: avoid crashing the entire app shell if a component
    // accidentally renders outside the provider.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("useAIVA used outside AIVAProvider; returning no-op context");
    }
    return {
      isOpen: false,
      openAIVA: () => {},
      closeAIVA: () => {},
      toggleAIVA: () => {},
    };
  }
  return context;
}
