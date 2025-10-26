export default function FeaturesGrid() {
  const features = [
    {
      title: 'Encrypted Data Submission',
      description: 'Submit compliance data in fully encrypted form using FHE technology'
    },
    {
      title: 'Confidential Auditing',
      description: 'Perform compliance checks without revealing sensitive organizational data'
    },
    {
      title: 'Privacy-Preserving Results',
      description: 'Receive compliance certifications while maintaining complete data privacy'
    }
  ];

  return (
    <div className="features-grid">
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
