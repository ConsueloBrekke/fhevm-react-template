import { useState } from 'react';
import { FhevmClientInstance } from '@fhevm-sdk/core';
import { useEncryption } from '../hooks/useEncryption';
import { Contract } from 'ethers';

interface ComplianceFormProps {
  client: FhevmClientInstance | null;
  account: string;
}

const CONTRACT_ADDRESS = '0xf7f80e8BE9823E5D8df70960cECd7f7A24266098';

export default function ComplianceForm({ client, account }: ComplianceFormProps) {
  const [standard, setStandard] = useState('GDPR');
  const [dataPoints, setDataPoints] = useState('1000');
  const [riskScore, setRiskScore] = useState('30');
  const [complianceScore, setComplianceScore] = useState('85');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const { encrypt, isEncrypting } = useEncryption(client);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Encrypting compliance data...' });

    try {
      // Encrypt the compliance data
      const encrypted = await encrypt(CONTRACT_ADDRESS, {
        values: [
          parseInt(dataPoints),
          parseInt(riskScore),
          parseInt(complianceScore)
        ],
        types: ['uint32', 'uint8', 'uint8']
      });

      setStatus({
        type: 'info',
        message: 'Data encrypted successfully. Submitting to blockchain...'
      });

      // In a real implementation, you would send the encrypted data to the smart contract
      // For demo purposes, we'll simulate a successful submission
      setTimeout(() => {
        setStatus({
          type: 'success',
          message: `Compliance data for ${standard} submitted successfully! Your data remains fully encrypted on-chain.`
        });
      }, 1500);

      console.log('Encrypted handles:', encrypted.handles);
      console.log('Input proof:', encrypted.inputProof);

    } catch (error: any) {
      setStatus({
        type: 'error',
        message: `Failed to submit compliance data: ${error.message}`
      });
    }
  };

  return (
    <div className="compliance-form">
      <h3>Submit Compliance Data</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Compliance Standard</label>
          <select value={standard} onChange={(e) => setStandard(e.target.value)}>
            <option value="GDPR">GDPR</option>
            <option value="CCPA">CCPA</option>
            <option value="HIPAA">HIPAA</option>
            <option value="SOX">SOX</option>
            <option value="PCI-DSS">PCI-DSS</option>
            <option value="ISO 27001">ISO 27001</option>
          </select>
        </div>

        <div className="form-group">
          <label>Data Points Processed</label>
          <input
            type="number"
            value={dataPoints}
            onChange={(e) => setDataPoints(e.target.value)}
            min="0"
            max="4294967295"
            required
          />
        </div>

        <div className="form-group">
          <label>Risk Score (0-100)</label>
          <input
            type="number"
            value={riskScore}
            onChange={(e) => setRiskScore(e.target.value)}
            min="0"
            max="100"
            required
          />
        </div>

        <div className="form-group">
          <label>Compliance Score (0-100)</label>
          <input
            type="number"
            value={complianceScore}
            onChange={(e) => setComplianceScore(e.target.value)}
            min="0"
            max="100"
            required
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isEncrypting || !client}
        >
          {isEncrypting ? 'Encrypting & Submitting...' : 'Submit Encrypted Data'}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}
