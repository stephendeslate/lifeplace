// frontend/admin-crm/src/hooks/useNotifications.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { notificationsApi } from "../apis/notifications.api";
import {
  NotificationBulkActionRequest,
  NotificationPreferenceFormData,
  NotificationTemplateFormData,
  NotificationType,
  NotificationTypeFormData,
} from "../types/notifications.types";

export const useNotifications = (page = 1, is_read?: boolean) => {
  const queryClient = useQueryClient();

  // Query to fetch notifications
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", page, is_read],
    queryFn: () => notificationsApi.getNotifications(page, is_read),
  });

  // Query to fetch unread notifications
  const {
    data: unreadData,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useQuery({
    queryKey: ["notifications", "unread", page],
    queryFn: () => notificationsApi.getUnreadNotifications(page),
    enabled: is_read === undefined, // Only fetch if not already filtering by is_read
  });

  // Query to fetch notification counts
  const {
    data: counts,
    isLoading: isLoadingCounts,
    refetch: refetchCounts,
  } = useQuery({
    queryKey: ["notifications", "counts"],
    queryFn: () => notificationsApi.getNotificationCounts(),
    // Refresh counts every 30 seconds for real-time updates
    refetchInterval: 30000,
  });

  // Query to fetch recent notifications for dropdown
  const {
    data: recentNotifications,
    isLoading: isLoadingRecent,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsApi.getRecentNotifications(5),
    // Refresh recent notifications every 30 seconds
    refetchInterval: 30000,
  });

  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  // Mutation to mark notification as unread
  const markAsUnreadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsUnread(id),
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark notification as unread");
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: (data) => {
      toast.success(`Marked ${data.marked_read} notifications as read`);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  // Mutation to perform bulk action
  const bulkActionMutation = useMutation({
    mutationFn: (data: NotificationBulkActionRequest) =>
      notificationsApi.bulkAction(data),
    onSuccess: (data) => {
      const actionMap = {
        mark_read: "marked as read",
        mark_unread: "marked as unread",
        delete: "deleted",
      };
      toast.success(
        `${data.count} notifications ${
          actionMap[data.action as keyof typeof actionMap]
        }`
      );
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to perform bulk action");
    },
  });

  // Mutation to delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      toast.success("Notification deleted");
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  const refetchAll = () => {
    refetch();
    refetchUnread();
    refetchCounts();
    refetchRecent();
  };

  return {
    notifications: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    unreadNotifications: unreadData?.results || [],
    unreadCount: counts?.unread || 0,
    totalNotifications: counts?.total || 0,
    isLoadingUnread,
    isLoadingCounts,
    recentNotifications: recentNotifications || [],
    isLoadingRecent,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAsUnread: markAsUnreadMutation.mutate,
    isMarkingAsUnread: markAsUnreadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    bulkAction: bulkActionMutation.mutate,
    isBulkActioning: bulkActionMutation.isPending,
    deleteNotification: deleteNotificationMutation.mutate,
    isDeleting: deleteNotificationMutation.isPending,
    refetch: refetchAll,
  };
};

// Hook for notification preferences
export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();

  // Query to fetch user preferences
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: () => notificationsApi.getUserPreferences(),
  });

  // Mutation to update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: NotificationPreferenceFormData) =>
      notificationsApi.updateUserPreferences(data),
    onSuccess: () => {
      toast.success("Notification preferences updated");
      // Invalidate preferences query to refresh data
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
    onError: () => {
      toast.error("Failed to update notification preferences");
    },
  });

  return {
    preferences,
    isLoading,
    error,
    refetch,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
};

// Hook for notification types
export const useNotificationTypes = (page = 1) => {
  const queryClient = useQueryClient();

  // Query to fetch notification types
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notificationTypes", page],
    queryFn: () => notificationsApi.getNotificationTypes(page),
  });

  // Mutation to create notification type
  const createTypeMutation = useMutation({
    mutationFn: (typeData: NotificationTypeFormData) =>
      notificationsApi.createNotificationType(typeData),
    onSuccess: () => {
      toast.success("Notification type created");
      // Invalidate notification types query to refresh data
      queryClient.invalidateQueries({ queryKey: ["notificationTypes"] });
    },
    onError: () => {
      toast.error("Failed to create notification type");
    },
  });

  // Mutation to update notification type
  const updateTypeMutation = useMutation({
    mutationFn: ({
      id,
      typeData,
    }: {
      id: number;
      typeData: Partial<NotificationTypeFormData>;
    }) => notificationsApi.updateNotificationType(id, typeData),
    onSuccess: () => {
      toast.success("Notification type updated");
      // Invalidate notification types query to refresh data
      queryClient.invalidateQueries({ queryKey: ["notificationTypes"] });
    },
    onError: () => {
      toast.error("Failed to update notification type");
    },
  });

  // Mutation to delete notification type
  const deleteTypeMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.deleteNotificationType(id),
    onSuccess: () => {
      toast.success("Notification type deleted");
      // Invalidate notification types query to refresh data
      queryClient.invalidateQueries({ queryKey: ["notificationTypes"] });
    },
    onError: () => {
      toast.error("Failed to delete notification type");
    },
  });

  return {
    notificationTypes: data?.results || ([] as NotificationType[]),
    totalCount: data?.count || 0,
    isLoading,
    error,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createType: createTypeMutation.mutate,
    isCreating: createTypeMutation.isPending,
    updateType: updateTypeMutation.mutate,
    isUpdating: updateTypeMutation.isPending,
    deleteType: deleteTypeMutation.mutate,
    isDeleting: deleteTypeMutation.isPending,
    refetch,
  };
};

// Hook for notification templates
export const useNotificationTemplates = (page = 1, type?: string) => {
  const queryClient = useQueryClient();

  // Query to fetch notification templates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notificationTemplates", page, type],
    queryFn: () => notificationsApi.getNotificationTemplates(page, type),
  });

  // Mutation to create notification template
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: NotificationTemplateFormData) =>
      notificationsApi.createNotificationTemplate(templateData),
    onSuccess: () => {
      toast.success("Notification template created");
      // Invalidate notification templates query to refresh data
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] });
    },
    onError: () => {
      toast.error("Failed to create notification template");
    },
  });

  // Mutation to update notification template
  const updateTemplateMutation = useMutation({
    mutationFn: ({
      id,
      templateData,
    }: {
      id: number;
      templateData: Partial<NotificationTemplateFormData>;
    }) => notificationsApi.updateNotificationTemplate(id, templateData),
    onSuccess: () => {
      toast.success("Notification template updated");
      // Invalidate notification templates query to refresh data
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] });
    },
    onError: () => {
      toast.error("Failed to update notification template");
    },
  });

  // Mutation to delete notification template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.deleteNotificationTemplate(id),
    onSuccess: () => {
      toast.success("Notification template deleted");
      // Invalidate notification templates query to refresh data
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates"] });
    },
    onError: () => {
      toast.error("Failed to delete notification template");
    },
  });

  return {
    templates: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createTemplate: createTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    updateTemplate: updateTemplateMutation.mutate,
    isUpdating: updateTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeleting: deleteTemplateMutation.isPending,
    refetch,
  };
};
