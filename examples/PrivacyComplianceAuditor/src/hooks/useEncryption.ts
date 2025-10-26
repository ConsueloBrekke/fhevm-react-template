import { useState, useCallback } from 'react';
import { FhevmClientInstance, encryptInput } from '@fhevm-sdk/core';

interface EncryptionParams {
  values: (number | boolean)[];
  types: string[];
}

interface UseEncryptionReturn {
  encrypt: (contractAddress: string, params: EncryptionParams) => Promise<any>;
  encrypted: any | null;
  isEncrypting: boolean;
  error: Error | null;
  reset: () => void;
}

export function useEncryption(client: FhevmClientInstance | null): UseEncryptionReturn {
  const [encrypted, setEncrypted] = useState<any | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (contractAddress: string, { values, types }: EncryptionParams) => {
      if (!client?.isReady) {
        throw new Error('FHE client not ready');
      }

      if (!contractAddress) {
        throw new Error('Contract address is required');
      }

      if (!values || !types || values.length === 0) {
        throw new Error('Values and types are required');
      }

      if (values.length !== types.length) {
        throw new Error('Values and types must have the same length');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await encryptInput(client, contractAddress, {
          values,
          types
        });

        setEncrypted(result);
        return result;
      } catch (err: any) {
        const encryptionError = new Error(err.message || 'Encryption failed');
        setError(encryptionError);
        throw encryptionError;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setEncrypted(null);
    setError(null);
    setIsEncrypting(false);
  }, []);

  return {
    encrypt,
    encrypted,
    isEncrypting,
    error,
    reset
  };
}
