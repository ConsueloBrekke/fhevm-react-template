/**
 * FHE-related type definitions for the application
 */

export type FheDataType =
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'bool'
  | 'address';

export interface EncryptedValue {
  handle: string;
  type: FheDataType;
}

export interface EncryptionInput {
  values: (number | boolean | string)[];
  types: FheDataType[];
}

export interface EncryptionOutput {
  handles: string[];
  inputProof: string;
}

export interface DecryptionInput {
  handle: string;
  type: FheDataType;
  contractAddress: string;
}

export interface DecryptionOutput {
  value: number | boolean | string;
  type: FheDataType;
}

export interface FheClientConfig {
  provider: any;
  network: string;
  chainId?: number;
}

export interface FheOperation {
  type: 'add' | 'sub' | 'mul' | 'div' | 'max' | 'min' | 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
  operands: EncryptedValue[];
}

export interface ComplianceData {
  dataPoints: number;
  riskScore: number;
  complianceScore: number;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  soxCompliant: boolean;
}

export interface EncryptedComplianceData {
  encryptedDataPoints: string;
  encryptedRiskScore: string;
  encryptedComplianceScore: string;
  encryptedGdpr: string;
  encryptedHipaa: string;
  encryptedSox: string;
  inputProof: string;
}
