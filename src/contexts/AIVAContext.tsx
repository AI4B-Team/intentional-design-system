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
    throw new Error("useAIVA must be used within an AIVAProvider");
  }
  return context;
}
