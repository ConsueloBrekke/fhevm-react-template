# FHEVM SDK Guide

Complete guide to using the Universal FHEVM SDK for building confidential frontends.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [Client Initialization](#client-initialization)
- [Input Encryption](#input-encryption)
- [Decryption](#decryption)
- [Contract Integration](#contract-integration)
- [React Integration](#react-integration)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Introduction

The FHEVM SDK is a framework-agnostic library for building confidential frontends with Zama's Fully Homomorphic Encryption (FHE). It provides:

- **Simple API** - < 10 lines to get started
- **Framework Agnostic** - Works with React, Vue, Next.js, plain Node.js
- **Type Safe** - Full TypeScript support
- **Modular** - Import only what you need
- **Production Ready** - Well-tested and documented

---

## Installation

### NPM

```bash
npm install @fhevm-sdk/core ethers
```

### Yarn

```bash
yarn add @fhevm-sdk/core ethers
```

### PNPM

```bash
pnpm add @fhevm-sdk/core ethers
```

---

## Core Concepts

### FHE Types

The SDK supports the following FHE types:

| Type | Description | Range |
|------|-------------|-------|
| `ebool` | Encrypted boolean | true/false |
| `euint8` | Encrypted 8-bit unsigned integer | 0 - 255 |
| `euint16` | Encrypted 16-bit unsigned integer | 0 - 65,535 |
| `euint32` | Encrypted 32-bit unsigned integer | 0 - 4,294,967,295 |
| `euint64` | Encrypted 64-bit unsigned integer | 0 - 2^64-1 |

### Workflow

1. **Initialize** - Create FHE client
2. **Encrypt** - Encrypt input values on client
3. **Submit** - Send encrypted data to blockchain
4. **Compute** - Contract performs FHE operations
5. **Decrypt** - Decrypt results (when authorized)

---

## Client Initialization

### Basic Usage

```typescript
import { createFhevmClient } from '@fhevm-sdk/core';

const client = createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia'
});

await client.init();
```

### With Custom Provider

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_KEY');

const client = createFhevmClient({
  provider,
  network: 'sepolia',
  chainId: 11155111
});

await client.init();
```

### Configuration Options

```typescript
interface FhevmClientConfig {
  provider: ethers.Provider;      // Ethers provider
  network: 'sepolia' | 'localhost' | number;  // Network name or chain ID
  chainId?: number;               // Optional explicit chain ID
  gatewayUrl?: string;            // Optional gateway URL
  aclAddress?: string;            // Optional ACL contract address
}
```

---

## Input Encryption

### Encrypt Single Value

```typescript
import { encryptInput } from '@fhevm-sdk/core';

const encrypted = await encryptInput(client, contractAddress, {
  values: [42],
  types: ['uint32']
});

// Use in transaction
await contract.submitData(encrypted.handles[0], encrypted.inputProof);
```

### Encrypt Multiple Values

```typescript
const encrypted = await encryptInput(client, contractAddress, {
  values: [1000, 85, true],
  types: ['uint32', 'uint8', 'bool']
});

await contract.registerData(
  encrypted.handles[0],  // euint32
  encrypted.handles[1],  // euint8
  encrypted.handles[2],  // ebool
  encrypted.inputProof
);
```

### Encrypt Batch (Same Type)

```typescript
import { encryptBatch } from '@fhevm-sdk/core';

const encrypted = await encryptBatch(
  client,
  contractAddress,
  [10, 20, 30],
  'uint8'
);
```

### Type Conversion Table

| JavaScript Type | FHE Type |
|----------------|----------|
| `number` (0-255) | `euint8` |
| `number` (0-65535) | `euint16` |
| `number` (0-4B) | `euint32` |
| `BigInt` | `euint64` |
| `boolean` | `ebool` |

---

## Decryption

### User Decryption (EIP-712 Signature)

Requires user signature to decrypt their own data:

```typescript
import { userDecrypt } from '@fhevm-sdk/core';

const decrypted = await userDecrypt(
  client,
  contractAddress,
  encryptedValue,
  'euint32'
);

console.log('Decrypted:', decrypted); // 1000
```

### Public Decryption

For publicly accessible encrypted values:

```typescript
import { publicDecrypt } from '@fhevm-sdk/core';

const decrypted = await publicDecrypt(
  client,
  contractAddress,
  encryptedValue,
  'euint32'
);
```

### Generic Decryption

Automatically chooses method:

```typescript
import { decryptValue } from '@fhevm-sdk/core';

// With signature (user decryption)
const userValue = await decryptValue(
  client,
  contractAddress,
  encryptedValue,
  'euint32',
  true
);

// Without signature (public decryption)
const publicValue = await decryptValue(
  client,
  contractAddress,
  encryptedValue,
  'euint32',
  false
);
```

### Batch Decryption

```typescript
import { decryptBatch } from '@fhevm-sdk/core';

const decrypted = await decryptBatch(
  client,
  contractAddress,
  [encrypted1, encrypted2, encrypted3],
  ['euint32', 'euint8', 'ebool'],
  true // requireSignature
);

console.log(decrypted); // [1000, 85, true]
```

---

## Contract Integration

### Create Contract with FHE Support

```typescript
import { createContract } from '@fhevm-sdk/core';

const contract = createContract({
  address: contractAddress,
  abi: contractABI,
  client: fhevmClient
});

// Use FHE helper
await contract.encryptAndCall('submitData', [42, 100], ['uint32', 'uint8']);
```

### Standard Contract Interaction

```typescript
// Encrypt manually
const encrypted = await encryptInput(client, contractAddress, {
  values: [42],
  types: ['uint32']
});

// Call contract
const tx = await contract.submitData(encrypted.handles[0], encrypted.inputProof);
const receipt = await tx.wait();
```

### Listen to Events

```typescript
import { listenToEvent } from '@fhevm-sdk/core';

const cleanup = listenToEvent(contract, 'DataRegistered', (event) => {
  console.log('New data:', event.args);
});

// Cleanup when done
cleanup();
```

### Query Events

```typescript
import { getContractEvents } from '@fhevm-sdk/core';

const events = await getContractEvents(
  contract,
  'DataRegistered',
  0,        // fromBlock
  'latest'  // toBlock
);
```

---

## React Integration

### useFhevm Hook

Initialize FHEVM client:

```tsx
import { useFhevm } from '@fhevm-sdk/core';

function App() {
  const { client, isReady, error } = useFhevm({
    provider: window.ethereum,
    network: 'sepolia'
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Loading FHE...</div>;

  return <Dashboard client={client} />;
}
```

### useEncryptedInput Hook

Encrypt user input:

```tsx
import { useEncryptedInput } from '@fhevm-sdk/core';

function SubmitForm({ client }) {
  const { encrypt, encrypted, isEncrypting, error } = useEncryptedInput(client);

  const handleSubmit = async () => {
    const result = await encrypt(contractAddress, {
      values: [42],
      types: ['uint32']
    });

    await contract.submitData(result.handles[0], result.inputProof);
  };

  return (
    <button onClick={handleSubmit} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Submit'}
    </button>
  );
}
```

### useDecryption Hook

Decrypt values:

```tsx
import { useDecryption } from '@fhevm-sdk/core';

function ViewData({ client, encryptedValue }) {
  const { decrypt, decrypted, isDecrypting, error } = useDecryption(client);

  const handleDecrypt = async () => {
    const value = await decrypt(contractAddress, encryptedValue, 'euint32');
    console.log('Decrypted:', value);
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        Decrypt
      </button>
      {decrypted !== null && <div>Value: {decrypted}</div>}
    </div>
  );
}
```

### useFhevmContract Hook

Get contract with FHE support:

```tsx
import { useFhevmContract } from '@fhevm-sdk/core';

function DataManager({ client }) {
  const contract = useFhevmContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client
  });

  const submitData = async () => {
    await contract.encryptAndCall('submitData', [42], ['uint32']);
  };

  return <button onClick={submitData}>Submit</button>;
}
```

---

## Error Handling

### Common Errors

```typescript
try {
  await client.init();
} catch (error) {
  if (error.message.includes('not initialized')) {
    // Client not initialized
  } else if (error.message.includes('encryption failed')) {
    // Encryption error
  } else {
    // Other error
  }
}
```

### Error Types

| Error | Cause | Solution |
|-------|-------|----------|
| `FHEVM instance not initialized` | Called before `init()` | Call `client.init()` first |
| `Values and types arrays must have the same length` | Mismatched arrays | Ensure arrays match |
| `Unsupported encryption type` | Invalid type | Use valid FHE type |
| `Contract not found` | Wrong address | Verify contract address |

---

## Best Practices

### 1. Always Initialize First

```typescript
const client = createFhevmClient(config);
await client.init(); // Always init before use
```

### 2. Use Type Safety

```typescript
// Good - explicit types
const encrypted = await encryptInput(client, address, {
  values: [42, true],
  types: ['uint32', 'bool']
});

// Bad - no type checking
const encrypted = await encryptInput(client, address, {
  values: [42, true],
  types: ['uint32', 'uint32'] // Wrong!
});
```

### 3. Handle Errors Gracefully

```typescript
try {
  const encrypted = await encryptInput(...);
  await contract.submitData(...);
} catch (error) {
  console.error('Submission failed:', error);
  // Show user-friendly error message
}
```

### 4. Clean Up Event Listeners

```typescript
useEffect(() => {
  const cleanup = listenToEvent(contract, 'DataRegistered', handler);
  return cleanup; // Clean up on unmount
}, [contract]);
```

### 5. Use React Hooks in Components

```tsx
// Good - use hooks
function MyComponent() {
  const { client, isReady } = useFhevm(config);
  return isReady && <Content client={client} />;
}

// Avoid - manual management
function MyComponent() {
  const [client, setClient] = useState(null);
  useEffect(() => {
    // Manual setup...
  }, []);
}
```

---

## Next Steps

- **[Integration Guide](./INTEGRATION.md)** - Framework-specific examples
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation
- **[Examples](../examples/)** - Working code examples

---

## Support

- **Documentation**: [GitHub](https://github.com/your-username/fhevm-react-template)
- **Issues**: [GitHub Issues](https://github.com/your-username/fhevm-react-template/issues)
- **Zama Docs**: [https://docs.zama.ai/](https://docs.zama.ai/)
