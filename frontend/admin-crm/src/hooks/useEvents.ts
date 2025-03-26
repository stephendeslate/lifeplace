// frontend/admin-crm/src/hooks/useEvents.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { eventsApi } from "../apis/events.api";
import {
  Event,
  EventFilters,
  EventFormData,
  EventTaskFormData,
  EventTypeFormData,
} from "../types/events.types";

export const useEvents = (page = 1, filters?: EventFilters) => {
  const queryClient = useQueryClient();

  // Query to fetch events
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["events", page, filters],
    queryFn: () => eventsApi.getEvents(page, filters),
  });

  // Mutation to create event
  const createEventMutation = useMutation({
    mutationFn: (eventData: EventFormData) => eventsApi.createEvent(eventData),
    onSuccess: (data) => {
      toast.success(`Event "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create event";
      toast.error(errorMessage);
    },
  });

  // Mutation to update event
  const updateEventMutation = useMutation({
    mutationFn: ({
      id,
      eventData,
    }: {
      id: number;
      eventData: Partial<EventFormData>;
    }) => eventsApi.updateEvent(id, eventData),
    onSuccess: (data) => {
      toast.success(`Event "${data.name}" updated successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update event";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete event
  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => eventsApi.deleteEvent(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["events", page, filters]);

      // Optimistically update to remove the event
      queryClient.setQueryData(["events", page, filters], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.filter((event: Event) => event.id !== id),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Event deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["events", page, filters],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete event";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  // Mutation to update event status
  const updateEventStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      eventsApi.updateEventStatus(id, status),
    onSuccess: (data) => {
      toast.success(`Event status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update event status";
      toast.error(errorMessage);
    },
  });

  // Mutation to update event stage
  const updateEventStageMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: number; stageId: number }) =>
      eventsApi.updateEventStage(id, stageId),
    onSuccess: (data) => {
      toast.success(`Event stage updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update event stage";
      toast.error(errorMessage);
    },
  });

  return {
    events: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createEvent: createEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    updateEvent: updateEventMutation.mutate,
    isUpdating: updateEventMutation.isPending,
    deleteEvent: deleteEventMutation.mutate,
    isDeleting: deleteEventMutation.isPending,
    updateEventStatus: updateEventStatusMutation.mutate,
    isUpdatingStatus: updateEventStatusMutation.isPending,
    updateEventStage: updateEventStageMutation.mutate,
    isUpdatingStage: updateEventStageMutation.isPending,
  };
};

export const useEvent = (id: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific event with its details
  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.getEventById(id),
    enabled: !!id,
  });

  // Query to fetch tasks for this event
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ["event", id, "tasks"],
    queryFn: () => eventsApi.getEventTasks(id),
    enabled: !!id,
  });

  // Query to fetch timeline for this event
  const {
    data: timeline,
    isLoading: isLoadingTimeline,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ["event", id, "timeline"],
    queryFn: () => eventsApi.getEventTimeline(id),
    enabled: !!id,
  });

  // Mutation to create task
  const createTaskMutation = useMutation({
    mutationFn: (taskData: EventTaskFormData) =>
      eventsApi.createEventTask(taskData),
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: ["event", id, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create task";
      toast.error(errorMessage);
    },
  });

  // Mutation to update task
  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      taskData,
    }: {
      taskId: number;
      taskData: Partial<EventTaskFormData>;
    }) => eventsApi.updateEventTask(taskId, taskData),
    onSuccess: () => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["event", id, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update task";
      toast.error(errorMessage);
    },
  });

  // Mutation to complete task
  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, notes }: { taskId: number; notes: string }) =>
      eventsApi.completeEventTask(taskId, notes),
    onSuccess: () => {
      toast.success("Task completed successfully");
      queryClient.invalidateQueries({ queryKey: ["event", id, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to complete task";
      toast.error(errorMessage);
    },
  });

  return {
    event,
    isLoading,
    error,
    refetch,
    tasks,
    isLoadingTasks,
    refetchTasks,
    timeline,
    isLoadingTimeline,
    refetchTimeline,
    createTask: createTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
    updateTask: updateTaskMutation.mutate,
    isUpdatingTask: updateTaskMutation.isPending,
    completeTask: completeTaskMutation.mutate,
    isCompletingTask: completeTaskMutation.isPending,
  };
};

export const useEventTypes = (page = 1, search?: string) => {
  const queryClient = useQueryClient();

  // Query to fetch event types
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["eventTypes", page, search],
    queryFn: () => eventsApi.getEventTypes(page, undefined, search),
  });

  // Query to fetch active event types only
  const { data: activeEventTypesData, isLoading: isLoadingActiveTypes } =
    useQuery({
      queryKey: ["eventTypes", "active"],
      queryFn: () => eventsApi.getActiveEventTypes(),
    });

  // Mutation to create event type
  const createEventTypeMutation = useMutation({
    mutationFn: (eventTypeData: EventTypeFormData) =>
      eventsApi.createEventType(eventTypeData),
    onSuccess: (data) => {
      toast.success(`Event type "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create event type";
      toast.error(errorMessage);
    },
  });

  // Mutation to update event type
  const updateEventTypeMutation = useMutation({
    mutationFn: ({
      id,
      eventTypeData,
    }: {
      id: number;
      eventTypeData: Partial<EventTypeFormData>;
    }) => eventsApi.updateEventType(id, eventTypeData),
    onSuccess: (data) => {
      toast.success(`Event type "${data.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update event type";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete event type
  const deleteEventTypeMutation = useMutation({
    mutationFn: (id: number) => eventsApi.deleteEventType(id),
    onSuccess: () => {
      toast.success("Event type deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete event type";
      toast.error(errorMessage);
    },
  });

  return {
    eventTypes: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    activeEventTypes: activeEventTypesData || [],
    isLoadingActiveTypes,
    createEventType: createEventTypeMutation.mutate,
    isCreating: createEventTypeMutation.isPending,
    updateEventType: updateEventTypeMutation.mutate,
    isUpdating: updateEventTypeMutation.isPending,
    deleteEventType: deleteEventTypeMutation.mutate,
    isDeleting: deleteEventTypeMutation.isPending,
  };
};
