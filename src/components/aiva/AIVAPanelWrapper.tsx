import React from "react";
import { AIVAPanel } from "./AIVAPanel";
import { useAIVA } from "@/contexts/AIVAContext";

export function AIVAPanelWrapper() {
  const { isOpen, closeAIVA } = useAIVA();
  
  return <AIVAPanel open={isOpen} onClose={closeAIVA} />;
}
