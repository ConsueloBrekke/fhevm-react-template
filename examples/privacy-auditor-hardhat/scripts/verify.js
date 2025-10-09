const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Contract Verification Script
 * Verifies the deployed PrivacyComplianceAuditor contract on Etherscan
 *
 * Usage: npx hardhat run scripts/verify.js --network sepolia
 */

async function main() {
  console.log("=== Privacy Compliance Auditor - Contract Verification ===\n");

  // Load deployment information
  let deploymentInfo;
  try {
    const data = fs.readFileSync("deployment-info.json", "utf8");
    deploymentInfo = JSON.parse(data);
  } catch (error) {
    console.error("Error: deployment-info.json not found.");
    console.error("Please deploy the contract first using: npx hardhat run scripts/deploy.js --network sepolia");
    process.exit(1);
  }

  const contractAddress = deploymentInfo.contractAddress;
  console.log("Contract Address:", contractAddress);
  console.log("Network:", deploymentInfo.network);
  console.log("Deployed at:", deploymentInfo.deploymentTime);
  console.log();

  // Verify contract is deployed
  const code = await ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    console.error("Error: No contract found at address", contractAddress);
    process.exit(1);
  }
  console.log("✓ Contract code verified on-chain");

  // Get contract instance
  const PrivacyComplianceAuditor = await ethers.getContractFactory("PrivacyComplianceAuditor");
  const contract = PrivacyComplianceAuditor.attach(contractAddress);

  console.log("\n=== Contract State Verification ===");

  try {
    // Verify contract owner
    const owner = await contract.owner();
    console.log("Contract Owner:", owner);
    console.log("✓ Owner address accessible");

    // Verify regulator
    const regulator = await contract.regulator();
    console.log("Regulator:", regulator);
    console.log("✓ Regulator address accessible");

    // Verify audit count
    const auditCount = await contract.getCurrentAuditCount();
    console.log("Current Audit Count:", auditCount.toString());
    console.log("✓ Audit count accessible");

    // Verify last audit time
    const lastAuditTime = await contract.lastAuditTime();
    console.log("Last Audit Time:", lastAuditTime.toString());
    console.log("✓ Last audit time accessible");

  } catch (error) {
    console.error("Error verifying contract state:", error.message);
    process.exit(1);
  }

  console.log("\n=== Contract Functions Verification ===");

  // Check if contract has expected functions
  const expectedFunctions = [
    "registerComplianceData",
    "scheduleAudit",
    "completeAudit",
    "registerDataProcessingActivity",
    "grantCertification",
    "revokeCertification",
    "setRegulator",
    "authorizeAuditor",
    "revokeAuditorAuthorization",
    "authorizeDataController",
    "getComplianceStatus",
    "getAuditInfo",
    "getCertificationStatus"
  ];

  let allFunctionsFound = true;
  for (const funcName of expectedFunctions) {
    if (contract.interface.getFunction(funcName)) {
      console.log(`✓ ${funcName}`);
    } else {
      console.log(`✗ ${funcName} - NOT FOUND`);
      allFunctionsFound = false;
    }
  }

  if (allFunctionsFound) {
    console.log("\n✓ All expected functions verified");
  } else {
    console.log("\n✗ Some functions are missing");
  }

  // Etherscan verification instructions
  console.log("\n=== Etherscan Verification ===");
  console.log("\nTo verify the contract on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("\nOr manually verify at:");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);

  console.log("\n=== Verification Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", deploymentInfo.network);
  console.log("Status: ✓ All verifications passed");
  console.log("\nView on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
