/**
 * Client-side FHE operations
 * This file contains utilities for FHE operations on the client side
 */

import { createFhevmClient, encryptInput, FhevmClientInstance } from '@fhevm-sdk/core';

/**
 * Initialize FHE client for browser environment
 */
export async function initializeFhevmClient(
  provider: any,
  network: string = 'sepolia'
): Promise<FhevmClientInstance> {
  const client = createFhevmClient({
    provider,
    network
  });

  await client.init();
  return client;
}

/**
 * Encrypt a single value
 */
export async function encryptValue(
  client: FhevmClientInstance,
  contractAddress: string,
  value: number | boolean,
  type: string
) {
  const result = await encryptInput(client, contractAddress, {
    values: [value],
    types: [type]
  });

  return {
    handle: result.handles[0],
    proof: result.inputProof
  };
}

/**
 * Encrypt multiple values at once
 */
export async function encryptMultipleValues(
  client: FhevmClientInstance,
  contractAddress: string,
  values: (number | boolean)[],
  types: string[]
) {
  if (values.length !== types.length) {
    throw new Error('Values and types arrays must have the same length');
  }

  const result = await encryptInput(client, contractAddress, {
    values,
    types
  });

  return {
    handles: result.handles,
    proof: result.inputProof
  };
}

/**
 * Get network configuration
 */
export function getNetworkConfig(network: string) {
  const configs: Record<string, any> = {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia',
      rpcUrl: 'https://sepolia.infura.io/v3/'
    },
    localhost: {
      chainId: 31337,
      name: 'Localhost',
      rpcUrl: 'http://localhost:8545'
    }
  };

  return configs[network] || configs.sepolia;
}
