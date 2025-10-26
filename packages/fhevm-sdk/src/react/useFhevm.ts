/**
 * React Hooks for FHEVM SDK
 * Optional React bindings for the framework-agnostic SDK
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { createFhevmClient, FhevmClientInstance, FhevmClientConfig } from '../client';
import { encryptInput, EncryptionInput, EncryptedInput } from '../encryption';
import { decryptValue, FheType } from '../decryption';
import { createContract, FhevmContract } from '../contract';

/**
 * useFhevm Hook
 * Initialize and manage FHEVM client
 *
 * @example
 * ```tsx
 * function App() {
 *   const { client, isReady, error } = useFhevm({
 *     provider: window.ethereum,
 *     network: 'sepolia'
 *   });
 *
 *   return isReady ? <Dashboard client={client} /> : <Loading />;
 * }
 * ```
 */
export function useFhevm(config: FhevmClientConfig) {
  const [client, setClient] = useState<FhevmClientInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initClient() {
      try {
        const fhevmClient = createFhevmClient(config);
        await fhevmClient.init();

        if (mounted) {
          setClient(fhevmClient);
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      }
    }

    initClient();

    return () => {
      mounted = false;
    };
  }, [config.provider, config.network, config.chainId]);

  return { client, isReady, error };
}

/**
 * useFhevmContract Hook
 * Get contract instance with FHE support
 *
 * @example
 * ```tsx
 * const contract = useFhevmContract({
 *   address: CONTRACT_ADDRESS,
 *   abi: CONTRACT_ABI,
 *   client: fhevmClient
 * });
 * ```
 */
export function useFhevmContract(config: {
  address: string;
  abi: any[];
  client: FhevmClientInstance | null;
  signer?: ethers.Signer;
}) {
  const [contract, setContract] = useState<FhevmContract | null>(null);

  useEffect(() => {
    if (!config.client?.isReady) {
      return;
    }

    const contractInstance = createContract({
      address: config.address,
      abi: config.abi,
      client: config.client,
      signer: config.signer,
    });

    setContract(contractInstance);
  }, [config.client, config.address, config.abi, config.signer]);

  return contract;
}

/**
 * useEncryptedInput Hook
 * Encrypt input values
 *
 * @example
 * ```tsx
 * const { encrypt, encrypted, isEncrypting, error } = useEncryptedInput(client);
 *
 * const handleSubmit = async () => {
 *   const result = await encrypt(contractAddress, {
 *     values: [42, 100],
 *     types: ['uint32', 'uint8']
 *   });
 *   // Use result.handles and result.inputProof
 * };
 * ```
 */
export function useEncryptedInput(client: FhevmClientInstance | null) {
  const [encrypted, setEncrypted] = useState<EncryptedInput | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (contractAddress: string, input: EncryptionInput): Promise<EncryptedInput> => {
      if (!client?.isReady) {
        throw new Error('FHEVM client not ready');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await encryptInput(client, contractAddress, input);
        setEncrypted(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  return { encrypt, encrypted, isEncrypting, error };
}

/**
 * useDecryption Hook
 * Decrypt encrypted values
 *
 * @example
 * ```tsx
 * const { decrypt, decrypted, isDecrypting, error } = useDecryption(client);
 *
 * const handleDecrypt = async () => {
 *   const value = await decrypt(contractAddress, encryptedValue, 'euint32');
 *   console.log('Decrypted:', value);
 * };
 * ```
 */
export function useDecryption(client: FhevmClientInstance | null) {
  const [decrypted, setDecrypted] = useState<number | boolean | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (
      contractAddress: string,
      encryptedValue: string,
      type: FheType,
      requireSignature: boolean = true
    ): Promise<number | boolean> => {
      if (!client?.isReady) {
        throw new Error('FHEVM client not ready');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await decryptValue(client, contractAddress, encryptedValue, type, requireSignature);
        setDecrypted(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client]
  );

  return { decrypt, decrypted, isDecrypting, error };
}

/**
 * useContractCall Hook
 * Call contract method with encrypted inputs
 *
 * @example
 * ```tsx
 * const { call, data, isLoading, error } = useContractCall(contract);
 *
 * const handleSubmit = async () => {
 *   const tx = await call('submitData', [42], ['uint32']);
 *   await tx.wait();
 * };
 * ```
 */
export function useContractCall(contract: FhevmContract | null) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = useCallback(
    async (method: string, values: (number | boolean)[], types: string[]): Promise<any> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await contract.encryptAndCall(method, values, types);
        setData(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return { call, data, isLoading, error };
}
