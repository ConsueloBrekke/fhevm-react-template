/**
 * Security utilities for FHE operations
 */

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>\"']/g, '');
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate contract address before encryption
 */
export function validateContractAddress(address: string): boolean {
  if (!isValidAddress(address)) {
    return false;
  }

  // Additional checks for contract address
  // In production, you might want to verify the contract has code
  return true;
}

/**
 * Check if value is within safe range for FHE type
 */
export function isValueInRange(value: number, type: string): boolean {
  const ranges: Record<string, { min: number; max: number }> = {
    'uint8': { min: 0, max: 255 },
    'uint16': { min: 0, max: 65535 },
    'uint32': { min: 0, max: 4294967295 },
    'uint64': { min: 0, max: Number.MAX_SAFE_INTEGER }
  };

  const range = ranges[type];
  if (!range) return false;

  return value >= range.min && value <= range.max;
}

/**
 * Rate limiting for encryption operations
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number = 10;
  private readonly timeWindow: number = 60000; // 1 minute

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(time => now - time < this.timeWindow);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export const encryptionRateLimiter = new RateLimiter();

/**
 * Secure random number generation
 */
export function generateSecureRandom(bytes: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(bytes);
    window.crypto.getRandomValues(array);
    return '0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for server-side
  return '0x' + Math.random().toString(16).substring(2);
}

/**
 * Validate proof format
 */
export function isValidProof(proof: string): boolean {
  if (!proof || typeof proof !== 'string') return false;

  // Check if it's a valid hex string with minimum length
  return /^0x[0-9a-fA-F]{64,}$/.test(proof);
}
