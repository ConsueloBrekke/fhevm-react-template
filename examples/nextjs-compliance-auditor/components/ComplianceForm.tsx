'use client';

import { useState } from 'react';
import { FhevmClientInstance } from '@fhevm-sdk/core';
import { useEncryptedInput } from '@fhevm-sdk/core';
import { ethers } from 'ethers';

// Contract ABI (simplified for example)
const CONTRACT_ABI = [
  'function registerComplianceData(bytes calldata encryptedDataPoints, bytes calldata encryptedRiskScore, bytes calldata encryptedComplianceScore, bytes calldata encryptedGdpr, bytes calldata encryptedHipaa, bytes calldata encryptedSox, bytes calldata inputProof) external',
];

const CONTRACT_ADDRESS = '0xf7f80e8BE9823E5D8df70960cECd7f7A24266098'; // Example address

interface ComplianceFormProps {
  client: FhevmClientInstance;
  account: string;
}

export default function ComplianceForm({ client, account }: ComplianceFormProps) {
  const [dataPoints, setDataPoints] = useState('');
  const [riskScore, setRiskScore] = useState('');
  const [complianceScore, setComplianceScore] = useState('');
  const [gdprCompliant, setGdprCompliant] = useState(false);
  const [hipaaCompliant, setHipaaCompliant] = useState(false);
  const [soxCompliant, setSoxCompliant] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { encrypt, isEncrypting, error: encryptError } = useEncryptedInput(client);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client?.isReady) {
      alert('FHEVM client not ready');
      return;
    }

    setSubmitting(true);
    setTxHash('');

    try {
      // Validate inputs
      const dataPointsNum = parseInt(dataPoints);
      const riskScoreNum = parseInt(riskScore);
      const complianceScoreNum = parseInt(complianceScore);

      if (isNaN(dataPointsNum) || isNaN(riskScoreNum) || isNaN(complianceScoreNum)) {
        throw new Error('Please enter valid numbers');
      }

      if (riskScoreNum < 0 || riskScoreNum > 100 || complianceScoreNum < 0 || complianceScoreNum > 100) {
        throw new Error('Scores must be between 0 and 100');
      }

      // Encrypt data
      const encrypted = await encrypt(CONTRACT_ADDRESS, {
        values: [
          dataPointsNum,
          riskScoreNum,
          complianceScoreNum,
          gdprCompliant,
          hipaaCompliant,
          soxCompliant,
        ],
        types: ['uint32', 'uint8', 'uint8', 'bool', 'bool', 'bool'],
      });

      // Create contract instance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Submit encrypted data
      const tx = await contract.registerComplianceData(
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.handles[2],
        encrypted.handles[3],
        encrypted.handles[4],
        encrypted.handles[5],
        encrypted.inputProof
      );

      setTxHash(tx.hash);

      // Wait for confirmation
      await tx.wait();

      alert('Compliance data submitted successfully! ✅');

      // Reset form
      setDataPoints('');
      setRiskScore('');
      setComplianceScore('');
      setGdprCompliant(false);
      setHipaaCompliant(false);
      setSoxCompliant(false);
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(`Error: ${err.message || 'Failed to submit data'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Submit Compliance Data</h2>
      <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
        All data is encrypted before submission using FHE
      </p>

      {encryptError && (
        <div className="alert alert-error">
          Encryption Error: {encryptError.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="dataPoints">
            Number of Data Points
          </label>
          <input
            id="dataPoints"
            type="number"
            className="input"
            value={dataPoints}
            onChange={(e) => setDataPoints(e.target.value)}
            placeholder="e.g., 5000"
            required
            min="0"
          />
        </div>

        <div className="grid">
          <div className="form-group">
            <label className="label" htmlFor="riskScore">
              Risk Score (0-100)
            </label>
            <input
              id="riskScore"
              type="number"
              className="input"
              value={riskScore}
              onChange={(e) => setRiskScore(e.target.value)}
              placeholder="e.g., 25"
              required
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="complianceScore">
              Compliance Score (0-100)
            </label>
            <input
              id="complianceScore"
              type="number"
              className="input"
              value={complianceScore}
              onChange={(e) => setComplianceScore(e.target.value)}
              placeholder="e.g., 85"
              required
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Compliance Standards</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={gdprCompliant}
                onChange={(e) => setGdprCompliant(e.target.checked)}
              />
              GDPR Compliant
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={hipaaCompliant}
                onChange={(e) => setHipaaCompliant(e.target.checked)}
              />
              HIPAA Compliant
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={soxCompliant}
                onChange={(e) => setSoxCompliant(e.target.checked)}
              />
              SOX Compliant
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="button"
          disabled={submitting || isEncrypting}
          style={{ width: '100%' }}
        >
          {submitting
            ? 'Submitting...'
            : isEncrypting
            ? 'Encrypting...'
            : 'Submit Encrypted Data'}
        </button>
      </form>

      {txHash && (
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          <strong>Transaction Submitted!</strong>
          <br />
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2c5282', textDecoration: 'underline' }}
          >
            View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
}
