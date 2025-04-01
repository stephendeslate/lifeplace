// frontend/admin-crm/src/apis/dashboard.api.ts
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
import api from "../utils/api";

export const dashboardApi = {
  /**
   * Get complete dashboard summary data
   */
  getDashboardSummary: async (
    timeRange: TimeRange = "week"
  ): Promise<DashboardData> => {
    const response = await api.get<DashboardData>(
      "/dashboard/dashboard/summary/",
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  /**
   * Get events overview data
   */
  getEventsOverview: async (
    timeRange: TimeRange = "week"
  ): Promise<EventsOverview> => {
    const response = await api.get<EventsOverview>(
      "/dashboard/dashboard/events/",
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  /**
   * Get revenue overview data
   */
  getRevenueOverview: async (
    timeRange: TimeRange = "week"
  ): Promise<RevenueOverview> => {
    const response = await api.get<RevenueOverview>(
      "/dashboard/dashboard/revenue/",
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  /**
   * Get clients overview data
   */
  getClientsOverview: async (
    timeRange: TimeRange = "week"
  ): Promise<ClientsOverview> => {
    const response = await api.get<ClientsOverview>(
      "/dashboard/dashboard/clients/",
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  /**
   * Get tasks overview data
   */
  getTasksOverview: async (
    timeRange: TimeRange = "week"
  ): Promise<TasksOverview> => {
    const response = await api.get<TasksOverview>(
      "/dashboard/dashboard/tasks/",
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  /**
   * Get recent activity data
   */
  getRecentActivity: async (limit: number = 10): Promise<ActivityItem[]> => {
    const response = await api.get<ActivityItem[]>(
      "/dashboard/dashboard/activity/",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  /**
   * Get key metrics data
   */
  getKeyMetrics: async (
    timeRange: TimeRange = "week"
  ): Promise<DashboardMetric[]> => {
    const response = await api.get<DashboardMetric[]>(
      "/dashboard/dashboard/metrics/",
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  /**
   * Get user dashboard preferences
   */
  getUserPreferences: async (): Promise<DashboardPreference> => {
    const response = await api.get<DashboardPreference>(
      "/dashboard/preferences/my_preferences/"
    );
    return response.data;
  },

  /**
   * Update user dashboard preferences
   */
  updateUserPreferences: async (
    data: DashboardPreferenceFormData
  ): Promise<DashboardPreference> => {
    const response = await api.put<DashboardPreference>(
      "/dashboard/preferences/update_preferences/",
      data
    );
    return response.data;
  },
};

export default dashboardApi;
