import React, { createContext, useContext, useState, useCallback } from "react";
import type { D4DProperty } from "@/components/marketplace-deals/d4d-scan-data";

interface D4DScanState {
  scanActive: boolean;
  scanLoading: boolean;
  scanProperties: D4DProperty[];
  scanPanelExpanded: boolean;
  setScanActive: (v: boolean) => void;
  setScanLoading: (v: boolean) => void;
  setScanProperties: (v: D4DProperty[]) => void;
  setScanPanelExpanded: (v: boolean) => void;
  clearScan: () => void;
}

const D4DScanContext = createContext<D4DScanState | null>(null);

export function D4DScanProvider({ children }: { children: React.ReactNode }) {
  const [scanActive, setScanActive] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanProperties, setScanProperties] = useState<D4DProperty[]>([]);
  const [scanPanelExpanded, setScanPanelExpanded] = useState(false);

  const clearScan = useCallback(() => {
    setScanActive(false);
    setScanLoading(false);
    setScanProperties([]);
    setScanPanelExpanded(false);
  }, []);

  return (
    <D4DScanContext.Provider value={{
      scanActive, scanLoading, scanProperties, scanPanelExpanded,
      setScanActive, setScanLoading, setScanProperties, setScanPanelExpanded,
      clearScan,
    }}>
      {children}
    </D4DScanContext.Provider>
  );
}

export function useD4DScan() {
  const ctx = useContext(D4DScanContext);
  if (!ctx) throw new Error("useD4DScan must be used within D4DScanProvider");
  return ctx;
}
