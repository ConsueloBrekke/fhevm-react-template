/**
 * API-related type definitions
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EncryptApiRequest {
  values: (number | boolean)[];
  types: string[];
  contractAddress: string;
}

export interface EncryptApiResponse {
  encrypted: {
    handles: string[];
    inputProof: string;
  };
}

export interface DecryptApiRequest {
  encryptedValue: string;
  valueType: string;
  contractAddress: string;
  userAddress?: string;
}

export interface DecryptApiResponse {
  decrypted: number | boolean | string;
}

export interface ComputeApiRequest {
  operation: string;
  operands: string[];
  contractAddress: string;
}

export interface ComputeApiResponse {
  result: string;
}

export interface KeyApiResponse {
  publicKey: string;
}

export interface KeyGenerateRequest {
  action: 'generate' | 'refresh';
}

export interface KeyGenerateResponse {
  keyPair?: {
    publicKey: string;
    privateKey: string;
  };
  publicKey?: string;
}
