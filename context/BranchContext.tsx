"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSearchParams } from "next/navigation";

interface BranchContextType {
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Sync with URL on mount and when searchParams change
  useEffect(() => {
    const branchIdFromUrl = searchParams?.get("branchId");
    if (branchIdFromUrl) {
      setSelectedBranchId(branchIdFromUrl);
    } else {
      setSelectedBranchId(null);
    }
  }, [searchParams]);

  return (
    <BranchContext.Provider value={{ selectedBranchId, setSelectedBranchId }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within BranchProvider");
  }
  return context;
}
