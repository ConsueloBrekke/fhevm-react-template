/**
 * Validation utilities for FHE inputs and outputs
 */

import { FheType, FHE_TYPE_SIZES } from '../fhe/types';

/**
 * Validate FHE type
 */
export function isValidFheType(type: string): type is FheType {
  const validTypes: FheType[] = [
    'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256', 'bool', 'address'
  ];
  return validTypes.includes(type as FheType);
}

/**
 * Validate encryption input
 */
export function validateEncryptionInput(
  values: any[],
  types: string[]
): { valid: boolean; error?: string } {
  if (!Array.isArray(values)) {
    return { valid: false, error: 'Values must be an array' };
  }

  if (!Array.isArray(types)) {
    return { valid: false, error: 'Types must be an array' };
  }

  if (values.length === 0) {
    return { valid: false, error: 'At least one value is required' };
  }

  if (values.length !== types.length) {
    return { valid: false, error: 'Number of values must match number of types' };
  }

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const value = values[i];

    if (!isValidFheType(type)) {
      return { valid: false, error: `Invalid FHE type: ${type}` };
    }

    if (type === 'bool') {
      if (typeof value !== 'boolean') {
        return { valid: false, error: `Value at index ${i} must be a boolean for type bool` };
      }
    } else if (type === 'address') {
      if (typeof value !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
        return { valid: false, error: `Value at index ${i} must be a valid address` };
      }
    } else {
      if (typeof value !== 'number') {
        return { valid: false, error: `Value at index ${i} must be a number for type ${type}` };
      }

      if (!Number.isInteger(value) || value < 0) {
        return { valid: false, error: `Value at index ${i} must be a non-negative integer` };
      }

      const maxValue = getMaxValueForType(type);
      if (value > maxValue) {
        return { valid: false, error: `Value at index ${i} exceeds maximum for type ${type}` };
      }
    }
  }

  return { valid: true };
}

/**
 * Get maximum value for a given FHE type
 */
export function getMaxValueForType(type: FheType): number {
  const size = FHE_TYPE_SIZES[type];
  if (!size || size > 53) {
    // JavaScript's Number.MAX_SAFE_INTEGER is 2^53 - 1
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.pow(2, size) - 1;
}

/**
 * Validate decryption parameters
 */
export function validateDecryptionParams(
  handle: string,
  type: string
): { valid: boolean; error?: string } {
  if (!handle || typeof handle !== 'string') {
    return { valid: false, error: 'Handle must be a non-empty string' };
  }

  if (!/^0x[0-9a-fA-F]+$/.test(handle)) {
    return { valid: false, error: 'Handle must be a valid hex string' };
  }

  if (!isValidFheType(type)) {
    return { valid: false, error: `Invalid FHE type: ${type}` };
  }

  return { valid: true };
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(network: string): { valid: boolean; error?: string } {
  const supportedNetworks = ['sepolia', 'localhost'];

  if (!network || typeof network !== 'string') {
    return { valid: false, error: 'Network must be a non-empty string' };
  }

  if (!supportedNetworks.includes(network.toLowerCase())) {
    return { valid: false, error: `Unsupported network: ${network}. Supported: ${supportedNetworks.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Format validation errors for user display
 */
export function formatValidationError(error: string): string {
  return `Validation Error: ${error}`;
}
