// frontend/admin-crm/src/hooks/useBookingFlows.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { bookingFlowApi } from "../apis/bookingflow.api";
import { BookingFlow, BookingFlowFormData } from "../types/bookingflow.types";

export const useBookingFlows = (
  page = 1,
  eventTypeId?: number,
  isActive?: boolean,
  search?: string
) => {
  const queryClient = useQueryClient();

  // Query to fetch booking flows
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookingFlows", page, eventTypeId, isActive, search],
    queryFn: () =>
      bookingFlowApi.getBookingFlows(page, eventTypeId, isActive, search),
  });

  // Query to fetch active booking flows
  const { data: activeFlowsData, isLoading: isLoadingActiveFlows } = useQuery({
    queryKey: ["bookingFlows", "active", page, eventTypeId],
    queryFn: () => bookingFlowApi.getActiveBookingFlows(page, eventTypeId),
  });

  // Query to fetch event types
  const { data: eventTypes = [], isLoading: isLoadingEventTypes } = useQuery({
    queryKey: ["eventTypes"],
    queryFn: () => bookingFlowApi.getEventTypes(),
  });

  // Query to fetch workflow templates
  const {
    data: workflowTemplates = [],
    isLoading: isLoadingWorkflowTemplates,
  } = useQuery({
    queryKey: ["workflowTemplates", "forBookingFlow"],
    queryFn: () => bookingFlowApi.getWorkflowTemplates(),
  });

  // Mutation to create booking flow
  const createFlowMutation = useMutation({
    mutationFn: (flowData: BookingFlowFormData) =>
      bookingFlowApi.createBookingFlow(flowData),
    onSuccess: (data) => {
      toast.success(`Booking flow "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["bookingFlows"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create booking flow";
      toast.error(errorMessage);
    },
  });

  // Mutation to update booking flow
  const updateFlowMutation = useMutation({
    mutationFn: ({
      id,
      flowData,
    }: {
      id: number;
      flowData: Partial<BookingFlowFormData>;
    }) => bookingFlowApi.updateBookingFlow(id, flowData),
    onMutate: async ({ id, flowData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["bookingFlows"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "bookingFlows",
        page,
        eventTypeId,
        isActive,
        search,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["bookingFlows", page, eventTypeId, isActive, search],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((flow: BookingFlow) =>
              flow.id === id ? { ...flow, ...flowData } : flow
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(`Booking flow "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["bookingFlows", page, eventTypeId, isActive, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update booking flow";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["bookingFlows"] });
    },
  });

  // Mutation to delete booking flow
  const deleteFlowMutation = useMutation({
    mutationFn: (id: number) => bookingFlowApi.deleteBookingFlow(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["bookingFlows"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "bookingFlows",
        page,
        eventTypeId,
        isActive,
        search,
      ]);

      // Optimistically remove the flow
      queryClient.setQueryData(
        ["bookingFlows", page, eventTypeId, isActive, search],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.filter((flow: BookingFlow) => flow.id !== id),
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Booking flow deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["bookingFlows", page, eventTypeId, isActive, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete booking flow";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["bookingFlows"] });
    },
  });

  return {
    // All flows data
    flows: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },

    // Active flows data
    activeFlows: activeFlowsData?.results || [],
    totalActiveFlows: activeFlowsData?.count || 0,
    isLoadingActiveFlows,

    // Reference data
    eventTypes,
    isLoadingEventTypes,
    workflowTemplates,
    isLoadingWorkflowTemplates,

    // Flow mutations
    createFlow: createFlowMutation.mutate,
    isCreatingFlow: createFlowMutation.isPending,
    updateFlow: updateFlowMutation.mutate,
    isUpdatingFlow: updateFlowMutation.isPending,
    deleteFlow: deleteFlowMutation.mutate,
    isDeletingFlow: deleteFlowMutation.isPending,
  };
};

export const useBookingFlow = (flowId?: number) => {
  const queryKey = ["bookingFlow", flowId];

  // Query to fetch a specific booking flow with details
  const {
    data: flow,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => bookingFlowApi.getBookingFlowById(flowId!),
    enabled: !!flowId,
  });

  return {
    flow,
    isLoading,
    error,
    refetch,
  };
};
