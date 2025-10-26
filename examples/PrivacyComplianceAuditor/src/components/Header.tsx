interface HeaderProps {
  account: string;
  onConnect: () => void;
}

export default function Header({ account, onConnect }: HeaderProps) {
  return (
    <div className="header">
      <h1>Privacy Compliance Auditor</h1>
      <p>Confidential compliance verification powered by Zama FHE</p>

      <div className="wallet-section">
        {account ? (
          <div className="wallet-address">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        ) : (
          <button className="wallet-button" onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
