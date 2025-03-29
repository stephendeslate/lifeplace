// frontend/admin-crm/src/types/notifications.types.ts

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Notification type categories
export type NotificationCategory =
  | "SYSTEM"
  | "EVENT"
  | "TASK"
  | "PAYMENT"
  | "CLIENT"
  | "CONTRACT";

// Notification type - matches backend model exactly
export interface NotificationType {
  id: number;
  code: string;
  name: string;
  description: string;
  category: NotificationCategory;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Notification template - matches backend model exactly
export interface NotificationTemplate {
  id: number;
  notification_type: number;
  notification_type_details?: NotificationType;
  title: string;
  content: string;
  short_content: string;
  email_subject: string;
  email_body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Individual notification - matches backend model exactly
export interface Notification {
  id: number;
  recipient: number;
  notification_type: number;
  notification_type_details?: NotificationType;
  title: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string;
  content_type: string;
  object_id: number | null;
  is_emailed: boolean;
  emailed_at: string | null;
  created_at: string;
  updated_at: string;
}

// User notification preferences - matches backend model exactly
export interface NotificationPreference {
  id: number;
  user: number;
  email_enabled: boolean;
  in_app_enabled: boolean;
  system_notifications: boolean;
  event_notifications: boolean;
  task_notifications: boolean;
  payment_notifications: boolean;
  client_notifications: boolean;
  contract_notifications: boolean;
  disabled_types: number[];
  created_at: string;
  updated_at: string;
}

// Notification count
export interface NotificationCount {
  total: number;
  unread: number;
}

// Form data and request types
export interface NotificationTemplateFormData {
  notification_type: number;
  title: string;
  content: string;
  short_content?: string;
  email_subject?: string;
  email_body?: string;
  is_active?: boolean;
}

export interface NotificationTypeFormData {
  code: string;
  name: string;
  description?: string;
  category: NotificationCategory;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

export interface NotificationPreferenceFormData {
  email_enabled?: boolean;
  in_app_enabled?: boolean;
  system_notifications?: boolean;
  event_notifications?: boolean;
  task_notifications?: boolean;
  payment_notifications?: boolean;
  client_notifications?: boolean;
  contract_notifications?: boolean;
  disabled_types?: number[];
}

export interface NotificationBulkActionRequest {
  notification_ids: number[];
  action: "mark_read" | "mark_unread" | "delete";
}

// Response types
export interface NotificationTypeResponse
  extends PaginationResponse<NotificationType> {}
export interface NotificationTemplateResponse
  extends PaginationResponse<NotificationTemplate> {}
export interface NotificationResponse
  extends PaginationResponse<Notification> {}
