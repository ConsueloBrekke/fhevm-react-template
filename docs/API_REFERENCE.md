# API Reference

Complete API documentation for the FHEVM SDK.

## Table of Contents

- [Client](#client)
- [Encryption](#encryption)
- [Decryption](#decryption)
- [Contract](#contract)
- [React Hooks](#react-hooks)
- [Types](#types)

---

## Client

### `createFhevmClient(config)`

Creates a new FHEVM client instance.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `config` | `FhevmClientConfig` | Client configuration |

**Returns:** `FhevmClientInstance`

**Example:**

```typescript
const client = createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia'
});
```

---

### `FhevmClientConfig`

Client configuration interface.

```typescript
interface FhevmClientConfig {
  provider: ethers.Provider;
  network: 'sepolia' | 'localhost' | number;
  chainId?: number;
  gatewayUrl?: string;
  aclAddress?: string;
}
```

**Properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | `ethers.Provider` | Yes | Ethers provider instance |
| `network` | `string \| number` | Yes | Network name or chain ID |
| `chainId` | `number` | No | Explicit chain ID |
| `gatewayUrl` | `string` | No | Custom gateway URL |
| `aclAddress` | `string` | No | ACL contract address |

---

### `FhevmClientInstance`

Client instance interface.

```typescript
interface FhevmClientInstance {
  instance: FhevmInstance | null;
  provider: ethers.Provider;
  chainId: number;
  isReady: boolean;
  init(): Promise<void>;
  getPublicKey(contractAddress: string): Promise<string>;
}
```

**Properties:**

| Name | Type | Description |
|------|------|-------------|
| `instance` | `FhevmInstance \| null` | Underlying FHE instance |
| `provider` | `ethers.Provider` | Ethers provider |
| `chainId` | `number` | Chain ID |
| `isReady` | `boolean` | Initialization status |

**Methods:**

#### `init()`

Initialize the FHEVM instance.

```typescript
await client.init();
```

#### `getPublicKey(contractAddress)`

Get public key for a contract.

**Parameters:**
- `contractAddress` (string): Contract address

**Returns:** `Promise<string>` - Serialized public key

```typescript
const publicKey = await client.getPublicKey('0x...');
```

---

## Encryption

### `encryptInput(client, contractAddress, input)`

Encrypt input values for FHE operations.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClientInstance` | Initialized FHE client |
| `contractAddress` | `string` | Target contract address |
| `input` | `EncryptionInput` | Values and types to encrypt |

**Returns:** `Promise<EncryptedInput>`

**Example:**

```typescript
const encrypted = await encryptInput(client, contractAddress, {
  values: [42, 100, true],
  types: ['uint32', 'uint8', 'bool']
});
```

---

### `encryptValue(client, value, type)`

Encrypt a single value.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClientInstance` | Initialized FHE client |
| `value` | `number \| boolean` | Value to encrypt |
| `type` | `string` | FHE type |

**Returns:** `Promise<string>` - Encrypted handle

**Example:**

```typescript
const encrypted = await encryptValue(client, 42, 'uint32');
```

---

### `encryptBatch(client, contractAddress, values, type)`

Encrypt multiple values of the same type.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClientInstance` | Initialized FHE client |
| `contractAddress` | `string` | Target contract address |
| `values` | `(number \| boolean)[]` | Values to encrypt |
| `type` | `string` | FHE type (same for all) |

**Returns:** `Promise<EncryptedInput>`

**Example:**

```typescript
const encrypted = await encryptBatch(client, address, [1, 2, 3], 'uint8');
```

---

### `EncryptionInput`

Input encryption interface.

```typescript
interface EncryptionInput {
  values: (number | boolean)[];
  types: string[];
}
```

---

### `EncryptedInput`

Encrypted input result interface.

```typescript
interface EncryptedInput {
  handles: string[];
  inputProof: string;
}
```

**Properties:**

| Name | Type | Description |
|------|------|-------------|
| `handles` | `string[]` | Encrypted value handles |
| `inputProof` | `string` | Input proof for contract |

---

## Decryption

### `userDecrypt(client, contractAddress, encryptedValue, type)`

Decrypt encrypted value using EIP-712 signature.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClientInstance` | Initialized FHE client |
| `contractAddress` | `string` | Contract address |
| `encryptedValue` | `string` | Encrypted value handle |
| `type` | `FheType` | FHE type |

**Returns:** `Promise<number | boolean>` - Decrypted value

**Example:**

```typescript
const decrypted = await userDecrypt(
  client,
  contractAddress,
  encryptedValue,
  'euint32'
);
```

---

### `publicDecrypt(client, contractAddress, encryptedValue, type)`

Decrypt publicly accessible encrypted value.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClientInstance` | Initialized FHE client |
| `contractAddress` | `string` | Contract address |
| `encryptedValue` | `string` | Encrypted value handle |
| `type` | `FheType` | FHE type |

**Returns:** `Promise<number | boolean>` - Decrypted value

**Example:**

```typescript
const decrypted = await publicDecrypt(
  client,
  contractAddress,
  encryptedValue,
  'euint32'
);
```

---

### `decryptValue(client, contractAddress, encryptedValue, type, requireSignature)`

Generic decryption function.

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `client` | `FhevmClientInstance` | - | Initialized FHE client |
| `contractAddress` | `string` | - | Contract address |
| `encryptedValue` | `string` | - | Encrypted value handle |
| `type` | `FheType` | - | FHE type |
| `requireSignature` | `boolean` | `true` | Use EIP-712 signature |

**Returns:** `Promise<number | boolean>` - Decrypted value

**Example:**

```typescript
// User decryption
const userValue = await decryptValue(client, address, encrypted, 'euint32', true);

// Public decryption
const publicValue = await decryptValue(client, address, encrypted, 'euint32', false);
```

---

### `decryptBatch(client, contractAddress, encryptedValues, types, requireSignature)`

Decrypt multiple values at once.

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `client` | `FhevmClientInstance` | - | Initialized FHE client |
| `contractAddress` | `string` | - | Contract address |
| `encryptedValues` | `string[]` | - | Encrypted value handles |
| `types` | `FheType[]` | - | FHE types |
| `requireSignature` | `boolean` | `true` | Use EIP-712 signature |

**Returns:** `Promise<(number | boolean)[]>` - Decrypted values

**Example:**

```typescript
const decrypted = await decryptBatch(
  client,
  address,
  [encrypted1, encrypted2],
  ['euint32', 'euint8'],
  true
);
```

---

### `FheType`

FHE type union.

```typescript
type FheType = 'ebool' | 'euint8' | 'euint16' | 'euint32' | 'euint64';
```

---

## Contract

### `createContract(config)`

Create contract instance with FHE support.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `config` | `ContractConfig` | Contract configuration |

**Returns:** `FhevmContract`

**Example:**

```typescript
const contract = createContract({
  address: contractAddress,
  abi: contractABI,
  client: fhevmClient
});
```

---

### `ContractConfig`

Contract configuration interface.

```typescript
interface ContractConfig {
  address: string;
  abi: any[];
  client: FhevmClientInstance;
  signer?: ethers.Signer;
}
```

---

### `FhevmContract`

Extended contract with FHE helpers.

```typescript
interface FhevmContract extends ethers.Contract {
  encryptAndCall(method: string, values: (number | boolean)[], types: string[]): Promise<any>;
  client: FhevmClientInstance;
}
```

**Methods:**

#### `encryptAndCall(method, values, types)`

Encrypt values and call contract method.

**Parameters:**
- `method` (string): Contract method name
- `values` ((number | boolean)[]): Values to encrypt
- `types` (string[]): FHE types

**Returns:** `Promise<any>` - Transaction response

```typescript
await contract.encryptAndCall('submitData', [42, 100], ['uint32', 'uint8']);
```

---

### `getContract(address, abi, client, signer?)`

Simple contract getter.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `address` | `string` | Yes | Contract address |
| `abi` | `any[]` | Yes | Contract ABI |
| `client` | `FhevmClientInstance` | Yes | FHE client |
| `signer` | `ethers.Signer` | No | Ethers signer |

**Returns:** `FhevmContract`

---

### `callWithEncryption(contract, method, values, types, client)`

Call contract with encrypted inputs.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `contract` | `ethers.Contract` | Contract instance |
| `method` | `string` | Method name |
| `values` | `(number \| boolean)[]` | Values to encrypt |
| `types` | `string[]` | FHE types |
| `client` | `FhevmClientInstance` | FHE client |

**Returns:** `Promise<any>` - Transaction response

---

### `waitForTransaction(tx, confirmations?)`

Wait for transaction with error handling.

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `tx` | `ContractTransactionResponse` | - | Transaction response |
| `confirmations` | `number` | `1` | Number of confirmations |

**Returns:** `Promise<TransactionReceipt>`

---

### `getContractEvents(contract, eventName, fromBlock?, toBlock?)`

Query contract events.

**Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `contract` | `ethers.Contract` | - | Contract instance |
| `eventName` | `string` | - | Event name |
| `fromBlock` | `number` | `0` | Starting block |
| `toBlock` | `number \| string` | `'latest'` | Ending block |

**Returns:** `Promise<any[]>` - Events

---

### `listenToEvent(contract, eventName, callback)`

Listen to contract events.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `contract` | `ethers.Contract` | Contract instance |
| `eventName` | `string` | Event name |
| `callback` | `(event: any) => void` | Event handler |

**Returns:** `() => void` - Cleanup function

**Example:**

```typescript
const cleanup = listenToEvent(contract, 'DataRegistered', (event) => {
  console.log('New data:', event.args);
});

// Later: cleanup()
```

---

## React Hooks

### `useFhevm(config)`

Initialize FHEVM client hook.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `config` | `FhevmClientConfig` | Client configuration |

**Returns:**

```typescript
{
  client: FhevmClientInstance | null;
  isReady: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
const { client, isReady, error } = useFhevm({
  provider: window.ethereum,
  network: 'sepolia'
});
```

---

### `useFhevmContract(config)`

Get contract with FHE support hook.

**Parameters:**

```typescript
{
  address: string;
  abi: any[];
  client: FhevmClientInstance | null;
  signer?: ethers.Signer;
}
```

**Returns:** `FhevmContract | null`

**Example:**

```tsx
const contract = useFhevmContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  client
});
```

---

### `useEncryptedInput(client)`

Encrypt input hook.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClientInstance \| null` | FHE client |

**Returns:**

```typescript
{
  encrypt: (contractAddress: string, input: EncryptionInput) => Promise<EncryptedInput>;
  encrypted: EncryptedInput | null;
  isEncrypting: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
const { encrypt, encrypted, isEncrypting, error } = useEncryptedInput(client);

const handleEncrypt = async () => {
  const result = await encrypt(contractAddress, {
    values: [42],
    types: ['uint32']
  });
};
```

---

### `useDecryption(client)`

Decrypt value hook.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | `FhevmClientInstance \| null` | FHE client |

**Returns:**

```typescript
{
  decrypt: (contractAddress: string, encryptedValue: string, type: FheType, requireSignature?: boolean) => Promise<number | boolean>;
  decrypted: number | boolean | null;
  isDecrypting: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
const { decrypt, decrypted, isDecrypting, error } = useDecryption(client);

const handleDecrypt = async () => {
  const value = await decrypt(contractAddress, encryptedValue, 'euint32');
};
```

---

### `useContractCall(contract)`

Call contract method hook.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `contract` | `FhevmContract \| null` | FHE contract |

**Returns:**

```typescript
{
  call: (method: string, values: (number | boolean)[], types: string[]) => Promise<any>;
  data: any;
  isLoading: boolean;
  error: Error | null;
}
```

**Example:**

```tsx
const { call, data, isLoading, error } = useContractCall(contract);

const handleCall = async () => {
  const tx = await call('submitData', [42], ['uint32']);
  await tx.wait();
};
```

---

## Types

### Supported FHE Types

| Type | JavaScript Type | Range |
|------|----------------|-------|
| `ebool` | `boolean` | true/false |
| `euint8` | `number` | 0 - 255 |
| `euint16` | `number` | 0 - 65,535 |
| `euint32` | `number` | 0 - 4,294,967,295 |
| `euint64` | `number` | 0 - 2^64-1 |

### Type Mappings

| Solidity Type | SDK Type | JavaScript Type |
|---------------|----------|-----------------|
| `ebool` | `'bool'` or `'ebool'` | `boolean` |
| `euint8` | `'uint8'` or `'euint8'` | `number` |
| `euint16` | `'uint16'` or `'euint16'` | `number` |
| `euint32` | `'uint32'` or `'euint32'` | `number` |
| `euint64` | `'uint64'` or `'euint64'` | `number` |

---

## Error Handling

### Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `FHEVM instance not initialized` | Called before init() | Call `client.init()` first |
| `FHEVM client not ready` | Client not initialized in hook | Wait for `isReady` to be true |
| `Values and types arrays must have the same length` | Mismatched arrays | Ensure equal lengths |
| `Unsupported encryption type` | Invalid FHE type | Use valid type |
| `Method not found on contract` | Wrong method name | Check contract ABI |
| `Contract not initialized` | Contract is null | Wait for contract to initialize |

---

## Next Steps

- **[SDK Guide](./SDK_GUIDE.md)** - Complete SDK documentation
- **[Integration Guide](./INTEGRATION.md)** - Framework-specific examples
- **[Examples](../examples/)** - Working code examples

---

## Support

- **GitHub**: [https://github.com/your-username/fhevm-react-template](https://github.com/your-username/fhevm-react-template)
- **Issues**: [GitHub Issues](https://github.com/your-username/fhevm-react-template/issues)
- **Zama Docs**: [https://docs.zama.ai/](https://docs.zama.ai/)
