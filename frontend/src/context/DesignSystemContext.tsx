'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Eye, Layers, Sparkles } from 'lucide-react';

interface DesignSystemContextType {
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  toggleLoading: () => void;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const toggleLoading = () => setIsLoading((prev) => !prev);

  return (
    <DesignSystemContext.Provider value={{ isLoading, setIsLoading, toggleLoading }}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}
