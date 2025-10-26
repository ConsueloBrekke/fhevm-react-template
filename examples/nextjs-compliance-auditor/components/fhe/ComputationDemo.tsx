'use client';

import React, { useState } from 'react';
import { FhevmClientInstance, encryptInput } from '@fhevm-sdk/core';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ComputationDemoProps {
  client: FhevmClientInstance;
  contractAddress: string;
}

export default function ComputationDemo({ client, contractAddress }: ComputationDemoProps) {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState<string>('');
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCompute = async () => {
    if (!value1 || !value2) {
      setError('Please enter both values');
      return;
    }

    setIsComputing(true);
    setError('');
    setResult('');

    try {
      const num1 = parseInt(value1);
      const num2 = parseInt(value2);

      if (isNaN(num1) || isNaN(num2)) {
        throw new Error('Invalid numbers');
      }

      // Encrypt both values
      const encrypted = await encryptInput(client, contractAddress, {
        values: [num1, num2],
        types: ['uint32', 'uint32']
      });

      // In a real implementation, you would call a smart contract
      // that performs homomorphic computation
      setResult(`Encrypted computation result for ${operation}(${value1}, ${value2})`);
    } catch (err: any) {
      setError(err.message || 'Computation failed');
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <Card title="Homomorphic Computation Demo" subtitle="Compute on encrypted data">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Value"
            type="number"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            placeholder="e.g., 10"
          />
          <Input
            label="Second Value"
            type="number"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
            placeholder="e.g., 20"
          />
        </div>

        <div className="form-group">
          <label className="label">Operation</label>
          <select
            className="input"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="add">Addition (+)</option>
            <option value="sub">Subtraction (-)</option>
            <option value="mul">Multiplication (*)</option>
            <option value="div">Division (/)</option>
            <option value="max">Maximum</option>
            <option value="min">Minimum</option>
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <Button
          onClick={handleCompute}
          disabled={isComputing}
          className="w-full"
        >
          {isComputing ? 'Computing...' : 'Compute on Encrypted Data'}
        </Button>

        {result && (
          <div className="alert alert-success">
            <strong>Computation Complete:</strong>
            <br />
            {result}
          </div>
        )}
      </div>
    </Card>
  );
}
