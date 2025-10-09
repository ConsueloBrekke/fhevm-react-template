'use client';

import { useState, useEffect } from 'react';
import { useFhevm } from '@fhevm-sdk/core';
import ComplianceForm from '../components/ComplianceForm';
import { ethers } from 'ethers';

export default function Home() {
  const [provider, setProvider] = useState<any>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize FHEVM client
  const { client, isReady, error } = useFhevm({
    provider: provider || ethers.getDefaultProvider(),
    network: 'sepolia',
  });

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]);
      setProvider(window.ethereum);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount('');
        setProvider(null);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  return (
    <div className="container">
      <header className="card">
        <h1>🔐 Privacy Compliance Auditor</h1>
        <p style={{ color: '#718096', marginBottom: '1rem' }}>
          Privacy-preserving compliance auditing powered by Zama FHE
        </p>

        {!account ? (
          <button
            className="button"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="alert alert-success">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </header>

      {error && (
        <div className="alert alert-error">
          FHEVM Error: {error.message}
        </div>
      )}

      {account && !isReady && (
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Initializing FHEVM client...
          </p>
        </div>
      )}

      {account && isReady && client && (
        <ComplianceForm client={client} account={account} />
      )}

      {!account && (
        <div className="card">
          <h2>Welcome!</h2>
          <p style={{ color: '#718096', lineHeight: '1.6' }}>
            This application demonstrates privacy-preserving compliance auditing
            using Zama's Fully Homomorphic Encryption (FHE).
          </p>
          <br />
          <h3>Features:</h3>
          <ul style={{ marginLeft: '1.5rem', color: '#718096', lineHeight: '1.8' }}>
            <li>Submit encrypted compliance data (GDPR, HIPAA, SOX)</li>
            <li>Auditors review without seeing plaintext</li>
            <li>Blockchain-based certification management</li>
            <li>Privacy-preserving analytics</li>
          </ul>
          <br />
          <p style={{ color: '#718096' }}>
            Connect your wallet to get started!
          </p>
        </div>
      )}
    </div>
  );
}
