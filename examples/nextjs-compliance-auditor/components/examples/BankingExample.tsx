'use client';

import React, { useState } from 'react';
import { FhevmClientInstance, encryptInput } from '@fhevm-sdk/core';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface BankingExampleProps {
  client: FhevmClientInstance;
  contractAddress: string;
}

export default function BankingExample({ client, contractAddress }: BankingExampleProps) {
  const [accountBalance, setAccountBalance] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePrivateTransfer = async () => {
    if (!accountBalance || !transferAmount || !recipientAddress) {
      setError('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult('');

    try {
      const balance = parseFloat(accountBalance);
      const amount = parseFloat(transferAmount);

      if (isNaN(balance) || isNaN(amount)) {
        throw new Error('Invalid amounts');
      }

      if (amount > balance) {
        throw new Error('Insufficient balance');
      }

      // Convert to cents for integer encryption
      const balanceCents = Math.floor(balance * 100);
      const amountCents = Math.floor(amount * 100);

      // Encrypt sensitive financial data
      const encrypted = await encryptInput(client, contractAddress, {
        values: [balanceCents, amountCents],
        types: ['uint64', 'uint64']
      });

      // In a real implementation, call smart contract
      setResult(`Private transfer of $${amount} initiated successfully. Transaction encrypted with FHE.`);
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card
      title="Private Banking Example"
      subtitle="Transfer funds without revealing account balances"
    >
      <div className="space-y-4">
        <div className="alert alert-info">
          This example demonstrates how FHE can be used in banking to keep account balances
          and transaction amounts private while still allowing the smart contract to verify
          sufficient funds.
        </div>

        <Input
          label="Your Account Balance ($)"
          type="number"
          step="0.01"
          value={accountBalance}
          onChange={(e) => setAccountBalance(e.target.value)}
          placeholder="e.g., 1000.00"
          helperText="Your balance will be encrypted"
        />

        <Input
          label="Transfer Amount ($)"
          type="number"
          step="0.01"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="e.g., 50.00"
        />

        <Input
          label="Recipient Address"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="0x..."
        />

        {error && <div className="alert alert-error">{error}</div>}

        <Button
          onClick={handlePrivateTransfer}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Execute Private Transfer'}
        </Button>

        {result && (
          <div className="alert alert-success">
            <strong>Success!</strong>
            <br />
            {result}
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <strong>Privacy Benefits:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Account balances remain encrypted on-chain</li>
            <li>Transaction amounts are hidden from public view</li>
            <li>Smart contract can still verify sufficient funds</li>
            <li>Regulatory compliance without exposing sensitive data</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
