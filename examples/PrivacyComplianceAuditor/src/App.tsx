import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import Header from './components/Header';
import FeaturesGrid from './components/FeaturesGrid';
import ComplianceStandards from './components/ComplianceStandards';
import ComplianceForm from './components/ComplianceForm';
import { useFHE } from './hooks/useFHE';

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const { client, isReady, isInitializing, error } = useFHE({ provider, autoInit: true });

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  return (
    <div className="app-container">
      <div className="container">
        <Header account={account} onConnect={connectWallet} />

        <FeaturesGrid />

        <ComplianceStandards />

        {error && (
          <div className="error-message">
            <strong>FHE Initialization Error:</strong> {error.message}
          </div>
        )}

        {isInitializing && (
          <div className="loading-message">
            Initializing FHE client...
          </div>
        )}

        {isReady && account && (
          <ComplianceForm client={client} account={account} />
        )}

        {!account && (
          <div className="connect-prompt">
            <p>Please connect your wallet to start using the Privacy Compliance Auditor</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
