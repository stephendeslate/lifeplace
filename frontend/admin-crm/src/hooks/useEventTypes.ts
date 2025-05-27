// frontend/admin-crm/src/hooks/useEventTypes.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { EventType } from "../types/events.types";
import api from "../utils/api";

// Event Type Form Data interface
export interface EventTypeFormData {
  name: string;
  description: string;
  is_active: boolean;
}

// API functions
const eventTypesApi = {
  getEventTypes: async (
    page = 1,
    search?: string,
    isActive?: boolean
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: EventType[];
  }> => {
    const params: Record<string, any> = { page };
    if (search) params.search = search;
    if (isActive !== undefined) params.is_active = isActive;

    const response = await api.get("/events/event-types/", { params });
    return response.data;
  },

  getEventTypeById: async (id: number): Promise<EventType> => {
    const response = await api.get(`/events/event-types/${id}/`);
    return response.data;
  },

  createEventType: async (
    eventTypeData: EventTypeFormData
  ): Promise<EventType> => {
    const response = await api.post("/events/event-types/", eventTypeData);
    return response.data;
  },

  updateEventType: async (
    id: number,
    eventTypeData: Partial<EventTypeFormData>
  ): Promise<EventType> => {
    const response = await api.put(`/events/event-types/${id}/`, eventTypeData);
    return response.data;
  },

  deleteEventType: async (id: number): Promise<void> => {
    await api.delete(`/events/event-types/${id}/`);
  },
};

export const useEventTypes = (
  page = 1,
  search?: string,
  isActive?: boolean
) => {
  const queryClient = useQueryClient();

  // Query to fetch event types
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["eventTypes", page, search, isActive],
    queryFn: () => eventTypesApi.getEventTypes(page, search, isActive),
  });

  // Mutation to create event type
  const createMutation = useMutation({
    mutationFn: (eventTypeData: EventTypeFormData) =>
      eventTypesApi.createEventType(eventTypeData),
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
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      eventTypeData,
    }: {
      id: number;
      eventTypeData: Partial<EventTypeFormData>;
    }) => eventTypesApi.updateEventType(id, eventTypeData),
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
  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventTypesApi.deleteEventType(id),
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
    // Data
    eventTypes: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },

    // Mutations
    createEventType: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateEventType: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteEventType: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

export const useEventType = (eventTypeId?: number) => {
  const {
    data: eventType,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventType", eventTypeId],
    queryFn: () => eventTypesApi.getEventTypeById(eventTypeId!),
    enabled: !!eventTypeId,
  });

  return {
    eventType,
    isLoading,
    error,
    refetch,
  };
};
