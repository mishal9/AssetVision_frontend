import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateParameters, OptimizationParameters } from '@/store/optimizationSlice';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
  onValueChange: (key: keyof OptimizationParameters, value: unknown[]) => void;
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

  const handleParameterChange = (key: keyof OptimizationParameters, value: unknown[]) => {
    dispatch(updateParameters({ [key]: value[0] } as Partial<OptimizationParameters>));
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
          label="Time Horizon (Years)"
          value={parameters.timeHorizon}
          onValueChange={handleParameterChange}
          parameterKey="timeHorizon"
          min={1}
          max={30}
          step={1}
        />

        <ParameterInput
          label="Look-back Period (Days)"
          value={parameters.lookbackDays}
          onValueChange={handleParameterChange}
          parameterKey="lookbackDays"
          min={365}
          max={1825}
          step={30}
        />

        {/* Objective selector */}
        <div className="space-y-2">
          <Label>Objective</Label>
          <Select
            value={parameters.objective}
            onValueChange={(value) => handleParameterChange('objective', [value as any])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select objective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MinRisk">Minimise Risk</SelectItem>
              <SelectItem value="MaxSharpe">Maximise Sharpe Ratio</SelectItem>
              <SelectItem value="MaxReturn">Maximise Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
} 