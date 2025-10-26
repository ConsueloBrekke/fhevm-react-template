'use client';

import { useState, useEffect } from 'react';
import { createFhevmClient, FhevmClientInstance } from '@fhevm-sdk/core';

interface UseFHEConfig {
  provider: any;
  network?: string;
  autoInit?: boolean;
}

interface UseFHEReturn {
  client: FhevmClientInstance | null;
  isReady: boolean;
  isInitializing: boolean;
  error: Error | null;
  init: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing FHE client initialization and state
 */
export function useFHE({
  provider,
  network = 'sepolia',
  autoInit = true
}: UseFHEConfig): UseFHEReturn {
  const [client, setClient] = useState<FhevmClientInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const init = async () => {
    if (!provider) {
      setError(new Error('Provider is required'));
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
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
    } finally {
      setIsInitializing(false);
    }
  };

  const reset = () => {
    setClient(null);
    setIsReady(false);
    setError(null);
  };

  useEffect(() => {
    if (autoInit && provider && !client && !isInitializing) {
      init();
    }
  }, [provider, autoInit]);

  return {
    client,
    isReady,
    isInitializing,
    error,
    init,
    reset
  };
}
