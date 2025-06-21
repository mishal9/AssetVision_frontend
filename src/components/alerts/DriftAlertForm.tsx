"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  AlertRule,
  AlertRuleInput,
  AlertFrequency,
  ConditionType,
  ActionType,
} from '../../types/alerts';
import { Card, CardContent } from '../ui/card';
import { Loader2 } from 'lucide-react';

// Define form validation schema
const driftAlertSchema = z.object({
  name: z.string().min(3, { message: 'Alert name must be at least 3 characters' }),
  isActive: z.boolean().default(true),
  frequency: z.string(),
  conditionType: z.string(),
  thresholdPercent: z.number().min(0.1).max(50),
  driftType: z.enum(['absolute', 'relative']),
  portfolioId: z.string().uuid(),
  actionType: z.string(),
  sectorId: z.string().optional(),
  assetClassId: z.string().optional(),
});

type DriftAlertFormValues = z.infer<typeof driftAlertSchema>;

interface DriftAlertFormProps {
  initialData?: AlertRule;
  portfolios: { id: string; name: string }[];
  sectors?: { id: string; name: string }[];
  assetClasses?: { id: string; name: string }[];
  isLoading?: boolean;
  onSubmit: (data: AlertRuleInput) => Promise<void>;
}

export function DriftAlertForm({
  initialData,
  portfolios,
  sectors = [],
  assetClasses = [],
  isLoading = false,
  onSubmit,
}: DriftAlertFormProps) {
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with default values or existing alert data
  const form = useForm<DriftAlertFormValues>({
    resolver: zodResolver(driftAlertSchema),
    defaultValues: {
      name: initialData?.name || '',
      isActive: initialData?.isActive ?? true,
      frequency: initialData?.frequency || AlertFrequency.IMMEDIATE,
      conditionType: initialData?.conditionType || ConditionType.DRIFT,
      thresholdPercent: initialData?.conditionConfig?.thresholdPercent || 5,
      driftType: (initialData?.conditionConfig?.driftType as 'absolute' | 'relative') || 'absolute',
      portfolioId: initialData?.portfolioId || '',
      actionType: initialData?.actionType || ActionType.NOTIFICATION,
      sectorId: initialData?.conditionType === ConditionType.SECTOR_DRIFT 
        ? initialData?.conditionConfig?.sectorId 
        : undefined,
      assetClassId: initialData?.conditionType === ConditionType.ASSET_CLASS_DRIFT 
        ? initialData?.conditionConfig?.assetClassId 
        : undefined,
    },
  });

  // Watch for condition type changes to show/hide specific fields
  const conditionType = form.watch('conditionType');

  // Handle form submission
  const handleSubmit = async (values: DriftAlertFormValues) => {
    setSubmitting(true);
    try {
      // Create condition config based on condition type
      let conditionConfig: Record<string, any> = {
        portfolioId: values.portfolioId,
        thresholdPercent: values.thresholdPercent,
        driftType: values.driftType,
      };

      // Add sector-specific fields
      if (values.conditionType === ConditionType.SECTOR_DRIFT && values.sectorId) {
        conditionConfig.sectorId = values.sectorId;
      }

      // Add asset class-specific fields
      if (values.conditionType === ConditionType.ASSET_CLASS_DRIFT && values.assetClassId) {
        conditionConfig.assetClassId = values.assetClassId;
      }

      // Create alert rule data
      const alertRuleData: AlertRuleInput = {
        name: values.name,
        isActive: values.isActive,
        conditionType: values.conditionType as ConditionType,
        conditionConfig,
        actionType: values.actionType as ActionType,
        actionConfig: {}, // Default empty action config
        frequency: values.frequency as AlertFrequency,
        portfolioId: values.portfolioId,
      };

      await onSubmit(alertRuleData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a name for this alert" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your alert a descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="portfolioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a portfolio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {portfolios.map((portfolio) => (
                          <SelectItem key={portfolio.id} value={portfolio.id}>
                            {portfolio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active
                      </FormLabel>
                      <FormDescription>
                        Alert will be evaluated based on frequency
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AlertFrequency.IMMEDIATE}>
                          Immediately
                        </SelectItem>
                        <SelectItem value={AlertFrequency.DAILY}>
                          Daily
                        </SelectItem>
                        <SelectItem value={AlertFrequency.WEEKLY}>
                          Weekly
                        </SelectItem>
                        <SelectItem value={AlertFrequency.MONTHLY}>
                          Monthly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often this alert should be checked
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Drift Alert Configuration</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="conditionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drift Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drift type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ConditionType.DRIFT}>
                          Overall Portfolio Drift
                        </SelectItem>
                        <SelectItem value={ConditionType.SECTOR_DRIFT}>
                          Sector Drift
                        </SelectItem>
                        <SelectItem value={ConditionType.ASSET_CLASS_DRIFT}>
                          Asset Class Drift
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of drift to monitor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driftType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drift Calculation</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select calculation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="absolute">
                          Absolute (% change)
                        </SelectItem>
                        <SelectItem value="relative">
                          Relative (% from target)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How drift should be calculated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {conditionType === ConditionType.SECTOR_DRIFT && (
                <FormField
                  control={form.control}
                  name="sectorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All sectors" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All sectors</SelectItem>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Monitor all sectors or a specific one
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {conditionType === ConditionType.ASSET_CLASS_DRIFT && (
                <FormField
                  control={form.control}
                  name="assetClassId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All asset classes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All asset classes</SelectItem>
                          {assetClasses.map((assetClass) => (
                            <SelectItem key={assetClass.id} value={assetClass.id}>
                              {assetClass.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Monitor all asset classes or a specific one
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="thresholdPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Threshold Percentage: {field.value}%
                    </FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        max={50}
                        min={0.1}
                        step={0.1}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Alert when drift exceeds this percentage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Alert Actions</h3>
            <FormField
              control={form.control}
              name="actionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ActionType.NOTIFICATION}>
                        Send Notification
                      </SelectItem>
                      <SelectItem value={ActionType.EMAIL}>
                        Send Email
                      </SelectItem>
                      <SelectItem value={ActionType.IN_APP}>
                        Show In-App Message
                      </SelectItem>
                      <SelectItem value={ActionType.SUGGEST_REBALANCE}>
                        Suggest Rebalance
                      </SelectItem>
                      <SelectItem value={ActionType.CREATE_TASK}>
                        Create Task
                      </SelectItem>
                      <SelectItem value={ActionType.LOG_TO_JOURNAL}>
                        Log to Journal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    What should happen when the alert is triggered
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="submit" disabled={submitting || isLoading}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update Alert' : 'Create Alert'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default DriftAlertForm;
