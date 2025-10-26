export default function ComplianceStandards() {
  const standards = [
    'GDPR',
    'CCPA',
    'HIPAA',
    'SOX',
    'PCI-DSS',
    'ISO 27001'
  ];

  return (
    <div className="compliance-standards">
      <h3>Supported Compliance Standards</h3>
      <div className="standards-list">
        {standards.map((standard, index) => (
          <div key={index} className="standard-badge">
            {standard}
          </div>
        ))}
      </div>
    </div>
  );
}
