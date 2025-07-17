import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateParameters, OptimizationParameters } from '@/store/optimizationSlice';

const ParameterInput = ({
  label,
  value,
  onValueChange,
  parameterKey,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onValueChange: (key: keyof OptimizationParameters, value: number[]) => void;
  parameterKey: keyof OptimizationParameters;
  min: number;
  max: number;
  step: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <Label>{label}</Label>
      <span className="text-sm font-medium">{value}</span>
    </div>
    <Slider
      value={[value]}
      onValueChange={(newValue) => onValueChange(parameterKey, newValue)}
      min={min}
      max={max}
      step={step}
    />
  </div>
);

export function OptimizationParametersCard() {
  const dispatch = useAppDispatch();
  const parameters = useAppSelector((state) => state.optimization.parameters);

  const handleParameterChange = (key: keyof OptimizationParameters, value: number[]) => {
    dispatch(updateParameters({ [key]: value[0] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ParameterInput
          label="Risk Tolerance"
          value={parameters.riskTolerance}
          onValueChange={handleParameterChange}
          parameterKey="riskTolerance"
          min={0}
          max={10}
          step={1}
        />
        <ParameterInput
          label="Tax Bracket (%)"
          value={parameters.taxBracket}
          onValueChange={handleParameterChange}
          parameterKey="taxBracket"
          min={0}
          max={50}
          step={1}
        />
        <ParameterInput
          label="Turnover Tolerance (%)"
          value={parameters.turnoverTolerance}
          onValueChange={handleParameterChange}
          parameterKey="turnoverTolerance"
          min={0}
          max={100}
          step={5}
        />
        <ParameterInput
          label="ESG Score"
          value={parameters.esgScore}
          onValueChange={handleParameterChange}
          parameterKey="esgScore"
          min={0}
          max={100}
          step={5}
        />
        <ParameterInput
          label="Time Horizon (Years)"
          value={parameters.timeHorizon}
          onValueChange={handleParameterChange}
          parameterKey="timeHorizon"
          min={1}
          max={30}
          step={1}
        />
      </CardContent>
    </Card>
  );
} 