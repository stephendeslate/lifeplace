// frontend/admin-crm/src/pages/dashboard/Dashboard.tsx
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import {
  ClientsOverviewCard,
  DashboardHeader,
  DashboardLayout,
  DashboardSkeleton,
  EventsOverviewCard,
  MetricsCard,
  RecentActivityCard,
  RevenueOverviewCard,
  TasksOverviewCard,
} from "../../components/dashboard";
import useAuth from "../../hooks/useAuth";
import useDashboard from "../../hooks/useDashboard";
import { DashboardData, TimeRange } from "../../types/dashboard.types";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const { useGetDashboardSummary, useGetUserPreferences } = useDashboard();

  // Get user preferences
  const { data: preferences, isLoading: isLoadingPreferences } =
    useGetUserPreferences();

  // Update time range from preferences if available
  useEffect(() => {
    if (preferences?.default_time_range) {
      setTimeRange(preferences.default_time_range);
    }
  }, [preferences]);

  // Get dashboard data with explicit typing
  const dashboardQuery = useGetDashboardSummary(timeRange);
  const dashboardData = dashboardQuery.data as DashboardData | undefined;
  const isLoadingDashboard = dashboardQuery.isLoading;
  const isError = dashboardQuery.isError;
  const error = dashboardQuery.error;
  const refetch = dashboardQuery.refetch;
  const isFetching = dashboardQuery.isFetching;

  // Handle time range change
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Get user name for welcome message
  const userName = user ? `${user.first_name}` : "";

  // Determine if data is still loading
  const isLoading = isLoadingDashboard || isLoadingPreferences;

  // Show loading skeleton
  if (isLoading && !isFetching) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Dashboard Header */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        isLoading={isFetching}
        userName={userName}
      />

      {/* Error Alert */}
      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          Error loading dashboard data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      )}

      {/* Dashboard Content */}
      <DashboardLayout preferences={preferences}>
        {/* Key Metrics */}
        {{
          keyMetrics: (
            <MetricsCard
              metrics={dashboardData?.key_metrics}
              isLoading={isFetching}
            />
          ),

          /* Events Overview */
          eventsOverview: (
            <EventsOverviewCard
              eventsOverview={dashboardData?.events_overview}
              isLoading={isFetching}
            />
          ),

          /* Revenue Overview */
          revenueOverview: (
            <RevenueOverviewCard
              revenueOverview={dashboardData?.revenue_overview}
              isLoading={isFetching}
            />
          ),

          /* Clients Overview */
          clientsOverview: (
            <ClientsOverviewCard
              clientsOverview={dashboardData?.clients_overview}
              isLoading={isFetching}
            />
          ),

          /* Tasks Overview */
          tasksOverview: (
            <TasksOverviewCard
              tasksOverview={dashboardData?.tasks_overview}
              isLoading={isFetching}
            />
          ),

          /* Recent Activity */
          recentActivity: (
            <RecentActivityCard
              activities={dashboardData?.recent_activity}
              isLoading={isFetching}
            />
          ),
        }}
      </DashboardLayout>
    </Layout>
  );
};

export default Dashboard;
