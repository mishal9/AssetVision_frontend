"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertRule, ConditionType, AlertStatus } from "../../types/alerts";
import { alertsApi } from "../../services/alerts-api";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Plus,
  Filter,
  Bell,
  Search,
  ArrowUpDown,
  BarChart3,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Info,
  RefreshCw,
  ChevronDown as ChevronDownIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import DriftAlertCard from "./DriftAlertCard";
import { ErrorMessage } from "../ui/error-message";

export default function AlertsOverviewPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [error, setError] = useState<{title: string; message: string} | null>(null);

  // Fetch alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    console.log("Filter state changed, applying filters:", { statusFilter, activeTab, searchQuery, typeFilter });
    applyFilters();
  }, [alerts, activeTab, searchQuery, statusFilter, typeFilter]);

  // Add a debug log to check alert data after fetching
  useEffect(() => {
    if (alerts.length > 0) {
      console.log("Alerts data loaded:", alerts);
      // Display current filter state
      console.log("Current filter state:", { 
        statusFilter, 
        activeTab, 
        typeFilter, 
        searchQuery 
      });
    }
  }, [alerts, statusFilter, activeTab, typeFilter, searchQuery]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null); // Reset error state on each fetch attempt
    try {
      // Force console log to be visible
      console.warn("🔄 Fetching alerts...");
      const alertsData = await alertsApi.getAlertRules();
      // Log the raw alert data for debugging with more visible formatting
      console.warn("📊 Raw alert data from API:", alertsData);
      
      // Ensure isActive property is correctly synchronized with the alert status
      const processedAlerts = alertsData.map(alert => ({
        ...alert,
        isActive: alert.status === AlertStatus.ACTIVE
      }));
      
      console.warn("🔄 Processed alerts with synchronized status:", processedAlerts);
      setAlerts(processedAlerts);
      
      // Force immediate re-filtering of alerts
      const filtered = applyFiltersDirectly(processedAlerts);
      setFilteredAlerts(filtered);
    } catch (error) {
      console.error("❌ Failed to fetch alerts:", error);
      setError({
        title: "Failed to load alerts", 
        message: "There was a problem retrieving your alerts. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters directly to an alerts array (can be used with any alerts data, not just from state)
  const applyFiltersDirectly = (alertsData: AlertRule[]) => {
    let filtered = [...alertsData];

    // Apply tab filter
    if (activeTab === "drift") {
      filtered = filtered.filter((alert) =>
        [
          ConditionType.DRIFT,
          ConditionType.SECTOR_DRIFT,
          ConditionType.ASSET_CLASS_DRIFT,
        ].includes(alert.conditionType),
      );
    } else if (activeTab === "price") {
      filtered = filtered.filter(
        (alert) => alert.conditionType === ConditionType.PRICE_MOVEMENT,
      );
    } else if (activeTab === "other") {
      filtered = filtered.filter(
        (alert) =>
          ![
            ConditionType.DRIFT,
            ConditionType.SECTOR_DRIFT,
            ConditionType.ASSET_CLASS_DRIFT,
            ConditionType.PRICE_MOVEMENT,
          ].includes(alert.conditionType),
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((alert) =>
        alert.name.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      console.log("Applying status filter:", statusFilter);
      filtered = filtered.filter((alert) => {
        const isActiveAlert = alert.isActive === true || alert.status === AlertStatus.ACTIVE;
        return statusFilter === "active" ? isActiveAlert : !isActiveAlert;
      });
    }
    
    // Debug log for status filtering
    console.log("Status filter applied:", { 
      statusFilter, 
      alertsDataCount: alertsData.length, 
      filteredCount: filtered.length,
      sample: filtered.slice(0, 2).map(a => ({ id: a.id, name: a.name, isActive: a.isActive, status: a.status }))
    });

    return filtered;
  };

  // Original applyFilters that uses the alerts state
  const applyFilters = () => {
    let filtered = applyFiltersDirectly(alerts);

    // Apply type filter (we'll include this here for now)
    if (typeFilter !== "all") {
      filtered = filtered.filter((alert) => alert.conditionType === typeFilter);
    }
    setFilteredAlerts(filtered);
  };

  const handleCreateAlert = () => {
    router.push("/dashboard/alerts/create");
  };

  const handleViewAlert = (alertId: string) => {
    router.push(`/dashboard/alerts/${alertId}`);
  };

  const handleEditAlert = (alertId: string) => {
    router.push(`/dashboard/alerts/${alertId}/edit`);
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      // Find the current alert to toggle its status
      const currentAlert = alerts.find((alert) => alert.id === alertId);
      if (!currentAlert) {
        console.error("Alert not found with ID:", alertId);
        setError({
          title: "Alert Not Found",
          message: `Unable to find alert with ID: ${alertId}`
        });
        return;
      }

      // Toggle the active status
      const newActiveStatus = !currentAlert.isActive;
      const newStatus = newActiveStatus ? AlertStatus.ACTIVE : AlertStatus.PAUSED;

      // Optimistically update the UI
      const updateAlertState = (alertsList: AlertRule[]) => 
        alertsList.map(alert => 
          alert.id === alertId 
            ? { 
                ...alert, 
                isActive: newActiveStatus,
                status: newStatus
              } 
            : alert
        );

      setAlerts(prev => updateAlertState(prev));
      setFilteredAlerts(prev => updateAlertState(prev));

      try {
        // Call the API to update the status
        await alertsApi.updateAlertRule(alertId, {
          isActive: newActiveStatus,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update alert status:", error);
        setError({
          title: "Status Update Failed",
          message: `Failed to ${newActiveStatus ? 'activate' : 'deactivate'} the alert. Please try again.`
        });
        // Revert UI on error
        await fetchAlerts();
      }
    } catch (error) {
      console.error("Error in handleResolveAlert:", error);
      setError({
        title: "Operation Failed",
        message: "An unexpected error occurred while updating the alert status."
      });
      await fetchAlerts();
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (window.confirm("Are you sure you want to delete this alert?")) {
      try {
        await alertsApi.deleteAlertRule(alertId);

        // Refresh the alerts list
        fetchAlerts();
      } catch (error) {
        console.error("Failed to delete alert:", error);
        setError({
          title: "Delete Failed",
          message: "There was a problem deleting this alert. Please try again."
        });
      }
    }
  };

  const renderDriftAlerts = () => {
    const driftAlerts = filteredAlerts.filter((alert) =>
      [
        ConditionType.DRIFT,
        ConditionType.SECTOR_DRIFT,
        ConditionType.ASSET_CLASS_DRIFT,
      ].includes(alert.conditionType),
    );

    if (driftAlerts.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No drift alerts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a drift alert to monitor your portfolio allocation
          </p>
          <Button onClick={handleCreateAlert} className="mt-4">
            <Plus size={16} className="mr-2" />
            Create Drift Alert
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Alert Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {driftAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {alert.conditionType.replace(/_/g, " ")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div
                      className={`h-2.5 w-2.5 rounded-full mr-2 ${
                        alert.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="capitalize">
                      {alert.status?.toLowerCase() || (alert.isActive ? "active" : "inactive")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {alert.lastChecked
                    ? new Date(alert.lastChecked).toLocaleString()
                    : "Never"}
                </TableCell>
                <TableCell className="flex justify-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewAlert(alert.id)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                        <p>View alert details</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAlert(alert.id)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                        <p>Edit alert</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            await handleResolveAlert(alert.id);
                          }}
                          className={`h-8 w-8 relative ${!alert.isActive ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"}`}
                        >
                          {alert.isActive ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                        {alert.isActive ? "Deactivate alert" : "Activate alert"}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                        <p>Delete alert</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderAlertCards = () => {
    if (loading) {
      return (
        <div className="py-8 text-center flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading alerts...</p>
        </div>
      );
    }

    if (error) {
      return (
        <ErrorMessage 
          title={error.title}
          message={error.message}
          variant="destructive"
          action={{
            label: "Retry",
            onClick: fetchAlerts
          }}
          onDismiss={() => setError(null)}
        />
      );
    }

    if (filteredAlerts.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No alerts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Create an alert to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateAlert} className="mt-4">
              <Plus size={16} className="mr-2" />
              Create Alert
            </Button>
          )}
        </div>
      );
    }

    // If we're showing drift alerts, use the dedicated component
    if (activeTab === "drift") {
      return renderDriftAlerts();
    }

    // For other types, render alerts in a table
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Alert Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.name}</TableCell>
                  <TableCell>
                    {alert.conditionType ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {alert.conditionType.replace(/_/g, " ")}
                      </span>
                    ) : (
                      "Unknown"
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${alert.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {alert.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {alert.lastTriggered
                      ? new Date(alert.lastTriggered).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="flex justify-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewAlert(alert.id)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                          <p>View alert details</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAlert(alert.id)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                          <p>Edit alert</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "Toggle button clicked for alert:",
                                alert.id,
                              );
                              handleResolveAlert(alert.id);
                            }}
                            className={`h-8 w-8 ${!alert.isActive ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"}`}
                          >
                            {alert.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                          <p>
                            {alert.isActive
                              ? "Deactivate alert"
                              : "Activate alert"}
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="z-50 bg-foreground text-background shadow-md rounded-md py-2 px-4">
                          <p>Delete alert</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 px-4 relative" style={{ overflow: 'visible' }}>
        <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground">
              Manage your portfolio alerts and notifications
            </p>
          </div>
          <Button onClick={handleCreateAlert}>
            <Plus className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Alerts</TabsTrigger>
            <TabsTrigger value="drift">Drift Alerts</TabsTrigger>
            <TabsTrigger value="price">Price Alerts</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 items-center">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-8 w-full md:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

              <div className="w-[160px]">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    console.log("Status filter changed to:", value);
                    setStatusFilter(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="item-aligned" side="bottom" align="start" className="z-[9999]" style={{ position: 'relative', zIndex: 9999 }}>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>
        </div>

        <div className="py-6">
          <TabsContent value="all" className="mt-0">
            {renderAlertCards()}
          </TabsContent>

          <TabsContent value="drift" className="mt-0">
            {renderDriftAlerts()}
          </TabsContent>

          <TabsContent value="price" className="mt-0">
            {renderAlertCards()}
          </TabsContent>

          <TabsContent value="other" className="mt-0">
            {renderAlertCards()}
          </TabsContent>
        </div>
      </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
