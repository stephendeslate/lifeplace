// frontend/admin-crm/src/hooks/useEvents.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { eventsApi } from "../apis/events.api";
import { EventType, EventTypeFormData } from "../types/events.types";

export const useEvents = (page = 1, search?: string) => {
  const queryClient = useQueryClient();

  // Query to fetch event types
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["eventTypes", page, search],
    queryFn: () => eventsApi.getEventTypes(page, undefined, search),
  });

  // Query to fetch active event types
  const { data: activeEventTypesData, isLoading: isLoadingActiveTypes } =
    useQuery({
      queryKey: ["eventTypes", "active", page],
      queryFn: () => eventsApi.getEventTypes(page, true, search),
    });

  // Mutation to create event type
  const createEventTypeMutation = useMutation({
    mutationFn: (eventTypeData: EventTypeFormData) =>
      eventsApi.createEventType(eventTypeData),
    onSuccess: (data) => {
      toast.success(`Event type "${data.name}" created successfully`);
      // Invalidate cache to refresh data
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
    onMutate: async ({ id, eventTypeData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["eventTypes"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "eventTypes",
        page,
        search,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["eventTypes", page, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.map((eventType: EventType) =>
            eventType.id === id ? { ...eventType, ...eventTypeData } : eventType
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(`Event type "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["eventTypes", page, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update event type";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
    },
  });

  // Mutation to delete event type
  const deleteEventTypeMutation = useMutation({
    mutationFn: (id: number) => eventsApi.deleteEventType(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["eventTypes"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "eventTypes",
        page,
        search,
      ]);

      // Optimistically remove the event type
      queryClient.setQueryData(["eventTypes", page, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.filter(
            (eventType: EventType) => eventType.id !== id
          ),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Event type deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["eventTypes", page, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete event type";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["eventTypes"] });
    },
  });

  return {
    // All event types data
    eventTypes: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },

    // Active event types data
    activeEventTypes: activeEventTypesData?.results || [],
    totalActiveTypes: activeEventTypesData?.count || 0,
    isLoadingActiveTypes,

    // Mutations
    createEventType: createEventTypeMutation.mutate,
    isCreatingEventType: createEventTypeMutation.isPending,
    updateEventType: updateEventTypeMutation.mutate,
    isUpdatingEventType: updateEventTypeMutation.isPending,
    deleteEventType: deleteEventTypeMutation.mutate,
    isDeletingEventType: deleteEventTypeMutation.isPending,
  };
};

export const useEventType = (id: number) => {
  const {
    data: eventType,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventType", id],
    queryFn: () => eventsApi.getEventTypeById(id),
    enabled: !!id,
  });

  return {
    eventType,
    isLoading,
    error,
    refetch,
  };
};
