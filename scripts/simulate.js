const { ethers } = require("hardhat");

/**
 * Simulation Script for Privacy Compliance Auditor
 * Simulates complete audit workflow with sample data
 *
 * Usage: npx hardhat run scripts/simulate.js --network localhost
 * Note: Run on local network for testing. Use 'npx hardhat node' first.
 */

async function main() {
  console.log("=== Privacy Compliance Auditor - Simulation ===\n");

  // Get signers for different roles
  const [owner, regulator, auditor1, auditor2, company1, company2, user] = await ethers.getSigners();

  console.log("=== Setting up Roles ===");
  console.log("Owner:", owner.address);
  console.log("Regulator:", regulator.address);
  console.log("Auditor 1:", auditor1.address);
  console.log("Auditor 2:", auditor2.address);
  console.log("Company 1:", company1.address);
  console.log("Company 2:", company2.address);
  console.log("Regular User:", user.address);
  console.log();

  // Deploy contract
  console.log("=== Deploying Contract ===");
  const PrivacyComplianceAuditor = await ethers.getContractFactory("PrivacyComplianceAuditor");
  const contract = await PrivacyComplianceAuditor.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log("Contract deployed to:", contractAddress);
  console.log();

  // Setup roles
  console.log("=== Configuring Roles ===");

  // Set regulator
  let tx = await contract.connect(owner).setRegulator(regulator.address);
  await tx.wait();
  console.log("✓ Regulator set:", regulator.address);

  // Authorize auditors
  tx = await contract.connect(owner).authorizeAuditor(auditor1.address);
  await tx.wait();
  console.log("✓ Auditor 1 authorized:", auditor1.address);

  tx = await contract.connect(owner).authorizeAuditor(auditor2.address);
  await tx.wait();
  console.log("✓ Auditor 2 authorized:", auditor2.address);

  // Authorize data controllers
  tx = await contract.connect(owner).authorizeDataController(company1.address);
  await tx.wait();
  console.log("✓ Company 1 authorized as data controller:", company1.address);

  tx = await contract.connect(owner).authorizeDataController(company2.address);
  await tx.wait();
  console.log("✓ Company 2 authorized as data controller:", company2.address);
  console.log();

  // Simulate Company 1 registering compliance data
  console.log("=== Company 1: Register Compliance Data ===");
  tx = await contract.connect(company1).registerComplianceData(
    5000,  // dataPoints: 5000 processing points
    30,    // riskScore: 30/100 (low-medium risk)
    85,    // complianceScore: 85/100 (good compliance)
    true,  // hasPersonalData
    true,  // hasFinancialData
    false  // hasHealthData
  );
  let receipt = await tx.wait();
  console.log("✓ Compliance data registered");
  console.log("  - Data Points: 5000");
  console.log("  - Risk Score: 30/100");
  console.log("  - Compliance Score: 85/100");
  console.log("  - Data Types: Personal, Financial");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Simulate Company 1 registering data processing activity
  console.log("=== Company 1: Register Data Processing Activity ===");
  const activityId = ethers.id("CUSTOMER_ANALYTICS_2024");
  tx = await contract.connect(company1).registerDataProcessingActivity(
    activityId,
    2,      // processingPurpose: 2 (Analytics)
    50000,  // dataSubjectCount: 50,000 users
    12,     // retentionPeriod: 12 months
    true,   // consentObtained
    true,   // dataMinimized
    true    // securityMeasures
  );
  receipt = await tx.wait();
  console.log("✓ Data processing activity registered");
  console.log("  - Activity: Customer Analytics");
  console.log("  - Data Subjects: 50,000");
  console.log("  - Retention: 12 months");
  console.log("  - Compliance: Consent ✓, Data Minimization ✓, Security ✓");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Simulate Company 2 with health data
  console.log("=== Company 2: Register Compliance Data (Healthcare) ===");
  tx = await contract.connect(company2).registerComplianceData(
    3000,  // dataPoints: 3000 processing points
    45,    // riskScore: 45/100 (medium risk)
    78,    // complianceScore: 78/100 (acceptable)
    true,  // hasPersonalData
    false, // hasFinancialData
    true   // hasHealthData
  );
  receipt = await tx.wait();
  console.log("✓ Healthcare compliance data registered");
  console.log("  - Data Points: 3000");
  console.log("  - Risk Score: 45/100");
  console.log("  - Compliance Score: 78/100");
  console.log("  - Data Types: Personal, Health");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Schedule GDPR audit for Company 1
  console.log("=== Auditor 1: Schedule GDPR Audit for Company 1 ===");
  tx = await contract.connect(auditor1).scheduleAudit(
    company1.address,
    0  // ComplianceStandard.GDPR
  );
  receipt = await tx.wait();

  // Extract audit ID from event
  let auditId1;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === "AuditScheduled") {
        auditId1 = parsed.args.auditId;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  console.log("✓ GDPR audit scheduled");
  console.log("  - Audit ID:", auditId1.toString());
  console.log("  - Auditee:", company1.address);
  console.log("  - Standard: GDPR");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Schedule HIPAA audit for Company 2
  console.log("=== Auditor 2: Schedule HIPAA Audit for Company 2 ===");
  tx = await contract.connect(auditor2).scheduleAudit(
    company2.address,
    2  // ComplianceStandard.HIPAA
  );
  receipt = await tx.wait();

  let auditId2;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === "AuditScheduled") {
        auditId2 = parsed.args.auditId;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  console.log("✓ HIPAA audit scheduled");
  console.log("  - Audit ID:", auditId2.toString());
  console.log("  - Auditee:", company2.address);
  console.log("  - Standard: HIPAA");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Complete Company 1 audit with good results
  console.log("=== Auditor 1: Complete GDPR Audit (Passed) ===");
  tx = await contract.connect(auditor1).completeAudit(
    auditId1,
    3,      // findingsCount: 3 minor findings
    0,      // riskLevel: LOW
    0,      // penaltyAmount: 0 (no penalty)
    true    // remediated: issues fixed
  );
  receipt = await tx.wait();
  console.log("✓ Audit completed successfully");
  console.log("  - Findings: 3 (minor issues)");
  console.log("  - Risk Level: LOW");
  console.log("  - Penalty: 0 ETH");
  console.log("  - Status: Remediated");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Grant GDPR certification to Company 1
  console.log("=== Regulator: Grant GDPR Certification to Company 1 ===");
  tx = await contract.connect(regulator).grantCertification(
    company1.address,
    0  // ComplianceStandard.GDPR
  );
  receipt = await tx.wait();
  console.log("✓ GDPR certification granted");
  console.log("  - Entity:", company1.address);
  console.log("  - Standard: GDPR");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Complete Company 2 audit with violations
  console.log("=== Auditor 2: Complete HIPAA Audit (Violations Found) ===");
  tx = await contract.connect(auditor2).completeAudit(
    auditId2,
    8,      // findingsCount: 8 violations
    2,      // riskLevel: HIGH
    50000,  // penaltyAmount: 50,000 (in contract units)
    false   // remediated: not yet fixed
  );
  receipt = await tx.wait();
  console.log("✓ Audit completed with violations");
  console.log("  - Findings: 8 violations");
  console.log("  - Risk Level: HIGH");
  console.log("  - Penalty: 50,000");
  console.log("  - Status: Awaiting remediation");
  console.log("  - Transaction hash:", receipt.hash);
  console.log();

  // Query audit information
  console.log("=== Query Audit Information ===");
  const audit1Info = await contract.getAuditInfo(auditId1);
  console.log("Audit ID:", auditId1.toString());
  console.log("  - Auditee:", audit1Info.auditee);
  console.log("  - Auditor:", audit1Info.auditor);
  console.log("  - Standard:", audit1Info.standard);
  console.log("  - Status:", audit1Info.status);
  console.log();

  const audit2Info = await contract.getAuditInfo(auditId2);
  console.log("Audit ID:", auditId2.toString());
  console.log("  - Auditee:", audit2Info.auditee);
  console.log("  - Auditor:", audit2Info.auditor);
  console.log("  - Standard:", audit2Info.standard);
  console.log("  - Status:", audit2Info.status);
  console.log();

  // Check certification status
  console.log("=== Certification Status ===");
  const company1Certified = await contract.getCertificationStatus(company1.address, 0);
  console.log("Company 1 GDPR Certification:", company1Certified ? "✓ Certified" : "✗ Not Certified");

  const company2Certified = await contract.getCertificationStatus(company2.address, 2);
  console.log("Company 2 HIPAA Certification:", company2Certified ? "✓ Certified" : "✗ Not Certified");
  console.log();

  // Get current audit count
  const totalAudits = await contract.getCurrentAuditCount();
  console.log("=== Summary Statistics ===");
  console.log("Total Audits Conducted:", totalAudits.toString());
  console.log("Active Auditors:", "2");
  console.log("Registered Data Controllers:", "2");
  console.log("Certifications Granted:", "1 (GDPR)");
  console.log();

  console.log("=== Simulation Complete ===");
  console.log("Contract Address:", contractAddress);
  console.log("\nThe simulation demonstrated:");
  console.log("  ✓ Role-based access control (Owner, Regulator, Auditors, Data Controllers)");
  console.log("  ✓ Compliance data registration with encrypted FHE data");
  console.log("  ✓ Data processing activity registry (GDPR compliance)");
  console.log("  ✓ Audit scheduling and completion workflow");
  console.log("  ✓ Risk assessment and penalty calculation");
  console.log("  ✓ Certification management by regulator");
  console.log("  ✓ Multi-standard compliance (GDPR, HIPAA)");
  console.log("\nAll operations completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Simulation failed:", error);
    process.exit(1);
  });
