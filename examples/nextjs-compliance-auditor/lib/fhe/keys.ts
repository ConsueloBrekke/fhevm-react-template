/**
 * Key management utilities for FHE
 */

export interface KeyPair {
  publicKey: string;
  privateKey?: string;
}

export interface NetworkKeys {
  networkPublicKey: string;
  userPublicKey?: string;
}

/**
 * Fetch network public key
 */
export async function fetchNetworkPublicKey(
  chainId: number
): Promise<string> {
  // In a real implementation, query the FHE network for the public key
  // This would typically be from a key generation contract or service

  const mockKeys: Record<number, string> = {
    11155111: '0x' + 'a'.repeat(128), // Sepolia
    31337: '0x' + 'b'.repeat(128)     // Localhost
  };

  return mockKeys[chainId] || mockKeys[11155111];
}

/**
 * Generate user key pair for re-encryption
 */
export async function generateUserKeyPair(): Promise<KeyPair> {
  // In a real implementation, generate a proper key pair
  // This would use the FHE library's key generation

  return {
    publicKey: '0x' + Math.random().toString(16).substring(2).repeat(4),
    privateKey: '0x' + Math.random().toString(16).substring(2).repeat(4)
  };
}

/**
 * Store user keys securely (e.g., in browser storage)
 */
export function storeUserKeys(keyPair: KeyPair): void {
  if (typeof window === 'undefined') return;

  try {
    // In production, consider more secure storage methods
    localStorage.setItem('fhe_user_public_key', keyPair.publicKey);
    // Note: Private keys should never be stored in localStorage in production
    // This is for demo purposes only
  } catch (error) {
    console.error('Failed to store keys:', error);
  }
}

/**
 * Retrieve stored user keys
 */
export function retrieveUserKeys(): KeyPair | null {
  if (typeof window === 'undefined') return null;

  try {
    const publicKey = localStorage.getItem('fhe_user_public_key');

    if (!publicKey) return null;

    return {
      publicKey
    };
  } catch (error) {
    console.error('Failed to retrieve keys:', error);
    return null;
  }
}

/**
 * Clear stored keys
 */
export function clearUserKeys(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('fhe_user_public_key');
    localStorage.removeItem('fhe_user_private_key');
  } catch (error) {
    console.error('Failed to clear keys:', error);
  }
}

/**
 * Validate key format
 */
export function validateKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return /^0x[0-9a-fA-F]+$/.test(key);
}
