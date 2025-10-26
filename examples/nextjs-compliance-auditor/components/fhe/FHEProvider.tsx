'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createFhevmClient, FhevmClientInstance } from '@fhevm-sdk/core';

interface FHEContextType {
  client: FhevmClientInstance | null;
  isReady: boolean;
  error: Error | null;
  initClient: (provider: any, network?: string) => Promise<void>;
}

const FHEContext = createContext<FHEContextType | undefined>(undefined);

export function FHEProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<FhevmClientInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initClient = async (provider: any, network: string = 'sepolia') => {
    try {
      setError(null);
      setIsReady(false);

      const fhevmClient = createFhevmClient({
        provider,
        network
      });

      await fhevmClient.init();
      setClient(fhevmClient);
      setIsReady(true);
    } catch (err: any) {
      setError(err);
      console.error('Failed to initialize FHE client:', err);
    }
  };

  return (
    <FHEContext.Provider value={{ client, isReady, error, initClient }}>
      {children}
    </FHEContext.Provider>
  );
}

export function useFHEContext() {
  const context = useContext(FHEContext);
  if (context === undefined) {
    throw new Error('useFHEContext must be used within a FHEProvider');
  }
  return context;
}
