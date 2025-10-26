'use client';

import React, { useState, useEffect } from 'react';
import { FhevmClientInstance } from '@fhevm-sdk/core';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface KeyManagerProps {
  client: FhevmClientInstance;
}

export default function KeyManager({ client }: KeyManagerProps) {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPublicKey();
  }, [client]);

  const fetchPublicKey = async () => {
    if (!client?.isReady) return;

    setIsLoading(true);
    setError('');

    try {
      // In a real implementation, fetch the public key from the client
      const key = client.getPublicKey?.() || '0x' + '0'.repeat(128);
      setPublicKey(key);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch public key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchPublicKey();
  };

  return (
    <Card title="Key Manager" subtitle="Manage FHE encryption keys">
      <div className="space-y-4">
        {error && <div className="alert alert-error">{error}</div>}

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="label">Public Key</label>
              <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className="text-xs break-all">{publicKey || 'No key available'}</code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleRefresh} variant="secondary">
                Refresh Key
              </Button>
              <Button
                onClick={() => navigator.clipboard.writeText(publicKey)}
                variant="secondary"
              >
                Copy to Clipboard
              </Button>
            </div>

            <div className="alert alert-info">
              <strong>Note:</strong> The public key is used to encrypt data before sending it to the blockchain.
              All users share the same network public key.
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
