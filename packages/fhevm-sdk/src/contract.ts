/**
 * FHEVM Contract Utilities
 * Provides helpers for interacting with FHE-enabled smart contracts
 */

import { ethers } from 'ethers';
import { FhevmClientInstance } from './client';
import { encryptInput, EncryptionInput } from './encryption';

export interface ContractConfig {
  address: string;
  abi: any[];
  client: FhevmClientInstance;
  signer?: ethers.Signer;
}

export interface FhevmContract extends ethers.Contract {
  encryptAndCall: (method: string, values: (number | boolean)[], types: string[]) => Promise<any>;
  client: FhevmClientInstance;
}

/**
 * Create contract instance with FHE support
 *
 * @example
 * ```typescript
 * const contract = createContract({
 *   address: contractAddress,
 *   abi: contractABI,
 *   client: fhevmClient
 * });
 *
 * // Use FHE helpers
 * await contract.encryptAndCall('submitData', [42, 100], ['uint32', 'uint8']);
 * ```
 */
export function createContract(config: ContractConfig): FhevmContract {
  const { address, abi, client, signer } = config;

  // Create base contract
  const provider = client.provider;
  const contractSigner = signer || (provider as any).getSigner?.();
  const baseContract = new ethers.Contract(address, abi, contractSigner || provider);

  // Add FHE helper methods
  const fhevmContract = baseContract as FhevmContract;
  fhevmContract.client = client;

  /**
   * Encrypt values and call contract method
   */
  fhevmContract.encryptAndCall = async function (
    method: string,
    values: (number | boolean)[],
    types: string[]
  ): Promise<any> {
    if (!client.isReady) {
      throw new Error('FHEVM client not initialized');
    }

    // Encrypt input
    const encrypted = await encryptInput(client, address, { values, types });

    // Call contract method with encrypted data
    const contractMethod = this[method];
    if (!contractMethod) {
      throw new Error(`Method ${method} not found on contract`);
    }

    return contractMethod(...encrypted.handles, encrypted.inputProof);
  };

  return fhevmContract;
}

/**
 * Get contract instance (simple wrapper)
 *
 * @example
 * ```typescript
 * const contract = getContract(address, abi, client);
 * ```
 */
export function getContract(
  address: string,
  abi: any[],
  client: FhevmClientInstance,
  signer?: ethers.Signer
): FhevmContract {
  return createContract({ address, abi, client, signer });
}

/**
 * Call contract method with encrypted inputs
 *
 * @example
 * ```typescript
 * const tx = await callWithEncryption(
 *   contract,
 *   'submitData',
 *   [42, 100],
 *   ['uint32', 'uint8']
 * );
 * ```
 */
export async function callWithEncryption(
  contract: ethers.Contract,
  method: string,
  values: (number | boolean)[],
  types: string[],
  client: FhevmClientInstance
): Promise<any> {
  const fhevmContract = contract as FhevmContract;
  fhevmContract.client = client;

  return fhevmContract.encryptAndCall(method, values, types);
}

/**
 * Wait for transaction with better error handling
 *
 * @example
 * ```typescript
 * const receipt = await waitForTransaction(tx);
 * ```
 */
export async function waitForTransaction(
  tx: ethers.ContractTransactionResponse,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt> {
  try {
    const receipt = await tx.wait(confirmations);
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }
    return receipt;
  } catch (error) {
    throw new Error(`Transaction failed: ${(error as Error).message}`);
  }
}

/**
 * Get contract events
 *
 * @example
 * ```typescript
 * const events = await getContractEvents(contract, 'DataRegistered', fromBlock, toBlock);
 * ```
 */
export async function getContractEvents(
  contract: ethers.Contract,
  eventName: string,
  fromBlock: number = 0,
  toBlock: number | string = 'latest'
): Promise<any[]> {
  try {
    const filter = contract.filters[eventName]?.();
    if (!filter) {
      throw new Error(`Event ${eventName} not found on contract`);
    }

    const events = await contract.queryFilter(filter, fromBlock, toBlock);
    return events;
  } catch (error) {
    throw new Error(`Failed to get events: ${(error as Error).message}`);
  }
}

/**
 * Listen to contract events
 *
 * @example
 * ```typescript
 * listenToEvent(contract, 'DataRegistered', (event) => {
 *   console.log('Data registered:', event.args);
 * });
 * ```
 */
export function listenToEvent(
  contract: ethers.Contract,
  eventName: string,
  callback: (event: any) => void
): () => void {
  const listener = (...args: any[]) => {
    callback(args[args.length - 1]); // Last arg is the event object
  };

  contract.on(eventName, listener);

  // Return cleanup function
  return () => {
    contract.off(eventName, listener);
  };
}
