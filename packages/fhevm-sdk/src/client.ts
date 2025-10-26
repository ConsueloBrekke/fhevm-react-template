/**
 * FHEVM Client - Core SDK Client
 * Manages FHE instance initialization and connection to FHEVM network
 */

import { ethers } from 'ethers';
import { createInstance, FhevmInstance } from 'fhevmjs';

export interface FhevmClientConfig {
  provider: ethers.Provider;
  network: 'sepolia' | 'localhost' | number;
  chainId?: number;
  gatewayUrl?: string;
  aclAddress?: string;
}

export interface FhevmClientInstance {
  instance: FhevmInstance | null;
  provider: ethers.Provider;
  chainId: number;
  isReady: boolean;
  init: () => Promise<void>;
  getPublicKey: (contractAddress: string) => Promise<string>;
}

/**
 * Create FHEVM Client
 *
 * @example
 * ```typescript
 * const client = createFhevmClient({
 *   provider: window.ethereum,
 *   network: 'sepolia'
 * });
 *
 * await client.init();
 * ```
 */
export function createFhevmClient(config: FhevmClientConfig): FhevmClientInstance {
  let fhevmInstance: FhevmInstance | null = null;
  let isReady = false;

  const provider =
    config.provider instanceof ethers.BrowserProvider
      ? config.provider
      : new ethers.BrowserProvider(config.provider as any);

  const chainId = typeof config.network === 'number' ? config.network : config.chainId || 11155111;

  return {
    instance: fhevmInstance,
    provider,
    chainId,
    isReady,

    /**
     * Initialize FHEVM instance
     */
    async init() {
      try {
        fhevmInstance = await createInstance({ chainId });
        isReady = true;
        this.instance = fhevmInstance;
        this.isReady = true;
      } catch (error) {
        throw new Error(`Failed to initialize FHEVM: ${(error as Error).message}`);
      }
    },

    /**
     * Get public key for contract
     */
    async getPublicKey(contractAddress: string): Promise<string> {
      if (!fhevmInstance) {
        throw new Error('FHEVM instance not initialized. Call init() first.');
      }

      try {
        const publicKey = fhevmInstance.getPublicKey(contractAddress);
        return publicKey.serialize();
      } catch (error) {
        throw new Error(`Failed to get public key: ${(error as Error).message}`);
      }
    },
  };
}

/**
 * FhevmClient class for object-oriented usage
 */
export class FhevmClient {
  private instance: FhevmInstance | null = null;
  private provider: ethers.Provider;
  private chainId: number;
  public isReady: boolean = false;

  constructor(config: FhevmClientConfig) {
    this.provider =
      config.provider instanceof ethers.BrowserProvider
        ? config.provider
        : new ethers.BrowserProvider(config.provider as any);

    this.chainId = typeof config.network === 'number' ? config.network : config.chainId || 11155111;
  }

  /**
   * Initialize the FHEVM instance
   */
  async init(): Promise<void> {
    try {
      this.instance = await createInstance({ chainId: this.chainId });
      this.isReady = true;
    } catch (error) {
      throw new Error(`Failed to initialize FHEVM: ${(error as Error).message}`);
    }
  }

  /**
   * Get the FHEVM instance
   */
  getInstance(): FhevmInstance {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized. Call init() first.');
    }
    return this.instance;
  }

  /**
   * Get provider
   */
  getProvider(): ethers.Provider {
    return this.provider;
  }

  /**
   * Get chain ID
   */
  getChainId(): number {
    return this.chainId;
  }

  /**
   * Get public key for a contract
   */
  async getPublicKey(contractAddress: string): Promise<string> {
    const instance = this.getInstance();
    const publicKey = instance.getPublicKey(contractAddress);
    return publicKey.serialize();
  }
}
