# Privacy Compliance Auditor - React Application

A decentralized privacy compliance auditing platform powered by Zama's Fully Homomorphic Encryption (FHE) technology, enabling confidential compliance verification while preserving data privacy.

## Overview

This React application demonstrates how to build a privacy-preserving compliance auditing system using the FHEVM SDK. It showcases encrypted data submission, confidential auditing, and privacy-preserving compliance certification.

## Features

- **Encrypted Data Submission**: Submit compliance data in fully encrypted form using FHE technology
- **Confidential Auditing**: Perform compliance checks without revealing sensitive organizational data
- **Privacy-Preserving Results**: Receive compliance certifications while maintaining complete data privacy
- **Multiple Standards**: Support for GDPR, CCPA, HIPAA, SOX, PCI-DSS, and ISO 27001

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **@fhevm-sdk/core** for FHE operations
- **ethers.js v6** for blockchain interactions
- **Zama fhevmjs** for homomorphic encryption

## Project Structure

```
PrivacyComplianceAuditor/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── FeaturesGrid.tsx
│   │   ├── ComplianceStandards.tsx
│   │   └── ComplianceForm.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useFHE.ts       # FHE client initialization
│   │   └── useEncryption.ts # Encryption operations
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   ├── styles.css          # Global styles
│   └── vite-env.d.ts       # TypeScript declarations
├── contracts/              # Smart contracts (Hardhat)
├── scripts/                # Deployment scripts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet
- Access to Sepolia testnet

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:3001`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### 1. Connect Your Wallet

Click the "Connect Wallet" button to connect your MetaMask wallet.

### 2. Initialize FHE Client

The application automatically initializes the FHE client when your wallet is connected.

### 3. Submit Compliance Data

1. Select a compliance standard (GDPR, CCPA, HIPAA, etc.)
2. Enter the number of data points processed
3. Enter risk score (0-100)
4. Enter compliance score (0-100)
5. Click "Submit Encrypted Data"

The data will be encrypted using FHE before submission to the blockchain.

## SDK Integration Example

This application demonstrates the FHEVM SDK integration:

```typescript
import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

// Initialize FHE client
const client = createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia'
});
await client.init();

// Encrypt compliance data
const encrypted = await encryptInput(client, contractAddress, {
  values: [1000, 30, 85],
  types: ['uint32', 'uint8', 'uint8']
});

// Submit to smart contract
await contract.registerData(
  ...encrypted.handles,
  encrypted.inputProof
);
```

## Smart Contract

The Privacy Compliance Auditor smart contract is deployed on Sepolia testnet:

**Contract Address**: `0xf7f80e8BE9823E5D8df70960cECd7f7A24266098`

### Contract Deployment

To deploy your own contract:

```bash
npm run compile
npm run deploy
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint TypeScript files

### Hardhat Commands

- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run deploy` - Deploy to Sepolia

## How It Works

### FHE Workflow

1. **Initialization**: The FHE client initializes with the network provider
2. **Encryption**: User data is encrypted client-side using FHE
3. **Submission**: Encrypted data and proof are sent to the smart contract
4. **Computation**: Smart contract performs operations on encrypted data
5. **Results**: Compliance results are computed without decryption

### Privacy Guarantees

- Data never leaves the user's device unencrypted
- Smart contracts compute on encrypted values
- Auditors can verify compliance without seeing sensitive data
- Results maintain end-to-end encryption

## Supported Compliance Standards

- **GDPR** - General Data Protection Regulation
- **CCPA** - California Consumer Privacy Act
- **HIPAA** - Health Insurance Portability and Accountability Act
- **SOX** - Sarbanes-Oxley Act
- **PCI-DSS** - Payment Card Industry Data Security Standard
- **ISO 27001** - Information Security Management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- **Zama** - For FHEVM technology and fhevmjs library
- **Ethereum Foundation** - For blockchain infrastructure
- **React Team** - For the amazing React framework

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Website](https://www.zama.ai/)
- [fhevmjs GitHub](https://github.com/zama-ai/fhevmjs)
- [React Documentation](https://react.dev/)

## Support

For issues and questions:
- Open an issue on GitHub
- Visit [Zama Discord](https://discord.gg/zama)

---

**Built with Zama FHE Technology**
