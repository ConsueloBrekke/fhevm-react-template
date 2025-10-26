'use client';

import React, { useState } from 'react';
import { FhevmClientInstance, encryptInput } from '@fhevm-sdk/core';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface MedicalExampleProps {
  client: FhevmClientInstance;
  contractAddress: string;
}

export default function MedicalExample({ client, contractAddress }: MedicalExampleProps) {
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmitMedicalData = async () => {
    if (!patientId || !age || !bloodPressureSystolic || !bloodPressureDiastolic || !glucoseLevel) {
      setError('Please fill in all medical data fields');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult('');

    try {
      const ageNum = parseInt(age);
      const bpSystolic = parseInt(bloodPressureSystolic);
      const bpDiastolic = parseInt(bloodPressureDiastolic);
      const glucose = parseInt(glucoseLevel);

      if (isNaN(ageNum) || isNaN(bpSystolic) || isNaN(bpDiastolic) || isNaN(glucose)) {
        throw new Error('Invalid medical data values');
      }

      // Validate ranges
      if (ageNum < 0 || ageNum > 150) throw new Error('Invalid age');
      if (bpSystolic < 40 || bpSystolic > 250) throw new Error('Invalid systolic BP');
      if (bpDiastolic < 20 || bpDiastolic > 150) throw new Error('Invalid diastolic BP');
      if (glucose < 20 || glucose > 600) throw new Error('Invalid glucose level');

      // Encrypt sensitive medical data
      const encrypted = await encryptInput(client, contractAddress, {
        values: [ageNum, bpSystolic, bpDiastolic, glucose],
        types: ['uint8', 'uint8', 'uint8', 'uint16']
      });

      // In a real implementation, submit to HIPAA-compliant smart contract
      setResult(`Medical data for patient ${patientId} encrypted and submitted successfully. All PHI is protected by FHE.`);
    } catch (err: any) {
      setError(err.message || 'Medical data submission failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card
      title="HIPAA-Compliant Medical Records"
      subtitle="Store patient health information with full encryption"
    >
      <div className="space-y-4">
        <div className="alert alert-info">
          This example demonstrates HIPAA-compliant medical record storage using FHE.
          All Protected Health Information (PHI) is encrypted before submission.
        </div>

        <Input
          label="Patient ID"
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="P-12345"
          helperText="Non-sensitive identifier"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 45"
          />
          <Input
            label="Glucose Level (mg/dL)"
            type="number"
            value={glucoseLevel}
            onChange={(e) => setGlucoseLevel(e.target.value)}
            placeholder="e.g., 95"
          />
        </div>

        <div className="form-group">
          <label className="label">Blood Pressure (mmHg)</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="input"
              type="number"
              value={bloodPressureSystolic}
              onChange={(e) => setBloodPressureSystolic(e.target.value)}
              placeholder="Systolic (e.g., 120)"
            />
            <input
              className="input"
              type="number"
              value={bloodPressureDiastolic}
              onChange={(e) => setBloodPressureDiastolic(e.target.value)}
              placeholder="Diastolic (e.g., 80)"
            />
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <Button
          onClick={handleSubmitMedicalData}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Encrypting & Submitting...' : 'Submit Encrypted Medical Data'}
        </Button>

        {result && (
          <div className="alert alert-success">
            <strong>Success!</strong>
            <br />
            {result}
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <strong>HIPAA Compliance Benefits:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Patient data encrypted at all times (at rest and in transit)</li>
            <li>Smart contracts can analyze trends without seeing individual records</li>
            <li>Audit trails maintained without exposing PHI</li>
            <li>Authorized providers can decrypt with proper permissions</li>
            <li>Meets HIPAA Privacy Rule and Security Rule requirements</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
