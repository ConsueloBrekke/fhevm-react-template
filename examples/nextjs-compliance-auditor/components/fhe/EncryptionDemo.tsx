'use client';

import React, { useState } from 'react';
import { FhevmClientInstance, encryptInput } from '@fhevm-sdk/core';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface EncryptionDemoProps {
  client: FhevmClientInstance;
  contractAddress: string;
}

export default function EncryptionDemo({ client, contractAddress }: EncryptionDemoProps) {
  const [value, setValue] = useState('');
  const [valueType, setValueType] = useState('uint32');
  const [encrypted, setEncrypted] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleEncrypt = async () => {
    if (!value) {
      setError('Please enter a value to encrypt');
      return;
    }

    setIsEncrypting(true);
    setError('');
    setEncrypted('');

    try {
      let parsedValue: any;

      if (valueType === 'bool') {
        parsedValue = value.toLowerCase() === 'true';
      } else {
        parsedValue = parseInt(value);
        if (isNaN(parsedValue)) {
          throw new Error('Invalid number');
        }
      }

      const result = await encryptInput(client, contractAddress, {
        values: [parsedValue],
        types: [valueType]
      });

      setEncrypted(result.handles[0]);
    } catch (err: any) {
      setError(err.message || 'Encryption failed');
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <Card title="Encryption Demo" subtitle="Encrypt data using FHE">
      <div className="space-y-4">
        <Input
          label="Value to Encrypt"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a value"
          error={error}
        />

        <div className="form-group">
          <label className="label">Data Type</label>
          <select
            className="input"
            value={valueType}
            onChange={(e) => setValueType(e.target.value)}
          >
            <option value="uint8">uint8 (0-255)</option>
            <option value="uint16">uint16</option>
            <option value="uint32">uint32</option>
            <option value="uint64">uint64</option>
            <option value="bool">boolean</option>
          </select>
        </div>

        <Button
          onClick={handleEncrypt}
          disabled={isEncrypting}
          className="w-full"
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
        </Button>

        {encrypted && (
          <div className="alert alert-success">
            <strong>Encrypted Handle:</strong>
            <br />
            <code className="text-xs break-all">{encrypted}</code>
          </div>
        )}
      </div>
    </Card>
  );
}
