# Privacy Auditor Hardhat Example

> Smart contract example for Privacy Compliance Auditor

This example demonstrates the smart contract implementation for privacy-preserving compliance auditing using Zama's FHEVM.

## Features

- **Fully Homomorphic Encryption** - Compute on encrypted data
- **Role-Based Access Control** - Owner, Regulator, Auditors, Data Controllers
- **Privacy-Preserving Compliance** - GDPR, HIPAA, SOX standards
- **Encrypted Audit Trail** - All data remains encrypted on-chain

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Update with your values:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

### 3. Compile Contract

```bash
npm run compile
```

### 4. Deploy to Sepolia

```bash
npm run deploy
```

## Contract Overview

### PrivacyComplianceAuditor.sol

Privacy-preserving compliance auditing contract with FHE encryption.

**Key Features:**

- Encrypted compliance data storage (euint32, euint8, ebool)
- Role-based access control
- Audit lifecycle management
- Certification issuance

**Encrypted Data Types:**

| Field | Type | Description |
|-------|------|-------------|
| `encryptedDataPoints` | `euint32` | Number of data points |
| `encryptedRiskScore` | `euint8` | Risk assessment score (0-100) |
| `encryptedComplianceScore` | `euint8` | Compliance score (0-100) |
| `encryptedGdprCompliant` | `ebool` | GDPR compliance status |
| `encryptedHipaaCompliant` | `ebool` | HIPAA compliance status |
| `encryptedSoxCompliant` | `ebool` | SOX compliance status |

## Usage

### Deploy Contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify Deployment

```bash
npx hardhat run scripts/verify.js --network sepolia
```

### Interact with Contract

```bash
npx hardhat run scripts/interact.js --network sepolia
```

### Run Simulation

```bash
# Start local node
npx hardhat node

# In another terminal
npx hardhat run scripts/simulate.js --network localhost
```

## Integration with SDK

### Frontend Integration

Use the FHEVM SDK to encrypt data before submitting:

```typescript
import { createFhevmClient, encryptInput } from '@fhevm-sdk/core';

// Initialize client
const client = createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia'
});
await client.init();

// Encrypt compliance data
const encrypted = await encryptInput(client, contractAddress, {
  values: [5000, 25, 85, true, true, false],
  types: ['uint32', 'uint8', 'uint8', 'bool', 'bool', 'bool']
});

// Submit to contract
await contract.registerComplianceData(
  encrypted.handles[0], // dataPoints
  encrypted.handles[1], // riskScore
  encrypted.handles[2], // complianceScore
  encrypted.handles[3], // gdprCompliant
  encrypted.handles[4], // hipaaCompliant
  encrypted.handles[5], // soxCompliant
  encrypted.inputProof
);
```

## Contract ABI

The contract ABI is available after compilation:

```bash
cat artifacts/contracts/PrivacyComplianceAuditor.sol/PrivacyComplianceAuditor.json
```

## Testing

Run comprehensive test suite:

```bash
npm test
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile contracts |
| `npm run deploy` | Deploy to Sepolia |
| `npm run verify` | Verify deployment |
| `npm run interact` | Interactive script |
| `npm run simulate` | Simulate full workflow |
| `npm test` | Run test suite |

## Network Configuration

### Sepolia Testnet

```javascript
sepolia: {
  url: process.env.SEPOLIA_RPC_URL,
  chainId: 11155111,
  accounts: [process.env.PRIVATE_KEY]
}
```

### Local Network

```javascript
localhost: {
  url: "http://127.0.0.1:8545",
  chainId: 31337
}
```

## Security

- All sensitive data encrypted with FHE
- Role-based access control enforced
- Input validation on all functions
- Emergency pause mechanism
- Comprehensive test coverage

## Learn More

- **FHEVM SDK**: [../../packages/fhevm-sdk](../../packages/fhevm-sdk)
- **Next.js Example**: [../nextjs-compliance-auditor](../nextjs-compliance-auditor)
- **Documentation**: [../../docs](../../docs)
- **Zama Docs**: [https://docs.zama.ai/](https://docs.zama.ai/)

## License

MIT
