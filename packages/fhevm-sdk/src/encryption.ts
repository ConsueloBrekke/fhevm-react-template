/**
 * FHEVM Encryption Utilities
 * Handles input encryption for FHE operations
 */

import { ethers } from 'ethers';
import { FhevmClientInstance } from './client';

export interface EncryptionInput {
  values: (number | boolean)[];
  types: string[];
}

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

/**
 * Encrypt input values for FHE operations
 *
 * @example
 * ```typescript
 * const encrypted = await encryptInput(client, contractAddress, {
 *   values: [42, 100, true],
 *   types: ['uint32', 'uint8', 'bool']
 * });
 * ```
 */
export async function encryptInput(
  client: FhevmClientInstance,
  contractAddress: string,
  input: EncryptionInput
): Promise<EncryptedInput> {
  if (!client.isReady || !client.instance) {
    throw new Error('FHEVM client not initialized. Call init() first.');
  }

  if (input.values.length !== input.types.length) {
    throw new Error('Values and types arrays must have the same length');
  }

  try {
    const instance = client.instance;
    const handles: string[] = [];

    // Encrypt each value according to its type
    for (let i = 0; i < input.values.length; i++) {
      const value = input.values[i];
      const type = input.types[i];

      let encryptedValue: any;

      switch (type.toLowerCase()) {
        case 'bool':
        case 'ebool':
          encryptedValue = instance.encrypt_bool(value as boolean);
          break;
        case 'uint8':
        case 'euint8':
          encryptedValue = instance.encrypt_uint8(value as number);
          break;
        case 'uint16':
        case 'euint16':
          encryptedValue = instance.encrypt_uint16(value as number);
          break;
        case 'uint32':
        case 'euint32':
          encryptedValue = instance.encrypt_uint32(value as number);
          break;
        case 'uint64':
        case 'euint64':
          encryptedValue = instance.encrypt_uint64(value as number);
          break;
        default:
          throw new Error(`Unsupported encryption type: ${type}`);
      }

      handles.push(ethers.hexlify(encryptedValue));
    }

    // Generate input proof
    const inputProof = instance.generateToken(contractAddress);

    return {
      handles,
      inputProof: ethers.hexlify(inputProof),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${(error as Error).message}`);
  }
}

/**
 * Encrypt a single value
 *
 * @example
 * ```typescript
 * const encrypted = await encryptValue(client, 42, 'uint32');
 * ```
 */
export async function encryptValue(
  client: FhevmClientInstance,
  value: number | boolean,
  type: string
): Promise<string> {
  const result = await encryptInput(client, ethers.ZeroAddress, {
    values: [value],
    types: [type],
  });

  return result.handles[0];
}

/**
 * Encrypt multiple values of the same type
 *
 * @example
 * ```typescript
 * const encrypted = await encryptBatch(client, contractAddress, [1, 2, 3], 'uint32');
 * ```
 */
export async function encryptBatch(
  client: FhevmClientInstance,
  contractAddress: string,
  values: (number | boolean)[],
  type: string
): Promise<EncryptedInput> {
  const types = new Array(values.length).fill(type);
  return encryptInput(client, contractAddress, { values, types });
}
