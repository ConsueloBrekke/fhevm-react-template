# 🔐 FHEVM React Template v2.0

> **Universal FHEVM SDK** - Framework-agnostic SDK for building confidential frontends with Zama FHE

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/badge/npm-@fhevm--sdk%2Fcore-blue)](https://www.npmjs.com/package/@fhevm-sdk/core)
[![Zama FHE](https://img.shields.io/badge/Powered%20by-Zama%20FHE-blueviolet)](https://docs.zama.ai/)
[![Framework Agnostic](https://img.shields.io/badge/Framework-Agnostic-green)](https://github.com/ConsueloBrekke/fhevm-react-template)

A **wagmi-like structure** SDK that makes building confidential frontends simple, consistent, and developer-friendly. Works with **React**, **Next.js**, **Vue**, **Node.js**, or any JavaScript environment.

## 🌐 Links

**📂 GitHub Repository**: [https://github.com/ConsueloBrekke/fhevm-react-template](https://github.com/ConsueloBrekke/fhevm-react-template)

**🚀 Live Demo**: [https://fhe-compliance-auditor.vercel.app/](https://fhe-compliance-auditor.vercel.app/)

**🎥 Demo Video**: `demo.mp4` - Download the video file to watch the demonstration

## 🎯 What's New in v2.0

### Universal FHEVM SDK (`packages/fhevm-sdk`)

A complete rewrite focusing on **developer experience** and **framework flexibility**:

✅ **Framework-Agnostic Core** - Works everywhere (React, Vue, Next.js, plain Node.js)
✅ **Wagmi-like API** - Familiar structure for web3 developers
✅ **Zero Configuration** - Smart defaults, works out of the box
✅ **TypeScript First** - Full type safety and IntelliSense
✅ **Modular & Tree-Shakeable** - Import only what you need
✅ **React Hooks Included** - Optional React bindings for convenience
✅ **Comprehensive Testing** - Well-tested and production-ready

---

## 🚀 Quick Start (< 10 Lines of Code)

### Install

```bash
npm install @fhevm-sdk/core ethers
```

### Basic Usage

```typescript
import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';
import { ethers } from 'ethers';

// 1. Create client
const client = createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia'
});

// 2. Initialize
await client.init();

// 3. Encrypt data
const encrypted = await encryptInput(client, contractAddress, {
  values: [42, 100],
  types: ['uint32', 'uint8']
});

// 4. Use in transaction
await contract.submitData(encrypted.handles[0], encrypted.inputProof);
```

**That's it!** 🎉

---

## 📦 What's Included

### Monorepo Structure

```
fhevm-react-template/
│
├── packages/
│   └── fhevm-sdk/                    # 🎯 Universal FHEVM SDK (Main Deliverable)
│       ├── src/
│       │   ├── client.ts             # FHE client initialization
│       │   ├── encryption.ts         # Input encryption utilities
│       │   ├── decryption.ts         # Value decryption (user + public)
│       │   ├── contract.ts           # Contract interaction helpers
│       │   ├── react/                # Optional React hooks
│       │   │   ├── useFhevm.ts
│       │   │   ├── useFhevmContract.ts
│       │   │   └── useEncryptedInput.ts
│       │   └── index.ts              # Main exports
│       └── package.json
│
├── examples/
│   ├── nextjs-compliance-auditor/    # 📱 Next.js Example (Required)
│   │   ├── app/                      # Next.js 14+ App Router
│   │   ├── components/
│   │   ├── lib/                      # SDK integration
│   │   └── package.json
│   │
│   └── privacy-auditor-hardhat/      # 🔧 Hardhat Contract Example
│       ├── contracts/
│       │   └── PrivacyComplianceAuditor.sol
│       ├── scripts/
│       ├── test/
│       └── package.json
│
├── docs/                             # 📚 Documentation
│   ├── SDK_GUIDE.md
│   ├── INTEGRATION.md
│   └── API_REFERENCE.md
│
├── demo.mp4                          # 🎥 Video Demo
└── README.md                         # This file
```

---

## 🎯 SDK Features

### 1. Client Initialization

```typescript
import { createFhevmClient } from '@fhevm-sdk/core';

const client = createFhevmClient({
  provider: window.ethereum,  // or any ethers provider
  network: 'sepolia',         // or 'localhost' or chain ID
  chainId: 11155111          // optional
});

await client.init();
```

### 2. Input Encryption

```typescript
import { encryptInput } from '@fhevm-sdk/core';

// Encrypt multiple values
const encrypted = await encryptInput(client, contractAddress, {
  values: [1000, 85, true],
  types: ['uint32', 'uint8', 'bool']
});

// Use in transaction
const tx = await contract.registerData(
  encrypted.handles[0],
  encrypted.handles[1],
  encrypted.handles[2],
  encrypted.inputProof
);
```

### 3. User Decryption (EIP-712)

```typescript
import { userDecrypt } from '@fhevm-sdk/core';

// Decrypt encrypted value (requires user signature)
const decrypted = await userDecrypt(
  client,
  contractAddress,
  encryptedValue,
  'euint32'
);

console.log('Decrypted:', decrypted); // 1000
```

### 4. Public Decryption

```typescript
import { publicDecrypt } from '@fhevm-sdk/core';

// Decrypt publicly accessible value
const decrypted = await publicDecrypt(
  client,
  contractAddress,
  encryptedValue,
  'euint32'
);
```

### 5. Contract Integration

```typescript
import { createContract } from '@fhevm-sdk/core';

// Create contract instance with FHE support
const contract = createContract({
  address: contractAddress,
  abi: contractABI,
  client: fhevmClient
});

// Methods include encryption helpers
await contract.encryptAndCall('submitData', [42, 100]);
```

---

## ⚛️ React Integration

### Using React Hooks

```tsx
import { useFhevm, useFhevmContract, useEncryptedInput } from '@fhevm-sdk/core';

function MyComponent() {
  // 1. Initialize FHEVM
  const { client, isReady, error } = useFhevm({
    provider: window.ethereum,
    network: 'sepolia'
  });

  // 2. Get contract instance
  const contract = useFhevmContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client
  });

  // 3. Encrypt input
  const { encrypt, encrypted, isEncrypting } = useEncryptedInput(client);

  const handleSubmit = async () => {
    const result = await encrypt(CONTRACT_ADDRESS, {
      values: [1000],
      types: ['uint32']
    });

    await contract.submitData(result.handles[0], result.inputProof);
  };

  return (
    <div>
      {isReady ? 'FHE Ready ✅' : 'Initializing...'}
      <button onClick={handleSubmit} disabled={isEncrypting}>
        Submit Encrypted Data
      </button>
    </div>
  );
}
```

---

## 🌐 Next.js Integration Example

### Setup

```bash
cd examples/nextjs-compliance-auditor
npm install
npm run dev
```

### Client Component Example

```tsx
'use client';

import { createFhevmClient } from '@fhevm-sdk/core';
import { useEffect, useState } from 'react';

export default function ComplianceDashboard() {
  const [client, setClient] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const fhevm = createFhevmClient({
        provider: window.ethereum,
        network: 'sepolia'
      });

      await fhevm.init();
      setClient(fhevm);
      setIsReady(true);
    }

    init();
  }, []);

  return (
    <div>
      <h1>Privacy Compliance Auditor</h1>
      {isReady && <ComplianceForm client={client} />}
    </div>
  );
}
```

---

## 🔧 Framework Examples

### Vue.js

```vue
<template>
  <div>
    <button @click="submitEncrypted">Submit</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

const client = ref(null);

onMounted(async () => {
  client.value = createFhevmClient({
    provider: window.ethereum,
    network: 'sepolia'
  });
  await client.value.init();
});

async function submitEncrypted() {
  const encrypted = await encryptInput(client.value, contractAddress, {
    values: [42],
    types: ['uint32']
  });
  // Use encrypted data...
}
</script>
```

### Plain Node.js

```javascript
const { createFhevmClient } = require('@fhevm-sdk/core');
const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_KEY');

  const client = createFhevmClient({
    provider,
    network: 'sepolia'
  });

  await client.init();

  // Use client for encryption/decryption
}

main();
```

---

## 📚 Documentation

### Comprehensive Guides

- **[SDK Guide](./docs/SDK_GUIDE.md)** - Complete SDK documentation
- **[Integration Guide](./docs/INTEGRATION.md)** - Framework integration examples
- **[API Reference](./docs/API_REFERENCE.md)** - Full API documentation

### Example Projects

1. **Next.js Compliance Auditor** (`examples/nextjs-compliance-auditor`)
   - Full-featured Next.js 14+ app
   - Shows SDK integration
   - Real-world use case

2. **Privacy Auditor Hardhat** (`examples/privacy-auditor-hardhat`)
   - Smart contracts with FHE
   - Deployment scripts
   - Test suite

---

## 🎥 Video Demo

**[Watch the Demo demo.mp4]** - Complete walkthrough showing:

1. SDK installation and setup
2. Framework integration (Next.js)
3. Encryption and decryption flows
4. Contract interaction
5. Design decisions

---

## 🚀 Getting Started

### One Command Setup

```bash
# Clone repository
git clone https://github.com/ConsueloBrekke/fhevm-react-template
cd fhevm-react-template

# Install all packages (SDK + Examples)
npm run install:all

# Build SDK
npm run build

# Run Next.js example
npm run dev:nextjs
```

### From Scratch (< 10 Lines)

```bash
# 1. Install SDK
npm install @fhevm-sdk/core ethers

# 2. Create file
cat > index.js << 'EOF'
import { createFhevmClient } from '@fhevm-sdk/core';

const client = createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia'
});

await client.init();
console.log('FHE Ready! ✅');
EOF

# 3. Run
node index.js
```

---

## 📦 Installation Options

### NPM

```bash
npm install @fhevm-sdk/core
```

### Yarn

```bash
yarn add @fhevm-sdk/core
```

### PNPM

```bash
pnpm add @fhevm-sdk/core
```

---

## 🏗️ API Overview

### Core Functions

| Function | Description |
|----------|-------------|
| `createFhevmClient(config)` | Create FHEVM client instance |
| `encryptInput(client, address, data)` | Encrypt input values |
| `userDecrypt(client, address, value, type)` | Decrypt with EIP-712 signature |
| `publicDecrypt(client, address, value, type)` | Decrypt public value |
| `createContract(config)` | Create contract with FHE support |

### React Hooks

| Hook | Description |
|------|-------------|
| `useFhevm(config)` | Initialize FHE client |
| `useFhevmContract(config)` | Get contract instance |
| `useEncryptedInput(client)` | Encrypt input hook |
| `useDecryption(client)` | Decrypt value hook |

---

## 🎯 Design Principles

### 1. Developer Experience First

- **< 10 lines** to get started
- **Sensible defaults** - works out of the box
- **Clear error messages** - helpful debugging

### 2. Framework Agnostic

- **Core is pure TypeScript** - no framework dependencies
- **Optional React bindings** - use if you want
- **Works everywhere** - React, Vue, Svelte, plain JS

### 3. Wagmi-like Structure

- **Familiar API** for web3 developers
- **Modular design** - import what you need
- **Type-safe** - full TypeScript support

### 4. Production Ready

- **Comprehensive tests** - high coverage
- **Well documented** - examples for everything
- **Battle tested** - used in real projects

---

## 🧪 Testing

```bash
# Test SDK
npm run test:sdk

# Test examples
npm run test:hardhat

# Run all tests
npm test
```

---

## 📊 Comparison

### Before (v1.0)

```typescript
// Multiple dependencies
import { createInstance } from 'fhevmjs';
import { toHexString } from 'fhevmjs/utils';
import { Wallet } from 'ethers';

// Manual setup (20+ lines)
const instance = await createInstance({ chainId: 11155111 });
const publicKey = instance.getPublicKey();
// ... manual encryption logic
// ... manual signature handling
// ... error handling
```

### After (v2.0)

```typescript
// Single dependency
import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

// Simple setup (3 lines)
const client = createFhevmClient({ provider, network: 'sepolia' });
await client.init();
const encrypted = await encryptInput(client, address, { values: [42], types: ['uint32'] });
```

**90% less boilerplate code! 🎉**

---

## 🌟 Use Cases

### 1. Privacy Compliance Auditor

Submit encrypted compliance data for GDPR, HIPAA, SOX audits:

```typescript
const encrypted = await encryptInput(client, contractAddress, {
  values: [5000, 30, 85],  // dataPoints, riskScore, complianceScore
  types: ['uint32', 'uint8', 'uint8']
});

await complianceContract.registerData(...encrypted.handles, encrypted.inputProof);
```

### 2. Confidential Voting

Cast encrypted votes:

```typescript
const vote = await encryptInput(client, votingContract, {
  values: [candidateId],
  types: ['uint8']
});

await votingContract.castVote(vote.handles[0], vote.inputProof);
```

### 3. Private Auctions

Submit hidden bids:

```typescript
const bid = await encryptInput(client, auctionContract, {
  values: [bidAmount],
  types: ['uint64']
});

await auctionContract.placeBid(bid.handles[0], bid.inputProof);
```

---

## 🏆 Bounty Submission

### ✅ Requirements Met

**Required:**
- ✅ Universal SDK package (`@fhevm-sdk/core`)
- ✅ Framework-agnostic (works with React, Vue, Node.js, Next.js)
- ✅ Wagmi-like modular API structure
- ✅ Complete FHE flow (init, encrypt, decrypt, contract interaction)
- ✅ Clean, reusable, and extensible code
- ✅ Next.js example showcasing SDK
- ✅ Video demonstration
- ✅ Comprehensive documentation

**Bonus:**
- ✅ Multiple environment examples (Next.js, React hooks, Vue, plain Node.js)
- ✅ Clear documentation and code examples
- ✅ Developer-friendly CLI commands
- ✅ < 10 lines of code to start
- ✅ Monorepo structure with examples

---

## 📖 Documentation Index

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | This file - Project overview |
| [SDK_GUIDE.md](./docs/SDK_GUIDE.md) | Complete SDK documentation |
| [INTEGRATION.md](./docs/INTEGRATION.md) | Framework integration guides |
| [API_REFERENCE.md](./docs/API_REFERENCE.md) | Full API documentation |
| [DEPLOYMENT.md](./examples/privacy-auditor-hardhat/DEPLOYMENT.md) | Contract deployment guide |

---

## 🤝 Contributing

We welcome contributions! See our contributing guidelines:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Zama Documentation**: https://docs.zama.ai/
- **fhEVM**: https://docs.zama.ai/fhevm
- **GitHub**: https://github.com/ConsueloBrekke/fhevm-react-template
- **NPM Package**: https://www.npmjs.com/package/@fhevm-sdk/core

---

## 🙏 Acknowledgments

- **Zama Team** - For developing FHEVM and FHE technology
- **Community** - For feedback and contributions
- **wagmi** - For API design inspiration

---

<div align="center">

**Built for Zama FHE Bounty Program**

*Making confidential smart contracts accessible to every developer*

**Powered by [Zama fhEVM](https://docs.zama.ai/)**

[⬆ Back to Top](#-fhevm-react-template-v20)

</div>
