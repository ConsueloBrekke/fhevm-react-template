const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Privacy Compliance Auditor - Test Suite
 *
 * Test coverage includes:
 * - Deployment and initialization
 * - Role-based access control
 * - Compliance data registration
 * - Audit lifecycle (schedule, complete)
 * - Data processing activity registry
 * - Certification management
 * - Edge cases and boundary conditions
 */

describe("PrivacyComplianceAuditor", function () {
  let contract;
  let contractAddress;
  let owner, regulator, auditor1, auditor2, company1, company2, user;

  // Deploy fixture for each test
  async function deployFixture() {
    const PrivacyComplianceAuditor = await ethers.getContractFactory("PrivacyComplianceAuditor");
    const contract = await PrivacyComplianceAuditor.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress };
  }

  before(async function () {
    // Get test accounts
    [owner, regulator, auditor1, auditor2, company1, company2, user] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy fresh contract for each test
    ({ contract, contractAddress } = await deployFixture());
  });

  // ===========================================
  // 1. DEPLOYMENT AND INITIALIZATION TESTS
  // ===========================================

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set deployer as owner", async function () {
      const contractOwner = await contract.owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("should set deployer as initial regulator", async function () {
      const contractRegulator = await contract.regulator();
      expect(contractRegulator).to.equal(owner.address);
    });

    it("should initialize audit count to zero", async function () {
      const auditCount = await contract.getCurrentAuditCount();
      expect(auditCount).to.equal(0);
    });

    it("should initialize last audit time to zero", async function () {
      const lastAuditTime = await contract.lastAuditTime();
      expect(lastAuditTime).to.equal(0);
    });

    it("should have valid contract address", async function () {
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
      expect(contractAddress).to.match(/^0x[0-9a-fA-F]{40}$/);
    });
  });

  // ===========================================
  // 2. ACCESS CONTROL TESTS
  // ===========================================

  describe("Access Control - Owner Functions", function () {
    it("should allow owner to set regulator", async function () {
      await expect(
        contract.connect(owner).setRegulator(regulator.address)
      ).to.not.be.reverted;

      const newRegulator = await contract.regulator();
      expect(newRegulator).to.equal(regulator.address);
    });

    it("should reject non-owner setting regulator", async function () {
      await expect(
        contract.connect(user).setRegulator(regulator.address)
      ).to.be.reverted;
    });

    it("should allow owner to authorize auditor", async function () {
      await expect(
        contract.connect(owner).authorizeAuditor(auditor1.address)
      ).to.not.be.reverted;

      const isAuthorized = await contract.isAuthorizedAuditor(auditor1.address);
      expect(isAuthorized).to.be.true;
    });

    it("should reject non-owner authorizing auditor", async function () {
      await expect(
        contract.connect(user).authorizeAuditor(auditor1.address)
      ).to.be.reverted;
    });

    it("should allow owner to revoke auditor authorization", async function () {
      // First authorize
      await contract.connect(owner).authorizeAuditor(auditor1.address);

      // Then revoke
      await expect(
        contract.connect(owner).revokeAuditorAuthorization(auditor1.address)
      ).to.not.be.reverted;

      const isAuthorized = await contract.isAuthorizedAuditor(auditor1.address);
      expect(isAuthorized).to.be.false;
    });

    it("should allow owner to authorize data controller", async function () {
      await expect(
        contract.connect(owner).authorizeDataController(company1.address)
      ).to.not.be.reverted;

      const isAuthorized = await contract.isAuthorizedDataController(company1.address);
      expect(isAuthorized).to.be.true;
    });

    it("should reject non-owner authorizing data controller", async function () {
      await expect(
        contract.connect(user).authorizeDataController(company1.address)
      ).to.be.reverted;
    });
  });

  describe("Access Control - Regulator Functions", function () {
    beforeEach(async function () {
      // Set regulator for these tests
      await contract.connect(owner).setRegulator(regulator.address);
    });

    it("should allow regulator to grant certification", async function () {
      await expect(
        contract.connect(regulator).grantCertification(company1.address, 0) // GDPR
      ).to.not.be.reverted;

      const isCertified = await contract.getCertificationStatus(company1.address, 0);
      expect(isCertified).to.be.true;
    });

    it("should reject non-regulator granting certification", async function () {
      await expect(
        contract.connect(user).grantCertification(company1.address, 0)
      ).to.be.reverted;
    });

    it("should allow regulator to revoke certification", async function () {
      // First grant
      await contract.connect(regulator).grantCertification(company1.address, 0);

      // Then revoke
      await expect(
        contract.connect(regulator).revokeCertification(company1.address, 0)
      ).to.not.be.reverted;

      const isCertified = await contract.getCertificationStatus(company1.address, 0);
      expect(isCertified).to.be.false;
    });
  });

  // ===========================================
  // 3. COMPLIANCE DATA REGISTRATION TESTS
  // ===========================================

  describe("Compliance Data Registration", function () {
    beforeEach(async function () {
      // Authorize company1 as data controller
      await contract.connect(owner).authorizeDataController(company1.address);
    });

    it("should allow data controller to register compliance data", async function () {
      await expect(
        contract.connect(company1).registerComplianceData(
          1000,  // dataPoints
          30,    // riskScore
          85,    // complianceScore
          true,  // hasPersonalData
          false, // hasFinancialData
          false  // hasHealthData
        )
      ).to.not.be.reverted;
    });

    it("should reject non-controller registering compliance data", async function () {
      await expect(
        contract.connect(user).registerComplianceData(
          1000, 30, 85, true, false, false
        )
      ).to.be.reverted;
    });

    it("should handle compliance data with all data types", async function () {
      await expect(
        contract.connect(company1).registerComplianceData(
          5000,  // dataPoints
          60,    // riskScore
          70,    // complianceScore
          true,  // hasPersonalData
          true,  // hasFinancialData
          true   // hasHealthData
        )
      ).to.not.be.reverted;
    });

    it("should handle zero risk score", async function () {
      await expect(
        contract.connect(company1).registerComplianceData(
          100, 0, 100, false, false, false
        )
      ).to.not.be.reverted;
    });

    it("should handle maximum risk score", async function () {
      await expect(
        contract.connect(company1).registerComplianceData(
          100, 100, 0, true, true, true
        )
      ).to.not.be.reverted;
    });
  });

  // ===========================================
  // 4. DATA PROCESSING ACTIVITY TESTS
  // ===========================================

  describe("Data Processing Activity Registry", function () {
    beforeEach(async function () {
      await contract.connect(owner).authorizeDataController(company1.address);
    });

    it("should allow data controller to register processing activity", async function () {
      const activityId = ethers.id("CUSTOMER_ANALYTICS_2024");

      await expect(
        contract.connect(company1).registerDataProcessingActivity(
          activityId,
          2,      // processingPurpose
          50000,  // dataSubjectCount
          12,     // retentionPeriod
          true,   // consentObtained
          true,   // dataMinimized
          true    // securityMeasures
        )
      ).to.not.be.reverted;
    });

    it("should reject non-controller registering activity", async function () {
      const activityId = ethers.id("TEST_ACTIVITY");

      await expect(
        contract.connect(user).registerDataProcessingActivity(
          activityId, 0, 1000, 6, true, true, true
        )
      ).to.be.reverted;
    });

    it("should handle activity with no consent", async function () {
      const activityId = ethers.id("NO_CONSENT_ACTIVITY");

      await expect(
        contract.connect(company1).registerDataProcessingActivity(
          activityId, 1, 100, 3, false, false, false
        )
      ).to.not.be.reverted;
    });
  });

  // ===========================================
  // 5. AUDIT LIFECYCLE TESTS
  // ===========================================

  describe("Audit Scheduling", function () {
    beforeEach(async function () {
      await contract.connect(owner).authorizeAuditor(auditor1.address);
      await contract.connect(owner).authorizeDataController(company1.address);
    });

    it("should allow authorized auditor to schedule audit", async function () {
      await expect(
        contract.connect(auditor1).scheduleAudit(company1.address, 0) // GDPR
      ).to.not.be.reverted;

      const auditCount = await contract.getCurrentAuditCount();
      expect(auditCount).to.equal(1);
    });

    it("should reject non-auditor scheduling audit", async function () {
      await expect(
        contract.connect(user).scheduleAudit(company1.address, 0)
      ).to.be.reverted;
    });

    it("should schedule multiple audits", async function () {
      await contract.connect(auditor1).scheduleAudit(company1.address, 0); // GDPR
      await contract.connect(auditor1).scheduleAudit(company1.address, 2); // HIPAA

      const auditCount = await contract.getCurrentAuditCount();
      expect(auditCount).to.equal(2);
    });

    it("should support all compliance standards", async function () {
      // Test all 6 standards
      for (let standard = 0; standard < 6; standard++) {
        await expect(
          contract.connect(auditor1).scheduleAudit(company1.address, standard)
        ).to.not.be.reverted;
      }

      const auditCount = await contract.getCurrentAuditCount();
      expect(auditCount).to.equal(6);
    });
  });

  describe("Audit Completion", function () {
    let auditId;

    beforeEach(async function () {
      await contract.connect(owner).authorizeAuditor(auditor1.address);
      await contract.connect(owner).authorizeDataController(company1.address);

      // Schedule an audit
      const tx = await contract.connect(auditor1).scheduleAudit(company1.address, 0);
      const receipt = await tx.wait();

      // Extract audit ID from events
      auditId = 1; // First audit ID
    });

    it("should allow auditor to complete audit", async function () {
      await expect(
        contract.connect(auditor1).completeAudit(
          auditId,
          5,      // findingsCount
          1,      // riskLevel: MEDIUM
          10000,  // penaltyAmount
          true    // remediated
        )
      ).to.not.be.reverted;
    });

    it("should handle audit with no findings", async function () {
      await expect(
        contract.connect(auditor1).completeAudit(
          auditId, 0, 0, 0, true
        )
      ).to.not.be.reverted;
    });

    it("should handle critical risk level", async function () {
      await expect(
        contract.connect(auditor1).completeAudit(
          auditId, 20, 3, 100000, false // CRITICAL risk
        )
      ).to.not.be.reverted;
    });

    it("should update last audit time", async function () {
      const lastAuditTimeBefore = await contract.lastAuditTime();

      await contract.connect(auditor1).completeAudit(
        auditId, 5, 1, 10000, true
      );

      const lastAuditTimeAfter = await contract.lastAuditTime();
      expect(lastAuditTimeAfter).to.be.gt(lastAuditTimeBefore);
    });
  });

  // ===========================================
  // 6. QUERY FUNCTION TESTS
  // ===========================================

  describe("Query Functions", function () {
    beforeEach(async function () {
      await contract.connect(owner).authorizeDataController(company1.address);
      await contract.connect(owner).authorizeAuditor(auditor1.address);
      await contract.connect(owner).setRegulator(regulator.address);
    });

    it("should query compliance status", async function () {
      // Register some data
      await contract.connect(company1).registerComplianceData(
        1000, 30, 85, true, false, false
      );

      // Query status - should not revert
      await expect(
        contract.getComplianceStatus(company1.address)
      ).to.not.be.reverted;
    });

    it("should query audit information", async function () {
      // Schedule audit
      await contract.connect(auditor1).scheduleAudit(company1.address, 0);

      const auditId = 1;
      const auditInfo = await contract.getAuditInfo(auditId);

      expect(auditInfo.auditee).to.equal(company1.address);
      expect(auditInfo.auditor).to.equal(auditor1.address);
    });

    it("should check certification status", async function () {
      // Grant certification
      await contract.connect(regulator).grantCertification(company1.address, 0);

      const isCertified = await contract.getCertificationStatus(company1.address, 0);
      expect(isCertified).to.be.true;
    });

    it("should return false for non-certified entity", async function () {
      const isCertified = await contract.getCertificationStatus(user.address, 0);
      expect(isCertified).to.be.false;
    });
  });

  // ===========================================
  // 7. EDGE CASES AND BOUNDARY CONDITIONS
  // ===========================================

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.connect(owner).authorizeDataController(company1.address);
      await contract.connect(owner).authorizeAuditor(auditor1.address);
    });

    it("should handle zero data points", async function () {
      await expect(
        contract.connect(company1).registerComplianceData(
          0, 0, 0, false, false, false
        )
      ).to.not.be.reverted;
    });

    it("should handle maximum uint32 data points", async function () {
      const maxUint32 = 4294967295;
      await expect(
        contract.connect(company1).registerComplianceData(
          maxUint32, 50, 50, true, true, true
        )
      ).to.not.be.reverted;
    });

    it("should handle same address authorized multiple times", async function () {
      await contract.connect(owner).authorizeAuditor(auditor1.address);

      await expect(
        contract.connect(owner).authorizeAuditor(auditor1.address)
      ).to.not.be.reverted;
    });

    it("should handle revoking unauthorized address", async function () {
      await expect(
        contract.connect(owner).revokeAuditorAuthorization(user.address)
      ).to.not.be.reverted;
    });

    it("should reject zero address for regulator", async function () {
      await expect(
        contract.connect(owner).setRegulator(ethers.ZeroAddress)
      ).to.be.reverted;
    });

    it("should reject zero address for auditor authorization", async function () {
      await expect(
        contract.connect(owner).authorizeAuditor(ethers.ZeroAddress)
      ).to.be.reverted;
    });

    it("should reject zero address for data controller", async function () {
      await expect(
        contract.connect(owner).authorizeDataController(ethers.ZeroAddress)
      ).to.be.reverted;
    });
  });

  // ===========================================
  // 8. GAS OPTIMIZATION TESTS
  // ===========================================

  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await contract.connect(owner).authorizeDataController(company1.address);
      await contract.connect(owner).authorizeAuditor(auditor1.address);
    });

    it("should use reasonable gas for compliance data registration", async function () {
      const tx = await contract.connect(company1).registerComplianceData(
        1000, 30, 85, true, false, false
      );
      const receipt = await tx.wait();

      // Check gas usage is reasonable (adjust threshold as needed)
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("should use reasonable gas for audit scheduling", async function () {
      const tx = await contract.connect(auditor1).scheduleAudit(company1.address, 0);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(300000);
    });

    it("should use reasonable gas for certification", async function () {
      await contract.connect(owner).setRegulator(regulator.address);

      const tx = await contract.connect(regulator).grantCertification(company1.address, 0);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000);
    });
  });

  // ===========================================
  // 9. INTEGRATION TESTS
  // ===========================================

  describe("Integration Tests - Complete Workflow", function () {
    it("should complete full audit workflow", async function () {
      // 1. Setup roles
      await contract.connect(owner).setRegulator(regulator.address);
      await contract.connect(owner).authorizeAuditor(auditor1.address);
      await contract.connect(owner).authorizeDataController(company1.address);

      // 2. Register compliance data
      await contract.connect(company1).registerComplianceData(
        5000, 25, 90, true, true, false
      );

      // 3. Register data processing activity
      const activityId = ethers.id("CUSTOMER_DATA_2024");
      await contract.connect(company1).registerDataProcessingActivity(
        activityId, 2, 50000, 12, true, true, true
      );

      // 4. Schedule audit
      await contract.connect(auditor1).scheduleAudit(company1.address, 0);

      // 5. Complete audit
      const auditId = 1;
      await contract.connect(auditor1).completeAudit(
        auditId, 2, 0, 0, true
      );

      // 6. Grant certification
      await contract.connect(regulator).grantCertification(company1.address, 0);

      // 7. Verify final state
      const isCertified = await contract.getCertificationStatus(company1.address, 0);
      expect(isCertified).to.be.true;

      const auditCount = await contract.getCurrentAuditCount();
      expect(auditCount).to.equal(1);
    });

    it("should handle multiple companies and audits", async function () {
      // Setup
      await contract.connect(owner).authorizeAuditor(auditor1.address);
      await contract.connect(owner).authorizeAuditor(auditor2.address);
      await contract.connect(owner).authorizeDataController(company1.address);
      await contract.connect(owner).authorizeDataController(company2.address);

      // Company 1 - GDPR audit
      await contract.connect(company1).registerComplianceData(
        3000, 30, 85, true, false, false
      );
      await contract.connect(auditor1).scheduleAudit(company1.address, 0);

      // Company 2 - HIPAA audit
      await contract.connect(company2).registerComplianceData(
        2000, 45, 75, true, false, true
      );
      await contract.connect(auditor2).scheduleAudit(company2.address, 2);

      // Verify
      const auditCount = await contract.getCurrentAuditCount();
      expect(auditCount).to.equal(2);
    });
  });
});
