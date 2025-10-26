/**
 * FHEVM SDK - Universal Framework-Agnostic SDK for Zama FHE
 *
 * A wagmi-like structure for building confidential frontends with FHEVM
 * Works with React, Vue, Next.js, Node.js, and any JavaScript environment
 */

export { FhevmClient } from './client';
export { createFhevmClient } from './client';
export type { FhevmClientConfig, FhevmClientInstance } from './client';

export { encryptInput } from './encryption';
export { decryptValue, userDecrypt, publicDecrypt } from './decryption';
export type { EncryptedInput, DecryptionResult } from './types';

export { createContract } from './contract';
export type { ContractInstance } from './contract';

// React hooks (optional, only if React is available)
export { useFhevm } from './react/useFhevm';
export { useFhevmContract } from './react/useFhevmContract';
export { useEncryptedInput } from './react/useEncryptedInput';
export { useDecryption } from './react/useDecryption';

// Utilities
export { getChainId, getProvider, getSigner } from './utils';
export { FhevmError } from './errors';

// Constants
export { SUPPORTED_CHAINS, FHE_TYPES } from './constants';
