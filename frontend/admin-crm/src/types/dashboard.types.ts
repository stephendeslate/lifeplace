// frontend/admin-crm/src/types/dashboard.types.ts
import { Client } from "./clients.types";
import { Event, EventTask } from "./events.types";
import { Payment } from "./payments.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Dashboard Preference Model
export interface DashboardPreference {
  id: number;
  layout: DashboardLayout;
  default_time_range: TimeRange;
  created_at: string;
  updated_at: string;
}

export interface DashboardLayout {
  widgets: string[];
  layout: {
    [key: string]: {
      position: number;
      size?: "small" | "medium" | "large";
    };
  };
}

// Available time ranges for dashboard data
export type TimeRange = "day" | "week" | "month" | "quarter" | "year";

// Dashboard metrics
export interface DashboardMetric {
  label: string;
  value: string | number;
  type?: "money" | "percentage" | "number";
  change: number | null;
  trend: "up" | "down" | "flat" | null;
  comparison_label: string | null;
}

// Chart data
export interface ChartData {
  chart_type: "line" | "bar" | "pie" | "doughnut" | "area";
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    [key: string]: any;
  }[];
  options?: Record<string, any>;
}

// Events overview
export interface EventsOverview {
  total_events: number;
  events_by_status: Record<string, number>;
  upcoming_events: Event[];
  events_trend: ChartData;
  change: number | null;
  trend: "up" | "down" | "flat" | null;
  comparison_label: string | null;
}

// Revenue overview
export interface RevenueOverview {
  total_revenue: number;
  revenue_by_status: Record<string, number>;
  recent_payments: Payment[];
  revenue_trend: ChartData;
  change: number | null;
  trend: "up" | "down" | "flat" | null;
  comparison_label: string | null;
  payment_summary: {
    due_today: number;
    overdue: number;
    upcoming: number;
  };
}

// Clients overview
export interface ClientsOverview {
  total_clients: number;
  active_clients: number;
  new_clients: number;
  clients_trend: ChartData;
  recent_clients: Client[];
  change: number | null;
  trend: "up" | "down" | "flat" | null;
  comparison_label: string | null;
}

// Tasks overview
export interface TasksOverview {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  urgent_tasks: number;
  tasks_by_status: Record<string, number>;
  upcoming_tasks: EventTask[];
  completion_rate: number;
}

// Activity item
export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  event_id: number | null;
  event_name: string | null;
  actor_id: number | null;
  actor_name: string;
}

// Complete dashboard data
export interface DashboardData {
  time_range: TimeRange;
  date_range: {
    start_date: string;
    end_date: string;
  };
  events_overview: EventsOverview;
  revenue_overview: RevenueOverview;
  clients_overview: ClientsOverview;
  tasks_overview: TasksOverview;
  key_metrics: DashboardMetric[];
  recent_activity: ActivityItem[];
}

// Dashboard preference form data
export interface DashboardPreferenceFormData {
  layout?: DashboardLayout;
  default_time_range?: TimeRange;
}
