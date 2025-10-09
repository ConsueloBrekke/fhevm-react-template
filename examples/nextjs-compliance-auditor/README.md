# Next.js Compliance Auditor Example

> Privacy-preserving compliance auditing with FHEVM SDK

This example demonstrates how to integrate the FHEVM SDK into a Next.js 14+ application for privacy-preserving compliance auditing.

## Features

- **Framework-Agnostic SDK Integration** - Uses `@fhevm-sdk/core`
- **React Hooks** - `useFhevm`, `useEncryptedInput`
- **MetaMask Integration** - Wallet connection and signing
- **FHE Encryption** - Client-side data encryption before submission
- **Real-time UI** - Loading states and transaction tracking

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## SDK Integration Example

### Initialize FHEVM Client

```tsx
import { useFhevm } from '@fhevm-sdk/core';

function App() {
  const { client, isReady, error } = useFhevm({
    provider: window.ethereum,
    network: 'sepolia'
  });

  return isReady ? <Dashboard client={client} /> : <Loading />;
}
```

### Encrypt and Submit Data

```tsx
import { useEncryptedInput } from '@fhevm-sdk/core';

function ComplianceForm({ client }) {
  const { encrypt, isEncrypting } = useEncryptedInput(client);

  const handleSubmit = async () => {
    const encrypted = await encrypt(contractAddress, {
      values: [5000, 25, 85],
      types: ['uint32', 'uint8', 'uint8']
    });

    await contract.submitData(...encrypted.handles, encrypted.inputProof);
  };

  return (
    <button onClick={handleSubmit} disabled={isEncrypting}>
      Submit Encrypted Data
    </button>
  );
}
```

## Project Structure

```
nextjs-compliance-auditor/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page with wallet connection
│   └── globals.css         # Global styles
├── components/
│   └── ComplianceForm.tsx  # Form with FHE encryption
├── lib/                    # Utility functions (if needed)
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── package.json
└── tsconfig.json
```

## Configuration

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_NETWORK=sepolia
```

### Contract Integration

Update `CONTRACT_ADDRESS` and `CONTRACT_ABI` in `components/ComplianceForm.tsx`:

```tsx
const CONTRACT_ADDRESS = '0xYourContractAddress';
const CONTRACT_ABI = [/* Your ABI */];
```

## Usage Flow

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Initialize FHE** - Client automatically initializes
3. **Fill Form** - Enter compliance data
4. **Encrypt & Submit** - Data encrypted on client-side
5. **Track Transaction** - View on Etherscan

## Key Components

### `app/page.tsx`

- MetaMask connection
- FHEVM client initialization
- Account management

### `components/ComplianceForm.tsx`

- Form inputs for compliance data
- FHE encryption using SDK
- Contract interaction
- Transaction tracking

## SDK Features Used

- ✅ `createFhevmClient()` - Client initialization
- ✅ `useFhevm()` - React hook for FHE client
- ✅ `useEncryptedInput()` - React hook for encryption
- ✅ `encryptInput()` - Encrypt multiple values
- ✅ Input proof generation
- ✅ Type-safe encryption (uint32, uint8, bool)

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel deploy
```

## Requirements

- Node.js 18+
- MetaMask or compatible wallet
- Sepolia testnet ETH

## Learn More

- **FHEVM SDK Guide**: [../../docs/SDK_GUIDE.md](../../docs/SDK_GUIDE.md)
- **Integration Guide**: [../../docs/INTEGRATION.md](../../docs/INTEGRATION.md)
- **API Reference**: [../../docs/API_REFERENCE.md](../../docs/API_REFERENCE.md)
- **Smart Contract**: [../privacy-auditor-hardhat](../privacy-auditor-hardhat)

## License

MIT
