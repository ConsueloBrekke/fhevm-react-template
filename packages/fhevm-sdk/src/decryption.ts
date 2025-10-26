/**
 * FHEVM Decryption Utilities
 * Handles value decryption with EIP-712 signatures and public decryption
 */

import { ethers } from 'ethers';
import { FhevmClientInstance } from './client';

export type FheType = 'ebool' | 'euint8' | 'euint16' | 'euint32' | 'euint64';

/**
 * Decrypt encrypted value using EIP-712 signature (user decryption)
 *
 * @example
 * ```typescript
 * const decrypted = await userDecrypt(
 *   client,
 *   contractAddress,
 *   encryptedValue,
 *   'euint32'
 * );
 * ```
 */
export async function userDecrypt(
  client: FhevmClientInstance,
  contractAddress: string,
  encryptedValue: string,
  type: FheType
): Promise<number | boolean> {
  if (!client.isReady || !client.instance) {
    throw new Error('FHEVM client not initialized. Call init() first.');
  }

  try {
    const instance = client.instance;
    const signer = await client.provider.getSigner();

    // Get public key
    const publicKey = instance.getPublicKey(contractAddress);

    // Create EIP-712 domain and message
    const domain = {
      name: 'FHEVM',
      version: '1',
      chainId: client.chainId,
      verifyingContract: contractAddress,
    };

    const types = {
      Reencrypt: [
        { name: 'publicKey', type: 'bytes' },
        { name: 'ciphertext', type: 'bytes32' },
      ],
    };

    const message = {
      publicKey: publicKey.serialize(),
      ciphertext: encryptedValue,
    };

    // Sign with EIP-712
    const signature = await signer.signTypedData(domain, types, message);

    // Decrypt with signature
    const decryptedBytes = instance.reencrypt(
      ethers.getBytes(encryptedValue),
      ethers.getBytes(signature)
    );

    // Parse based on type
    return parseDecryptedValue(decryptedBytes, type);
  } catch (error) {
    throw new Error(`User decryption failed: ${(error as Error).message}`);
  }
}

/**
 * Decrypt publicly accessible encrypted value
 *
 * @example
 * ```typescript
 * const decrypted = await publicDecrypt(
 *   client,
 *   contractAddress,
 *   encryptedValue,
 *   'euint32'
 * );
 * ```
 */
export async function publicDecrypt(
  client: FhevmClientInstance,
  contractAddress: string,
  encryptedValue: string,
  type: FheType
): Promise<number | boolean> {
  if (!client.isReady || !client.instance) {
    throw new Error('FHEVM client not initialized. Call init() first.');
  }

  try {
    const instance = client.instance;

    // Decrypt without signature (public decryption)
    const decryptedBytes = instance.decrypt(contractAddress, ethers.getBytes(encryptedValue));

    return parseDecryptedValue(decryptedBytes, type);
  } catch (error) {
    throw new Error(`Public decryption failed: ${(error as Error).message}`);
  }
}

/**
 * Generic decryption function (automatically chooses method)
 *
 * @example
 * ```typescript
 * const decrypted = await decryptValue(
 *   client,
 *   contractAddress,
 *   encryptedValue,
 *   'euint32',
 *   true // requireSignature
 * );
 * ```
 */
export async function decryptValue(
  client: FhevmClientInstance,
  contractAddress: string,
  encryptedValue: string,
  type: FheType,
  requireSignature: boolean = true
): Promise<number | boolean> {
  if (requireSignature) {
    return userDecrypt(client, contractAddress, encryptedValue, type);
  } else {
    return publicDecrypt(client, contractAddress, encryptedValue, type);
  }
}

/**
 * Parse decrypted bytes based on FHE type
 */
function parseDecryptedValue(bytes: Uint8Array, type: FheType): number | boolean {
  const dataView = new DataView(bytes.buffer);

  switch (type.toLowerCase()) {
    case 'ebool':
      return bytes[0] !== 0;
    case 'euint8':
      return dataView.getUint8(0);
    case 'euint16':
      return dataView.getUint16(0, false); // big-endian
    case 'euint32':
      return dataView.getUint32(0, false);
    case 'euint64':
      // JavaScript can't safely handle uint64, return as BigInt string
      const high = dataView.getUint32(0, false);
      const low = dataView.getUint32(4, false);
      return Number((BigInt(high) << 32n) | BigInt(low));
    default:
      throw new Error(`Unsupported FHE type: ${type}`);
  }
}

/**
 * Decrypt multiple values at once
 *
 * @example
 * ```typescript
 * const decrypted = await decryptBatch(
 *   client,
 *   contractAddress,
 *   [encrypted1, encrypted2],
 *   ['euint32', 'euint8']
 * );
 * ```
 */
export async function decryptBatch(
  client: FhevmClientInstance,
  contractAddress: string,
  encryptedValues: string[],
  types: FheType[],
  requireSignature: boolean = true
): Promise<(number | boolean)[]> {
  if (encryptedValues.length !== types.length) {
    throw new Error('Encrypted values and types arrays must have the same length');
  }

  const results: (number | boolean)[] = [];

  for (let i = 0; i < encryptedValues.length; i++) {
    const decrypted = await decryptValue(
      client,
      contractAddress,
      encryptedValues[i],
      types[i],
      requireSignature
    );
    results.push(decrypted);
  }

  return results;
}
