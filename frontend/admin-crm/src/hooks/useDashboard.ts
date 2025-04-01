// frontend/admin-crm/src/hooks/useDashboard.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../apis/dashboard.api";
import {
  ActivityItem,
  ClientsOverview,
  DashboardData,
  DashboardMetric,
  DashboardPreference,
  DashboardPreferenceFormData,
  EventsOverview,
  RevenueOverview,
  TasksOverview,
  TimeRange,
} from "../types/dashboard.types";

export const useDashboard = () => {
  const queryClient = useQueryClient();

  // Get dashboard summary
  const useGetDashboardSummary = (timeRange: TimeRange = "week") => {
    return useQuery<DashboardData>({
      queryKey: ["dashboard", "summary", timeRange],
      queryFn: () => dashboardApi.getDashboardSummary(timeRange),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get events overview
  const useGetEventsOverview = (timeRange: TimeRange = "week") => {
    return useQuery<EventsOverview>({
      queryKey: ["dashboard", "events", timeRange],
      queryFn: () => dashboardApi.getEventsOverview(timeRange),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get revenue overview
  const useGetRevenueOverview = (timeRange: TimeRange = "week") => {
    return useQuery<RevenueOverview>({
      queryKey: ["dashboard", "revenue", timeRange],
      queryFn: () => dashboardApi.getRevenueOverview(timeRange),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get clients overview
  const useGetClientsOverview = (timeRange: TimeRange = "week") => {
    return useQuery<ClientsOverview>({
      queryKey: ["dashboard", "clients", timeRange],
      queryFn: () => dashboardApi.getClientsOverview(timeRange),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get tasks overview
  const useGetTasksOverview = (timeRange: TimeRange = "week") => {
    return useQuery<TasksOverview>({
      queryKey: ["dashboard", "tasks", timeRange],
      queryFn: () => dashboardApi.getTasksOverview(timeRange),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get recent activity
  const useGetRecentActivity = (limit: number = 10) => {
    return useQuery<ActivityItem[]>({
      queryKey: ["dashboard", "activity", limit],
      queryFn: () => dashboardApi.getRecentActivity(limit),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  // Get key metrics
  const useGetKeyMetrics = (timeRange: TimeRange = "week") => {
    return useQuery<DashboardMetric[]>({
      queryKey: ["dashboard", "metrics", timeRange],
      queryFn: () => dashboardApi.getKeyMetrics(timeRange),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Get user preferences
  const useGetUserPreferences = () => {
    return useQuery<DashboardPreference>({
      queryKey: ["dashboard", "preferences"],
      queryFn: () => dashboardApi.getUserPreferences(),
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  // Update user preferences
  const useUpdateUserPreferences = () => {
    return useMutation<DashboardPreference, Error, DashboardPreferenceFormData>(
      {
        mutationFn: (data: DashboardPreferenceFormData) =>
          dashboardApi.updateUserPreferences(data),

        // When mutate is called:
        onMutate: async (newPreferenceData) => {
          // Cancel any outgoing refetches
          await queryClient.cancelQueries({
            queryKey: ["dashboard", "preferences"],
          });

          // Snapshot the previous value
          const previousPreferences =
            queryClient.getQueryData<DashboardPreference>([
              "dashboard",
              "preferences",
            ]);

          // Optimistically update the cache with the new preferences
          queryClient.setQueryData<DashboardPreference>(
            ["dashboard", "preferences"],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                ...newPreferenceData,
                // Ensure we keep required fields if they're not in the update
                id: old.id,
                created_at: old.created_at,
                updated_at: new Date().toISOString(),
              };
            }
          );

          // Return a context object with the snapshot
          return { previousPreferences };
        },

        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newPreferenceData, context: any) => {
          if (context?.previousPreferences) {
            queryClient.setQueryData(
              ["dashboard", "preferences"],
              context.previousPreferences
            );
          }
        },

        // Always refetch after error or success
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: ["dashboard", "preferences"],
          });
        },
      }
    );
  };

  // Return all hooks
  return {
    useGetDashboardSummary,
    useGetEventsOverview,
    useGetRevenueOverview,
    useGetClientsOverview,
    useGetTasksOverview,
    useGetRecentActivity,
    useGetKeyMetrics,
    useGetUserPreferences,
    useUpdateUserPreferences,
  };
};

export default useDashboard;
