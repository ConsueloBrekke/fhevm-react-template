const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Contract Interaction Script
 * Provides interactive capabilities for the PrivacyComplianceAuditor contract
 *
 * Usage: npx hardhat run scripts/interact.js --network sepolia
 */

async function main() {
  console.log("=== Privacy Compliance Auditor - Contract Interaction ===\n");

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
  console.log("Network:", network.name);
  console.log();

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Interacting as:", signer.address);
  const balance = await signer.provider.getBalance(signer.address);
  console.log("Account Balance:", ethers.formatEther(balance), "ETH\n");

  // Get contract instance
  const PrivacyComplianceAuditor = await ethers.getContractFactory("PrivacyComplianceAuditor");
  const contract = PrivacyComplianceAuditor.attach(contractAddress);

  // Display current contract state
  console.log("=== Current Contract State ===");
  const owner = await contract.owner();
  const regulator = await contract.regulator();
  const auditCount = await contract.getCurrentAuditCount();
  const lastAuditTime = await contract.lastAuditTime();

  console.log("Owner:", owner);
  console.log("Regulator:", regulator);
  console.log("Total Audits:", auditCount.toString());
  console.log("Last Audit Time:", lastAuditTime.toString());
  console.log();

  // Check user's role
  console.log("=== User Role Check ===");
  const isOwner = owner.toLowerCase() === signer.address.toLowerCase();
  const isRegulator = regulator.toLowerCase() === signer.address.toLowerCase();

  let isAuditor = false;
  let isDataController = false;

  try {
    isAuditor = await contract.isAuthorizedAuditor(signer.address);
    isDataController = await contract.isAuthorizedDataController(signer.address);
  } catch (error) {
    console.log("Note: Unable to check auditor/controller status");
  }

  console.log("Your Role(s):");
  if (isOwner) console.log("  ✓ Owner");
  if (isRegulator) console.log("  ✓ Regulator");
  if (isAuditor) console.log("  ✓ Authorized Auditor");
  if (isDataController) console.log("  ✓ Data Controller");
  if (!isOwner && !isRegulator && !isAuditor && !isDataController) {
    console.log("  - Regular User (no special permissions)");
  }
  console.log();

  // Example interactions based on role
  console.log("=== Example Interactions ===\n");

  if (isOwner) {
    console.log("As Owner, you can:");
    console.log("  • Set regulator: await contract.setRegulator(address)");
    console.log("  • Authorize auditors: await contract.authorizeAuditor(address)");
    console.log("  • Revoke auditor authorization: await contract.revokeAuditorAuthorization(address)");
    console.log("  • Authorize data controllers: await contract.authorizeDataController(address)");
    console.log();
  }

  if (isRegulator) {
    console.log("As Regulator, you can:");
    console.log("  • Grant certifications: await contract.grantCertification(entity, standard)");
    console.log("  • Revoke certifications: await contract.revokeCertification(entity, standard)");
    console.log("  • Monitor compliance across organizations");
    console.log();
  }

  if (isAuditor) {
    console.log("As Authorized Auditor, you can:");
    console.log("  • Schedule audits: await contract.scheduleAudit(auditee, standard)");
    console.log("  • Complete audits: await contract.completeAudit(auditId, findings, risk, penalty, remediated)");
    console.log("  • Query compliance status: await contract.getComplianceStatus(address)");
    console.log();
  }

  if (isDataController) {
    console.log("As Data Controller, you can:");
    console.log("  • Register compliance data: await contract.registerComplianceData(...)");
    console.log("  • Register data processing activities: await contract.registerDataProcessingActivity(...)");
    console.log("  • Check your compliance status");
    console.log();
  }

  // Query examples
  console.log("=== Query Functions ===\n");

  console.log("To check compliance status:");
  console.log(`  const status = await contract.getComplianceStatus("${signer.address}");`);
  console.log();

  console.log("To get audit information:");
  console.log(`  const auditInfo = await contract.getAuditInfo(auditId);`);
  console.log();

  console.log("To check certification status:");
  console.log(`  const certified = await contract.getCertificationStatus("${signer.address}", 0); // 0 = GDPR`);
  console.log();

  // Compliance standards reference
  console.log("=== Compliance Standards ===");
  console.log("  0 - GDPR (General Data Protection Regulation)");
  console.log("  1 - CCPA (California Consumer Privacy Act)");
  console.log("  2 - HIPAA (Health Insurance Portability and Accountability Act)");
  console.log("  3 - SOX (Sarbanes-Oxley Act)");
  console.log("  4 - PCI_DSS (Payment Card Industry Data Security Standard)");
  console.log("  5 - ISO27001 (Information Security Management)");
  console.log();

  // Risk levels reference
  console.log("=== Risk Levels ===");
  console.log("  0 - LOW (Minor compliance issues)");
  console.log("  1 - MEDIUM (Moderate violations)");
  console.log("  2 - HIGH (Serious violations)");
  console.log("  3 - CRITICAL (Severe violations with legal implications)");
  console.log();

  // Example transaction: Register compliance data (if data controller)
  if (isDataController) {
    console.log("=== Example: Register Compliance Data ===");
    console.log("Uncomment the following code to register sample compliance data:");
    console.log(`
    /*
    const tx = await contract.registerComplianceData(
      1000,  // dataPoints: 1000 data processing points
      25,    // riskScore: 25/100
      85,    // complianceScore: 85/100
      true,  // hasPersonalData
      false, // hasFinancialData
      false  // hasHealthData
    );
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    */
    `);
  }

  // Example transaction: Schedule audit (if auditor)
  if (isAuditor) {
    console.log("=== Example: Schedule Audit ===");
    console.log("Uncomment the following code to schedule a sample audit:");
    console.log(`
    /*
    const auditeeAddress = "${signer.address}"; // Replace with actual auditee
    const standard = 0; // GDPR

    const tx = await contract.scheduleAudit(auditeeAddress, standard);
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Audit scheduled in block:", receipt.blockNumber);

    // Get the audit ID from the event
    const event = receipt.logs.find(log => {
      try {
        return contract.interface.parseLog(log).name === "AuditScheduled";
      } catch { return false; }
    });
    if (event) {
      const parsed = contract.interface.parseLog(event);
      console.log("Audit ID:", parsed.args.auditId.toString());
    }
    */
    `);
  }

  console.log("\n=== Interaction Summary ===");
  console.log("Contract:", contractAddress);
  console.log("Network:", network.name);
  console.log("Your Address:", signer.address);
  console.log("\nView contract on Etherscan:");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("\nFor more interactions, modify this script or use the web interface.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Interaction failed:", error);
    process.exit(1);
  });
