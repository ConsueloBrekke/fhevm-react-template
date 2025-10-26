# Framework Integration Guide

Complete guide for integrating the FHEVM SDK into different JavaScript frameworks.

## Table of Contents

- [React](#react)
- [Next.js](#nextjs)
- [Vue.js](#vuejs)
- [Svelte](#svelte)
- [Plain JavaScript](#plain-javascript)
- [Node.js Backend](#nodejs-backend)
- [TypeScript](#typescript)

---

## React

### Installation

```bash
npm install @fhevm-sdk/core ethers react
```

### Basic Setup

```tsx
// App.tsx
import { useFhevm, useEncryptedInput } from '@fhevm-sdk/core';
import { useState } from 'react';

function App() {
  const [account, setAccount] = useState('');

  // Initialize FHEVM
  const { client, isReady, error } = useFhevm({
    provider: window.ethereum,
    network: 'sepolia'
  });

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    setAccount(accounts[0]);
  };

  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Loading FHE...</div>;

  return (
    <div>
      <h1>FHEVM dApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <SubmitForm client={client} account={account} />
      )}
    </div>
  );
}

function SubmitForm({ client, account }) {
  const [value, setValue] = useState('');
  const { encrypt, isEncrypting } = useEncryptedInput(client);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const encrypted = await encrypt(contractAddress, {
      values: [parseInt(value)],
      types: ['uint32']
    });

    // Use encrypted.handles[0] and encrypted.inputProof
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />
      <button type="submit" disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Submit'}
      </button>
    </form>
  );
}

export default App;
```

### Custom Hook Pattern

```tsx
// hooks/useFhevmContract.ts
import { useState, useEffect } from 'react';
import { createContract, FhevmClientInstance } from '@fhevm-sdk/core';

export function useFhevmContract(
  address: string,
  abi: any[],
  client: FhevmClientInstance | null
) {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!client?.isReady) return;

    const instance = createContract({ address, abi, client });
    setContract(instance);
  }, [client, address, abi]);

  return contract;
}
```

---

## Next.js

### Installation

```bash
npm install @fhevm-sdk/core ethers next react
```

### App Router (Next.js 14+)

```tsx
// app/page.tsx
'use client';

import { useFhevm } from '@fhevm-sdk/core';
import { useState, useEffect } from 'react';

export default function Home() {
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProvider(window.ethereum);
    }
  }, []);

  const { client, isReady } = useFhevm({
    provider: provider || null,
    network: 'sepolia'
  });

  return (
    <main>
      <h1>FHEVM Next.js App</h1>
      {isReady ? <Dashboard client={client} /> : <Loading />}
    </main>
  );
}

function Dashboard({ client }) {
  // Your dashboard component
  return <div>Dashboard</div>;
}

function Loading() {
  return <div>Loading FHE...</div>;
}
```

### Pages Router (Next.js 13-)

```tsx
// pages/index.tsx
import { useState, useEffect } from 'react';
import { createFhevmClient } from '@fhevm-sdk/core';

export default function Home() {
  const [client, setClient] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      const fhevmClient = createFhevmClient({
        provider: window.ethereum,
        network: 'sepolia'
      });

      await fhevmClient.init();
      setClient(fhevmClient);
      setIsReady(true);
    }

    if (typeof window !== 'undefined') {
      init();
    }
  }, []);

  return (
    <div>
      <h1>FHEVM Next.js App</h1>
      {isReady && <Dashboard client={client} />}
    </div>
  );
}
```

### API Route Example

```typescript
// pages/api/decrypt.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createFhevmClient, publicDecrypt } from '@fhevm-sdk/core';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { encryptedValue, contractAddress, type } = req.body;

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const client = createFhevmClient({ provider, network: 'sepolia' });
    await client.init();

    const decrypted = await publicDecrypt(
      client,
      contractAddress,
      encryptedValue,
      type
    );

    res.status(200).json({ value: decrypted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Next.js Config

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

---

## Vue.js

### Installation

```bash
npm install @fhevm-sdk/core ethers vue
```

### Composition API (Vue 3)

```vue
<template>
  <div>
    <h1>FHEVM Vue App</h1>

    <div v-if="!isReady">Loading FHE...</div>

    <div v-else>
      <form @submit.prevent="submitData">
        <input v-model="inputValue" placeholder="Enter value" />
        <button type="submit" :disabled="isEncrypting">
          {{ isEncrypting ? 'Encrypting...' : 'Submit' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

const client = ref(null);
const isReady = ref(false);
const inputValue = ref('');
const isEncrypting = ref(false);

onMounted(async () => {
  const fhevmClient = createFhevmClient({
    provider: window.ethereum,
    network: 'sepolia'
  });

  await fhevmClient.init();
  client.value = fhevmClient;
  isReady.value = true;
});

async function submitData() {
  if (!client.value) return;

  isEncrypting.value = true;

  try {
    const encrypted = await encryptInput(
      client.value,
      contractAddress,
      {
        values: [parseInt(inputValue.value)],
        types: ['uint32']
      }
    );

    // Use encrypted data
    console.log('Encrypted:', encrypted);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    isEncrypting.value = false;
  }
}
</script>
```

### Options API (Vue 2)

```vue
<template>
  <div>
    <h1>FHEVM Vue App</h1>
    <div v-if="isReady">
      <button @click="encrypt">Encrypt Data</button>
    </div>
  </div>
</template>

<script>
import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

export default {
  data() {
    return {
      client: null,
      isReady: false,
    };
  },

  async mounted() {
    this.client = createFhevmClient({
      provider: window.ethereum,
      network: 'sepolia'
    });

    await this.client.init();
    this.isReady = true;
  },

  methods: {
    async encrypt() {
      const encrypted = await encryptInput(
        this.client,
        contractAddress,
        { values: [42], types: ['uint32'] }
      );
      console.log('Encrypted:', encrypted);
    }
  }
};
</script>
```

---

## Svelte

### Installation

```bash
npm install @fhevm-sdk/core ethers svelte
```

### Basic Setup

```svelte
<!-- App.svelte -->
<script>
  import { onMount } from 'svelte';
  import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

  let client = null;
  let isReady = false;
  let inputValue = '';
  let isEncrypting = false;

  onMount(async () => {
    client = createFhevmClient({
      provider: window.ethereum,
      network: 'sepolia'
    });

    await client.init();
    isReady = true;
  });

  async function submitData() {
    if (!client) return;

    isEncrypting = true;

    try {
      const encrypted = await encryptInput(
        client,
        contractAddress,
        {
          values: [parseInt(inputValue)],
          types: ['uint32']
        }
      );

      console.log('Encrypted:', encrypted);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      isEncrypting = false;
    }
  }
</script>

<main>
  <h1>FHEVM Svelte App</h1>

  {#if !isReady}
    <p>Loading FHE...</p>
  {:else}
    <form on:submit|preventDefault={submitData}>
      <input bind:value={inputValue} placeholder="Enter value" />
      <button type="submit" disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Submit'}
      </button>
    </form>
  {/if}
</main>
```

---

## Plain JavaScript

### Browser (ES Modules)

```html
<!DOCTYPE html>
<html>
<head>
  <title>FHEVM App</title>
</head>
<body>
  <h1>FHEVM dApp</h1>
  <input id="value" type="number" placeholder="Enter value" />
  <button id="submit">Submit</button>

  <script type="module">
    import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

    // Initialize client
    const client = createFhevmClient({
      provider: window.ethereum,
      network: 'sepolia'
    });

    await client.init();
    console.log('FHE Ready!');

    // Handle submit
    document.getElementById('submit').addEventListener('click', async () => {
      const value = parseInt(document.getElementById('value').value);

      const encrypted = await encryptInput(client, contractAddress, {
        values: [value],
        types: ['uint32']
      });

      console.log('Encrypted:', encrypted);
    });
  </script>
</body>
</html>
```

### Browser (UMD)

```html
<script src="https://unpkg.com/@fhevm-sdk/core"></script>
<script src="https://unpkg.com/ethers"></script>

<script>
  const { createFhevmClient, encryptInput } = window.FhevmSDK;

  // Initialize
  (async () => {
    const client = createFhevmClient({
      provider: window.ethereum,
      network: 'sepolia'
    });

    await client.init();
    console.log('FHE Ready!');
  })();
</script>
```

---

## Node.js Backend

### Installation

```bash
npm install @fhevm-sdk/core ethers
```

### Basic Server

```javascript
// server.js
import { createFhevmClient, encryptInput, publicDecrypt } from '@fhevm-sdk/core';
import { ethers } from 'ethers';
import express from 'express';

const app = express();
app.use(express.json());

// Initialize FHEVM client
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const client = createFhevmClient({ provider, network: 'sepolia' });
await client.init();

// Encrypt endpoint
app.post('/api/encrypt', async (req, res) => {
  try {
    const { values, types, contractAddress } = req.body;

    const encrypted = await encryptInput(client, contractAddress, {
      values,
      types
    });

    res.json({ encrypted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrypt endpoint
app.post('/api/decrypt', async (req, res) => {
  try {
    const { encryptedValue, contractAddress, type } = req.body;

    const decrypted = await publicDecrypt(
      client,
      contractAddress,
      encryptedValue,
      type
    );

    res.json({ value: decrypted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## TypeScript

### Type Definitions

The SDK includes full TypeScript definitions:

```typescript
import {
  createFhevmClient,
  FhevmClientConfig,
  FhevmClientInstance,
  encryptInput,
  EncryptionInput,
  EncryptedInput,
  decryptValue,
  FheType
} from '@fhevm-sdk/core';
```

### Strongly Typed Usage

```typescript
import { createFhevmClient, FhevmClientInstance } from '@fhevm-sdk/core';
import { ethers } from 'ethers';

class FhevmService {
  private client: FhevmClientInstance | null = null;

  async init(provider: ethers.Provider): Promise<void> {
    this.client = createFhevmClient({
      provider,
      network: 'sepolia'
    });

    await this.client.init();
  }

  async encryptValue(
    contractAddress: string,
    value: number,
    type: 'uint8' | 'uint16' | 'uint32' | 'uint64'
  ): Promise<{ handle: string; proof: string }> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const encrypted = await encryptInput(this.client, contractAddress, {
      values: [value],
      types: [type]
    });

    return {
      handle: encrypted.handles[0],
      proof: encrypted.inputProof
    };
  }
}

// Usage
const service = new FhevmService();
await service.init(window.ethereum);
const encrypted = await service.encryptValue(contractAddress, 42, 'uint32');
```

---

## Best Practices

### 1. Initialize Once

```typescript
// Good - single client instance
const client = createFhevmClient(config);
await client.init();

// Bad - multiple instances
for (let i = 0; i < 10; i++) {
  const client = createFhevmClient(config); // Don't do this
  await client.init();
}
```

### 2. Handle Loading States

```tsx
// Good - show loading
if (!isReady) return <Loading />;
return <Content client={client} />;

// Bad - no loading indicator
return <Content client={client} />; // client might be null
```

### 3. Clean Up Resources

```typescript
// Good - cleanup in useEffect
useEffect(() => {
  const cleanup = listenToEvent(contract, 'MyEvent', handler);
  return cleanup;
}, [contract]);

// Bad - no cleanup
useEffect(() => {
  listenToEvent(contract, 'MyEvent', handler);
}, [contract]); // Memory leak!
```

---

## Next Steps

- **[SDK Guide](./SDK_GUIDE.md)** - Complete SDK documentation
- **[API Reference](./API_REFERENCE.md)** - Full API documentation
- **[Examples](../examples/)** - Working code examples

---

## Support

- **GitHub**: [https://github.com/your-username/fhevm-react-template](https://github.com/your-username/fhevm-react-template)
- **Issues**: [GitHub Issues](https://github.com/your-username/fhevm-react-template/issues)
- **Zama Docs**: [https://docs.zama.ai/](https://docs.zama.ai/)
