// frontend/admin-crm/src/apis/notifications.api.ts
import {
  Notification,
  NotificationBulkActionRequest,
  NotificationCount,
  NotificationPreference,
  NotificationPreferenceFormData,
  NotificationResponse,
  NotificationTemplate,
  NotificationTemplateFormData,
  NotificationTemplateResponse,
  NotificationType,
  NotificationTypeFormData,
  NotificationTypeResponse,
} from "../types/notifications.types";
import api from "../utils/api";

export const notificationsApi = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async (
    page = 1,
    is_read?: boolean
  ): Promise<NotificationResponse> => {
    const params: Record<string, any> = { page };
    if (is_read !== undefined) {
      params.is_read = is_read;
    }
    const response = await api.get<NotificationResponse>(
      "/notifications/notifications/",
      { params }
    );
    return response.data;
  },

  /**
   * Get recent notifications (limited number)
   */
  getRecentNotifications: async (limit = 5): Promise<Notification[]> => {
    const response = await api.get<Notification[]>(
      "/notifications/notifications/recent/",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  /**
   * Get unread notifications
   */
  getUnreadNotifications: async (page = 1): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>(
      "/notifications/notifications/unread/",
      {
        params: { page },
      }
    );
    return response.data;
  },

  /**
   * Get notification counts
   */
  getNotificationCounts: async (): Promise<NotificationCount> => {
    const response = await api.get<NotificationCount>(
      "/notifications/notifications/counts/"
    );
    return response.data;
  },

  /**
   * Get notification by ID
   */
  getNotificationById: async (id: number): Promise<Notification> => {
    const response = await api.get<Notification>(
      `/notifications/notifications/${id}/`
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.post<Notification>(
      `/notifications/notifications/${id}/mark_read/`
    );
    return response.data;
  },

  /**
   * Mark notification as unread
   */
  markAsUnread: async (id: number): Promise<Notification> => {
    const response = await api.post<Notification>(
      `/notifications/notifications/${id}/mark_unread/`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ marked_read: number }> => {
    const response = await api.post<{ marked_read: number }>(
      "/notifications/notifications/mark_all_read/"
    );
    return response.data;
  },

  /**
   * Perform bulk action on notifications
   */
  bulkAction: async (
    data: NotificationBulkActionRequest
  ): Promise<{ action: string; count: number }> => {
    const response = await api.post<{ action: string; count: number }>(
      "/notifications/notifications/bulk_action/",
      data
    );
    return response.data;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/notifications/${id}/`);
  },

  /**
   * Get notification types
   */
  getNotificationTypes: async (page = 1): Promise<NotificationTypeResponse> => {
    const response = await api.get<NotificationTypeResponse>(
      "/notifications/types/",
      {
        params: { page },
      }
    );
    return response.data;
  },

  /**
   * Get notification type by ID
   */
  getNotificationTypeById: async (id: number): Promise<NotificationType> => {
    const response = await api.get<NotificationType>(
      `/notifications/types/${id}/`
    );
    return response.data;
  },

  /**
   * Create notification type
   */
  createNotificationType: async (
    data: NotificationTypeFormData
  ): Promise<NotificationType> => {
    const response = await api.post<NotificationType>(
      "/notifications/types/",
      data
    );
    return response.data;
  },

  /**
   * Update notification type
   */
  updateNotificationType: async (
    id: number,
    data: Partial<NotificationTypeFormData>
  ): Promise<NotificationType> => {
    const response = await api.put<NotificationType>(
      `/notifications/types/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Delete notification type
   */
  deleteNotificationType: async (id: number): Promise<void> => {
    await api.delete(`/notifications/types/${id}/`);
  },

  /**
   * Get notification templates
   */
  getNotificationTemplates: async (
    page = 1,
    type?: string
  ): Promise<NotificationTemplateResponse> => {
    const params: Record<string, any> = { page };
    if (type) {
      params.type = type;
    }
    const response = await api.get<NotificationTemplateResponse>(
      "/notifications/templates/",
      { params }
    );
    return response.data;
  },

  /**
   * Get notification template by ID
   */
  getNotificationTemplateById: async (
    id: number
  ): Promise<NotificationTemplate> => {
    const response = await api.get<NotificationTemplate>(
      `/notifications/templates/${id}/`
    );
    return response.data;
  },

  /**
   * Create notification template
   */
  createNotificationTemplate: async (
    data: NotificationTemplateFormData
  ): Promise<NotificationTemplate> => {
    const response = await api.post<NotificationTemplate>(
      "/notifications/templates/",
      data
    );
    return response.data;
  },

  /**
   * Update notification template
   */
  updateNotificationTemplate: async (
    id: number,
    data: Partial<NotificationTemplateFormData>
  ): Promise<NotificationTemplate> => {
    const response = await api.put<NotificationTemplate>(
      `/notifications/templates/${id}/`,
      data
    );
    return response.data;
  },

  /**
   * Delete notification template
   */
  deleteNotificationTemplate: async (id: number): Promise<void> => {
    await api.delete(`/notifications/templates/${id}/`);
  },

  /**
   * Get user notification preferences
   */
  getUserPreferences: async (): Promise<NotificationPreference> => {
    const response = await api.get<NotificationPreference>(
      "/notifications/preferences/my_preferences/"
    );
    return response.data;
  },

  /**
   * Update user notification preferences
   */
  updateUserPreferences: async (
    data: NotificationPreferenceFormData
  ): Promise<NotificationPreference> => {
    const response = await api.put<NotificationPreference>(
      "/notifications/preferences/update_preferences/",
      data
    );
    return response.data;
  },
};

export default notificationsApi;
