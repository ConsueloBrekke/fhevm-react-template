// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivacyComplianceAuditor is SepoliaConfig {

    address public owner;
    address public regulator;
    uint32 public auditCount;
    uint256 public lastAuditTime;

    // Compliance standards
    enum ComplianceStandard {
        GDPR,      // General Data Protection Regulation
        CCPA,      // California Consumer Privacy Act
        HIPAA,     // Health Insurance Portability and Accountability Act
        SOX,       // Sarbanes-Oxley Act
        PCI_DSS,   // Payment Card Industry Data Security Standard
        ISO27001   // Information Security Management
    }

    // Risk levels for compliance violations
    enum RiskLevel {
        LOW,       // Minor compliance issues
        MEDIUM,    // Moderate violations requiring attention
        HIGH,      // Serious violations requiring immediate action
        CRITICAL   // Severe violations with legal implications
    }

    // Audit status
    enum AuditStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    struct ComplianceData {
        euint32 encryptedDataPoints;      // Number of data processing points
        euint8 encryptedRiskScore;        // Risk assessment score (0-100)
        euint8 encryptedComplianceScore;  // Overall compliance score (0-100)
        bool hasPersonalData;             // Contains personal identifiable information
        bool hasFinancialData;            // Contains financial information
        bool hasHealthData;               // Contains health records
        uint256 lastReviewDate;           // Last compliance review timestamp
        address dataController;           // Entity responsible for data
    }

    struct AuditRecord {
        uint32 auditId;
        ComplianceStandard standard;
        AuditStatus status;
        euint8 encryptedFindingsCount;    // Number of compliance violations found
        RiskLevel overallRisk;
        address auditor;
        address auditee;
        uint256 startTime;
        uint256 endTime;
        bool remediated;                  // Whether violations have been fixed
        euint32 encryptedPenaltyAmount;   // Penalty amount for violations (if any)
    }

    struct DataProcessingActivity {
        bytes32 activityId;
        euint8 encryptedProcessingPurpose; // Encoded purpose of data processing
        euint32 encryptedDataSubjectCount; // Number of individuals affected
        euint8 encryptedRetentionPeriod;   // Data retention period in months
        bool consentObtained;              // Whether proper consent was obtained
        bool dataMinimized;                // Whether data minimization principle is followed
        bool securityMeasures;             // Whether adequate security measures exist
        uint256 registrationDate;
    }

    // Storage mappings
    mapping(address => ComplianceData) public complianceProfiles;
    mapping(uint32 => AuditRecord) public auditRecords;
    mapping(bytes32 => DataProcessingActivity) public processingActivities;
    mapping(address => mapping(ComplianceStandard => bool)) public certifications;
    mapping(address => uint256) public lastComplianceUpdate;

    // Access control
    mapping(address => bool) public authorizedAuditors;
    mapping(address => bool) public dataControllers;

    // Events
    event ComplianceDataUpdated(address indexed entity, uint256 timestamp);
    event AuditScheduled(uint32 indexed auditId, address indexed auditee, ComplianceStandard standard);
    event AuditCompleted(uint32 indexed auditId, RiskLevel overallRisk, bool remediated);
    event ViolationDetected(address indexed entity, ComplianceStandard standard, RiskLevel severity);
    event CertificationGranted(address indexed entity, ComplianceStandard standard);
    event CertificationRevoked(address indexed entity, ComplianceStandard standard);
    event DataProcessingRegistered(bytes32 indexed activityId, address indexed controller);
    event ComplianceScoreUpdated(address indexed entity, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyRegulator() {
        require(msg.sender == regulator, "Not regulatory authority");
        _;
    }

    modifier onlyAuthorizedAuditor() {
        require(authorizedAuditors[msg.sender], "Not authorized auditor");
        _;
    }

    modifier onlyDataController() {
        require(dataControllers[msg.sender], "Not authorized data controller");
        _;
    }

    constructor() {
        owner = msg.sender;
        regulator = msg.sender; // Initially same as owner
        auditCount = 1;
        lastAuditTime = block.timestamp;

        // Grant initial permissions
        authorizedAuditors[msg.sender] = true;
        dataControllers[msg.sender] = true;
    }

    // Administrative functions
    function setRegulator(address _regulator) external onlyOwner {
        regulator = _regulator;
    }

    function authorizeAuditor(address _auditor) external onlyRegulator {
        authorizedAuditors[_auditor] = true;
    }

    function revokeAuditor(address _auditor) external onlyRegulator {
        authorizedAuditors[_auditor] = false;
    }

    function authorizeDataController(address _controller) external onlyRegulator {
        dataControllers[_controller] = true;
    }

    // Register compliance data for an entity
    function registerComplianceData(
        uint32 _dataPoints,
        uint8 _riskScore,
        uint8 _complianceScore,
        bool _hasPersonalData,
        bool _hasFinancialData,
        bool _hasHealthData
    ) external onlyDataController {
        require(_riskScore <= 100, "Risk score must be 0-100");
        require(_complianceScore <= 100, "Compliance score must be 0-100");

        // Encrypt sensitive data
        euint32 encDataPoints = FHE.asEuint32(_dataPoints);
        euint8 encRiskScore = FHE.asEuint8(_riskScore);
        euint8 encComplianceScore = FHE.asEuint8(_complianceScore);

        complianceProfiles[msg.sender] = ComplianceData({
            encryptedDataPoints: encDataPoints,
            encryptedRiskScore: encRiskScore,
            encryptedComplianceScore: encComplianceScore,
            hasPersonalData: _hasPersonalData,
            hasFinancialData: _hasFinancialData,
            hasHealthData: _hasHealthData,
            lastReviewDate: block.timestamp,
            dataController: msg.sender
        });

        // Set ACL permissions
        FHE.allowThis(encDataPoints);
        FHE.allowThis(encRiskScore);
        FHE.allowThis(encComplianceScore);
        FHE.allow(encDataPoints, msg.sender);
        FHE.allow(encRiskScore, msg.sender);
        FHE.allow(encComplianceScore, msg.sender);

        lastComplianceUpdate[msg.sender] = block.timestamp;

        emit ComplianceDataUpdated(msg.sender, block.timestamp);
    }

    // Schedule a compliance audit
    function scheduleAudit(
        address _auditee,
        ComplianceStandard _standard
    ) external onlyAuthorizedAuditor {
        require(dataControllers[_auditee], "Entity not registered");

        uint32 currentAuditId = auditCount;

        auditRecords[currentAuditId] = AuditRecord({
            auditId: currentAuditId,
            standard: _standard,
            status: AuditStatus.SCHEDULED,
            encryptedFindingsCount: FHE.asEuint8(0),
            overallRisk: RiskLevel.LOW,
            auditor: msg.sender,
            auditee: _auditee,
            startTime: block.timestamp,
            endTime: 0,
            remediated: false,
            encryptedPenaltyAmount: FHE.asEuint32(0)
        });

        // Set ACL permissions for encrypted data
        FHE.allowThis(auditRecords[currentAuditId].encryptedFindingsCount);
        FHE.allowThis(auditRecords[currentAuditId].encryptedPenaltyAmount);
        FHE.allow(auditRecords[currentAuditId].encryptedFindingsCount, msg.sender);
        FHE.allow(auditRecords[currentAuditId].encryptedPenaltyAmount, msg.sender);

        auditCount++;
        lastAuditTime = block.timestamp;

        emit AuditScheduled(currentAuditId, _auditee, _standard);
    }

    // Complete an audit with findings
    function completeAudit(
        uint32 _auditId,
        uint8 _findingsCount,
        RiskLevel _riskLevel,
        uint32 _penaltyAmount,
        bool _remediated
    ) external onlyAuthorizedAuditor {
        require(_auditId < auditCount, "Invalid audit ID");
        require(auditRecords[_auditId].auditor == msg.sender, "Not audit owner");
        require(auditRecords[_auditId].status == AuditStatus.SCHEDULED ||
                auditRecords[_auditId].status == AuditStatus.IN_PROGRESS, "Audit not active");

        AuditRecord storage audit = auditRecords[_auditId];

        // Encrypt sensitive audit results
        euint8 encFindingsCount = FHE.asEuint8(_findingsCount);
        euint32 encPenaltyAmount = FHE.asEuint32(_penaltyAmount);

        audit.encryptedFindingsCount = encFindingsCount;
        audit.encryptedPenaltyAmount = encPenaltyAmount;
        audit.overallRisk = _riskLevel;
        audit.status = AuditStatus.COMPLETED;
        audit.endTime = block.timestamp;
        audit.remediated = _remediated;

        // Update ACL permissions
        FHE.allowThis(encFindingsCount);
        FHE.allowThis(encPenaltyAmount);
        FHE.allow(encFindingsCount, msg.sender);
        FHE.allow(encPenaltyAmount, msg.sender);

        // Update entity's compliance score based on audit results
        _updateComplianceScore(audit.auditee, _findingsCount, _riskLevel);

        // Emit events based on risk level
        if (_riskLevel >= RiskLevel.MEDIUM) {
            emit ViolationDetected(audit.auditee, audit.standard, _riskLevel);
        }

        emit AuditCompleted(_auditId, _riskLevel, _remediated);
    }

    // Register data processing activity
    function registerDataProcessingActivity(
        bytes32 _activityId,
        uint8 _processingPurpose,
        uint32 _dataSubjectCount,
        uint8 _retentionPeriod,
        bool _consentObtained,
        bool _dataMinimized,
        bool _securityMeasures
    ) external onlyDataController {
        require(_retentionPeriod <= 120, "Retention period too long"); // Max 10 years

        // Encrypt sensitive processing data
        euint8 encPurpose = FHE.asEuint8(_processingPurpose);
        euint32 encSubjectCount = FHE.asEuint32(_dataSubjectCount);
        euint8 encRetention = FHE.asEuint8(_retentionPeriod);

        processingActivities[_activityId] = DataProcessingActivity({
            activityId: _activityId,
            encryptedProcessingPurpose: encPurpose,
            encryptedDataSubjectCount: encSubjectCount,
            encryptedRetentionPeriod: encRetention,
            consentObtained: _consentObtained,
            dataMinimized: _dataMinimized,
            securityMeasures: _securityMeasures,
            registrationDate: block.timestamp
        });

        // Set ACL permissions
        FHE.allowThis(encPurpose);
        FHE.allowThis(encSubjectCount);
        FHE.allowThis(encRetention);
        FHE.allow(encPurpose, msg.sender);
        FHE.allow(encSubjectCount, msg.sender);
        FHE.allow(encRetention, msg.sender);

        emit DataProcessingRegistered(_activityId, msg.sender);
    }

    // Grant compliance certification
    function grantCertification(
        address _entity,
        ComplianceStandard _standard
    ) external onlyRegulator {
        require(dataControllers[_entity], "Entity not registered");

        certifications[_entity][_standard] = true;

        emit CertificationGranted(_entity, _standard);
    }

    // Revoke compliance certification
    function revokeCertification(
        address _entity,
        ComplianceStandard _standard
    ) external onlyRegulator {
        certifications[_entity][_standard] = false;

        emit CertificationRevoked(_entity, _standard);
    }

    // Internal function to update compliance score after audit
    function _updateComplianceScore(
        address _entity,
        uint8 _findingsCount,
        RiskLevel _riskLevel
    ) internal {
        ComplianceData storage profile = complianceProfiles[_entity];

        if (profile.dataController != address(0)) {
            // Calculate score reduction based on findings and risk level
            uint8 scoreReduction = 0;

            if (_riskLevel == RiskLevel.LOW) {
                scoreReduction = _findingsCount * 2;
            } else if (_riskLevel == RiskLevel.MEDIUM) {
                scoreReduction = _findingsCount * 5;
            } else if (_riskLevel == RiskLevel.HIGH) {
                scoreReduction = _findingsCount * 10;
            } else if (_riskLevel == RiskLevel.CRITICAL) {
                scoreReduction = _findingsCount * 20;
            }

            // Update encrypted compliance score
            euint8 currentScore = profile.encryptedComplianceScore;
            euint8 reduction = FHE.asEuint8(scoreReduction);
            euint8 newScore = FHE.sub(currentScore, reduction);

            profile.encryptedComplianceScore = newScore;
            profile.lastReviewDate = block.timestamp;
            lastComplianceUpdate[_entity] = block.timestamp;

            // Set ACL permissions
            FHE.allowThis(newScore);
            FHE.allow(newScore, _entity);

            emit ComplianceScoreUpdated(_entity, block.timestamp);
        }
    }

    // View functions
    function getComplianceStatus(address _entity) external view returns (
        bool hasPersonalData,
        bool hasFinancialData,
        bool hasHealthData,
        uint256 lastReviewDate,
        address dataController
    ) {
        ComplianceData storage profile = complianceProfiles[_entity];
        return (
            profile.hasPersonalData,
            profile.hasFinancialData,
            profile.hasHealthData,
            profile.lastReviewDate,
            profile.dataController
        );
    }

    function getAuditInfo(uint32 _auditId) external view returns (
        ComplianceStandard standard,
        AuditStatus status,
        RiskLevel overallRisk,
        address auditor,
        address auditee,
        uint256 startTime,
        uint256 endTime,
        bool remediated
    ) {
        AuditRecord storage audit = auditRecords[_auditId];
        return (
            audit.standard,
            audit.status,
            audit.overallRisk,
            audit.auditor,
            audit.auditee,
            audit.startTime,
            audit.endTime,
            audit.remediated
        );
    }

    function hasCertification(
        address _entity,
        ComplianceStandard _standard
    ) external view returns (bool) {
        return certifications[_entity][_standard];
    }

    function getCurrentAuditCount() external view returns (uint32) {
        return auditCount - 1; // Subtract 1 because auditCount starts at 1
    }

    function isAuthorizedAuditor(address _auditor) external view returns (bool) {
        return authorizedAuditors[_auditor];
    }

    function isDataController(address _controller) external view returns (bool) {
        return dataControllers[_controller];
    }
}