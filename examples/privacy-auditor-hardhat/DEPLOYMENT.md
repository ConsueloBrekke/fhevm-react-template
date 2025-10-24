# Privacy Compliance Auditor - Deployment Guide

Complete deployment documentation for the Privacy Compliance Auditor smart contract on Sepolia testnet.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Contract Compilation](#contract-compilation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contract Verification](#contract-verification)
- [Interaction](#interaction)
- [Network Information](#network-information)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying the Privacy Compliance Auditor contract, ensure you have:

### Required Software
- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git** (for version control)
- **MetaMask** or another Web3 wallet

### Required Accounts
- Ethereum wallet with private key
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- Etherscan API key (get from [Etherscan](https://etherscan.io/apis))
- Infura/Alchemy RPC endpoint (optional, for reliable connections)

### Minimum Requirements
- **Sepolia ETH**: ~0.05 ETH for deployment and initial transactions
- **Node Memory**: 2GB RAM minimum
- **Disk Space**: 500MB free space

---

## Environment Setup

### 1. Install Dependencies

```bash
cd D:\
npm install
```

This will install:
- `hardhat` - Ethereum development environment
- `@nomicfoundation/hardhat-toolbox` - Essential Hardhat plugins
- `@fhevm/solidity` - Zama FHE library for encrypted computations
- `dotenv` - Environment variable management

### 2. Create Environment File

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Sepolia Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Etherscan Configuration
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Gas Settings
GAS_PRICE=20000000000
GAS_LIMIT=8000000
```

### 3. Security Best Practices

**IMPORTANT SECURITY NOTES:**

- ✅ **Never commit `.env` file** to version control
- ✅ **Use a dedicated deployment wallet** (not your main wallet)
- ✅ **Keep private keys secure** and never share them
- ✅ **Use hardware wallets** for production deployments
- ✅ **Verify `.gitignore`** includes `.env`

Check `.gitignore`:
```bash
cat .gitignore | grep .env
```

---

## Contract Compilation

### Compile Smart Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Compilation Details

- **Solidity Version**: 0.8.24
- **Optimizer**: Enabled (200 runs)
- **Output**: `artifacts/` and `cache/` directories
- **Contract**: `PrivacyComplianceAuditor.sol`

### Clean Build (if needed)

```bash
npm run clean
npm run compile
```

---

## Testing

### Local Testing

Start a local Hardhat network:

```bash
# Terminal 1: Start local node
npm run node
```

Run simulation on local network:

```bash
# Terminal 2: Run simulation
npm run simulate
```

The simulation script will:
- Deploy the contract locally
- Set up roles (Owner, Regulator, Auditors, Data Controllers)
- Register sample compliance data
- Schedule and complete audits
- Grant certifications
- Demonstrate full workflow

### Test Coverage

```bash
npm run test:coverage
```

---

## Deployment

### Deploy to Sepolia Testnet

```bash
npm run deploy
```

### Deployment Process

The deployment script (`scripts/deploy.js`) performs the following:

1. **Connects to Sepolia** using your RPC URL
2. **Checks deployer balance** (requires ~0.02-0.05 ETH)
3. **Deploys PrivacyComplianceAuditor** contract
4. **Waits for confirmation** (1 block confirmation)
5. **Verifies deployment** by querying contract state
6. **Saves deployment information** to `deployment-info.json`

### Expected Output

```
Deploying Privacy Compliance Auditor contract...
Deploying with account: 0xYourAddressHere
Account balance: 0.5 ETH

PrivacyComplianceAuditor deployed to: 0xContractAddressHere
Contract owner: 0xYourAddressHere
Contract regulator: 0xYourAddressHere
Initial audit count: 0

=== Deployment Summary ===
Contract Address: 0xContractAddressHere
Network: sepolia
Deployer: 0xYourAddressHere
Gas Used: Check transaction receipt

Deployment info saved to deployment-info.json
```

### Deployment Information

After deployment, check `deployment-info.json`:

```json
{
  "contractAddress": "0xf7f80e8BE9823E5D8df70960cECd7f7A24266098",
  "network": "sepolia",
  "deployer": "0xYourAddress",
  "deploymentTime": "2024-09-26T10:00:00.000Z",
  "blockNumber": 12345678
}
```

### Deployment Costs

Estimated gas costs on Sepolia (at 20 gwei):
- **Contract Deployment**: ~3,500,000 gas (~0.07 ETH)
- **Total Cost**: ~0.07 ETH + buffer

---

## Contract Verification

### Automatic Verification

Verify the deployed contract state:

```bash
npm run verify
```

This will:
- ✅ Check contract code exists on-chain
- ✅ Verify contract owner
- ✅ Verify regulator address
- ✅ Verify audit count
- ✅ Check all contract functions

### Etherscan Source Verification

Verify contract source code on Etherscan:

```bash
npm run etherscan:verify -- 0xYourContractAddress
```

Or manually:

```bash
npx hardhat verify --network sepolia 0xYourContractAddress
```

### Manual Verification on Etherscan

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Enter your contract address
3. Click "Contract" → "Verify and Publish"
4. Select:
   - Compiler: v0.8.24
   - Optimization: Yes (200 runs)
   - License: MIT
5. Upload flattened source code
6. Verify

---

## Interaction

### Using Interaction Script

```bash
npm run interact
```

The interaction script provides:
- Current contract state
- Your role(s) in the system
- Available functions based on your role
- Example transactions
- Query examples

### Role-Based Functions

#### As Owner
```javascript
// Set regulator
await contract.setRegulator("0xRegulatorAddress");

// Authorize auditor
await contract.authorizeAuditor("0xAuditorAddress");

// Authorize data controller
await contract.authorizeDataController("0xCompanyAddress");
```

#### As Regulator
```javascript
// Grant certification
await contract.grantCertification("0xEntityAddress", 0); // 0 = GDPR

// Revoke certification
await contract.revokeCertification("0xEntityAddress", 0);
```

#### As Auditor
```javascript
// Schedule audit
const tx = await contract.scheduleAudit("0xAuditeeAddress", 0); // 0 = GDPR
const receipt = await tx.wait();

// Complete audit
await contract.completeAudit(
  auditId,
  5,      // findings count
  1,      // risk level: MEDIUM
  10000,  // penalty amount
  true    // remediated
);
```

#### As Data Controller
```javascript
// Register compliance data
await contract.registerComplianceData(
  1000,  // data points
  25,    // risk score (0-100)
  85,    // compliance score (0-100)
  true,  // has personal data
  false, // has financial data
  false  // has health data
);

// Register data processing activity
await contract.registerDataProcessingActivity(
  activityId,
  2,      // processing purpose
  50000,  // data subject count
  12,     // retention period (months)
  true,   // consent obtained
  true,   // data minimized
  true    // security measures
);
```

### Query Functions

```javascript
// Get compliance status
const status = await contract.getComplianceStatus("0xAddress");

// Get audit information
const auditInfo = await contract.getAuditInfo(auditId);

// Check certification status
const certified = await contract.getCertificationStatus("0xAddress", 0); // GDPR
```

---

## Network Information

### Sepolia Testnet Deployment

**Contract Address**: `0xf7f80e8BE9823E5D8df70960cECd7f7A24266098`

**Network Details**:
- **Network Name**: Sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Block Explorer**: https://sepolia.etherscan.io/
- **Testnet Faucet**: https://sepoliafaucet.com/

**Etherscan Links**:
- **Contract**: https://sepolia.etherscan.io/address/0xf7f80e8BE9823E5D8df70960cECd7f7A24266098
- **Verified Contract**: https://sepolia.etherscan.io/address/0xf7f80e8BE9823E5D8df70960cECd7f7A24266098#code
- **Transactions**: https://sepolia.etherscan.io/address/0xf7f80e8BE9823E5D8df70960cECd7f7A24266098#transactions

### Contract Configuration

- **Owner**: Deployer address (has admin privileges)
- **Regulator**: Initially set to owner (can be changed)
- **Compiler Version**: Solidity 0.8.24
- **Optimization**: Enabled (200 runs)
- **License**: MIT

---

## Compliance Standards Reference

The contract supports the following compliance standards:

| ID | Standard | Description |
|----|----------|-------------|
| 0 | GDPR | General Data Protection Regulation (EU) |
| 1 | CCPA | California Consumer Privacy Act (US) |
| 2 | HIPAA | Health Insurance Portability and Accountability Act (US) |
| 3 | SOX | Sarbanes-Oxley Act (US Financial) |
| 4 | PCI_DSS | Payment Card Industry Data Security Standard |
| 5 | ISO27001 | Information Security Management |

### Risk Levels

| ID | Level | Description |
|----|-------|-------------|
| 0 | LOW | Minor compliance issues |
| 1 | MEDIUM | Moderate violations requiring attention |
| 2 | HIGH | Serious violations requiring immediate action |
| 3 | CRITICAL | Severe violations with legal implications |

---

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds" Error

**Problem**: Not enough ETH for deployment

**Solution**:
```bash
# Check balance
npm run interact

# Get testnet ETH from faucet
# Visit: https://sepoliafaucet.com/
```

#### 2. "Invalid API Key" Error

**Problem**: Etherscan API key not configured

**Solution**:
- Get API key from https://etherscan.io/apis
- Add to `.env` file: `ETHERSCAN_API_KEY=your_key`

#### 3. "Network Connection Failed"

**Problem**: RPC endpoint not responding

**Solution**:
- Try alternative RPC: `https://rpc.sepolia.org`
- Use Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

#### 4. "Nonce Too Low" Error

**Problem**: Transaction nonce mismatch

**Solution**:
```bash
# Reset MetaMask nonce in Settings → Advanced → Reset Account
# Or wait for network to sync
```

#### 5. Compilation Errors

**Problem**: Solidity version mismatch

**Solution**:
```bash
npm run clean
npm install
npm run compile
```

### Getting Help

- **Hardhat Documentation**: https://hardhat.org/docs
- **Zama FHE Docs**: https://docs.zama.ai/
- **Etherscan Support**: https://info.etherscan.com/etherscan-apis/
- **GitHub Issues**: Open an issue in the repository

---

## Script Commands Reference

### Quick Reference

```bash
# Development
npm run compile          # Compile contracts
npm run clean           # Clean artifacts
npm run node            # Start local node

# Testing
npm run test            # Run tests
npm run test:coverage   # Run coverage
npm run simulate        # Run simulation on localhost

# Deployment
npm run deploy          # Deploy to Sepolia
npm run deploy:localhost # Deploy to localhost

# Verification
npm run verify          # Verify deployed contract
npm run etherscan:verify # Verify source on Etherscan

# Interaction
npm run interact        # Interact with contract
npm run interact:localhost # Interact on localhost
```

---

## Security Considerations

### Pre-Deployment Checklist

- [ ] `.env` file configured with correct values
- [ ] `.env` file added to `.gitignore`
- [ ] Deployment wallet has sufficient testnet ETH
- [ ] Contract compiled successfully
- [ ] Tests passed (if any)
- [ ] Network configuration verified
- [ ] Etherscan API key configured (for verification)

### Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Deployment info saved to `deployment-info.json`
- [ ] Contract verified on Etherscan
- [ ] Contract ownership verified
- [ ] Initial configuration completed
- [ ] Regulator address set
- [ ] Auditors authorized
- [ ] Data controllers authorized

---

## Mainnet Deployment (Future)

**IMPORTANT**: This is a testnet deployment. For mainnet deployment:

1. **Audit the contract** with professional security auditors
2. **Test extensively** on testnets
3. **Use hardware wallet** for deployment
4. **Set appropriate gas limits** and prices
5. **Have emergency pause mechanism** ready
6. **Prepare comprehensive documentation**
7. **Set up monitoring** and alerts
8. **Have incident response plan**

**DO NOT deploy to mainnet without proper security audits and testing.**

---

## Support & Resources

### Documentation
- **Project README**: [README.md](./README.md)
- **Hardhat Config**: [hardhat.config.js](./hardhat.config.js)
- **Contract Source**: [contracts/PrivacyComplianceAuditor.sol](./contracts/PrivacyComplianceAuditor.sol)

### External Resources
- **Hardhat**: https://hardhat.org/
- **Zama FHE**: https://docs.zama.ai/
- **Sepolia Testnet**: https://sepolia.dev/
- **Etherscan**: https://sepolia.etherscan.io/

### Community
- **GitHub Repository**: https://github.com/ConsueloBrekke/PrivacyComplianceAuditor
- **Live Demo**: https://privacy-compliance-auditor.vercel.app/

---

## License

This project is licensed under the MIT License.

---

**Built with Hardhat and Zama FHE Technology**

*Privacy-Preserving Compliance for a Decentralized Future*
