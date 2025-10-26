/**
 * Type definitions for FHE operations
 */

export interface EncryptionConfig {
  contractAddress: string;
  values: (number | boolean)[];
  types: FheType[];
}

export type FheType =
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'bool'
  | 'address';

export interface EncryptionResult {
  handles: string[];
  inputProof: string;
}

export interface DecryptionConfig {
  contractAddress: string;
  handle: string;
  type: FheType;
}

export interface DecryptionResult {
  value: number | boolean | string;
  type: FheType;
}

export interface FheClientConfig {
  provider: any;
  network: string;
  chainId?: number;
}

export interface FheOperation {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'max' | 'min' | 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
  operands: string[];
  resultType: FheType;
}

export interface ComputationResult {
  result: string;
  operation: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  fhePublicKey?: string;
}

export const FHE_TYPE_SIZES: Record<FheType, number> = {
  'uint8': 8,
  'uint16': 16,
  'uint32': 32,
  'uint64': 64,
  'uint128': 128,
  'uint256': 256,
  'bool': 1,
  'address': 160
};

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
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
