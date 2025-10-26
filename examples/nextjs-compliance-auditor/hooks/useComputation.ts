'use client';

import { useState, useCallback } from 'react';
import { FhevmClientInstance } from '@fhevm-sdk/core';

interface ComputationParams {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'max' | 'min' | 'eq' | 'ne' | 'lt' | 'gt';
  operands: string[];
}

interface UseComputationReturn {
  compute: (params: ComputationParams) => Promise<string>;
  result: string | null;
  isComputing: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Custom hook for performing homomorphic computations
 */
export function useComputation(client: FhevmClientInstance | null): UseComputationReturn {
  const [result, setResult] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compute = useCallback(
    async ({ operation, operands }: ComputationParams): Promise<string> => {
      if (!client?.isReady) {
        throw new Error('FHE client not ready');
      }

      if (!operation || !operands || operands.length < 2) {
        throw new Error('Operation and at least two operands are required');
      }

      setIsComputing(true);
      setError(null);

      try {
        // In a real implementation, this would call smart contract methods
        // that perform homomorphic operations on encrypted data
        // For now, return a mock result
        const computationResult = `Result of ${operation} on encrypted operands`;

        setResult(computationResult);
        return computationResult;
      } catch (err: any) {
        const computationError = new Error(err.message || 'Computation failed');
        setError(computationError);
        throw computationError;
      } finally {
        setIsComputing(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsComputing(false);
  }, []);

  return {
    compute,
    result,
    isComputing,
    error,
    reset
  };
}
