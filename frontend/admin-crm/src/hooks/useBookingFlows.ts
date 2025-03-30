// frontend/admin-crm/src/hooks/useBookingFlows.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { bookingFlowApi } from "../apis/bookingflow.api";
import {
  BookingFlow,
  BookingFlowFormData,
  BookingStep,
  BookingStepFormData,
  ProductStepItemFormData,
  ReorderProductItemsRequest,
  ReorderStepsRequest,
} from "../types/bookingflow.types";

/**
 * Hook for managing booking flows
 */
export const useBookingFlows = (
  page = 1,
  eventTypeId?: number,
  searchTerm?: string
) => {
  const queryClient = useQueryClient();

  // Query to fetch booking flows
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookingFlows", page, eventTypeId, searchTerm],
    queryFn: () =>
      bookingFlowApi.getBookingFlows(page, eventTypeId, undefined, searchTerm),
  });

  // Query to fetch active booking flows
  const { data: activeFlowsData, isLoading: isLoadingActiveFlows } = useQuery({
    queryKey: ["bookingFlows", "active", page],
    queryFn: () => bookingFlowApi.getActiveBookingFlows(page),
  });

  // Mutation to create booking flow
  const createFlowMutation = useMutation({
    mutationFn: (flowData: BookingFlowFormData) =>
      bookingFlowApi.createBookingFlow(flowData),
    onSuccess: (data) => {
      toast.success(`Booking flow "${data.name}" created successfully`);
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
        searchTerm,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["bookingFlows", page, eventTypeId, searchTerm],
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
          ["bookingFlows", page, eventTypeId, searchTerm],
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
        searchTerm,
      ]);

      // Optimistically remove the booking flow
      queryClient.setQueryData(
        ["bookingFlows", page, eventTypeId, searchTerm],
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
          ["bookingFlows", page, eventTypeId, searchTerm],
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

  // Mutation to create step
  const createStepMutation = useMutation({
    mutationFn: ({
      flowId,
      stepData,
    }: {
      flowId: number;
      stepData: BookingStepFormData;
    }) => {
      const data = {
        ...stepData,
        booking_flow: flowId,
      };
      return bookingFlowApi.createBookingStep(data);
    },
    onSuccess: (data, variables) => {
      toast.success(`Booking step "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["bookingFlow", variables.flowId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookingSteps", variables.flowId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create booking step";
      toast.error(errorMessage);
    },
  });

  // Mutation to update step
  const updateStepMutation = useMutation({
    mutationFn: ({
      id,
      stepData,
      flowId,
    }: {
      id: number;
      stepData: Partial<BookingStepFormData>;
      flowId: number;
    }) => bookingFlowApi.updateBookingStep(id, stepData),
    onSuccess: (data, variables) => {
      toast.success(`Booking step "${data.name}" updated successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["bookingFlow", variables.flowId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookingSteps", variables.flowId],
      });
    },
    onError: (error: any, variables) => {
      // Handle specific known errors with user-friendly messages
      if (error.response?.data?.detail?.includes("already exists")) {
        toast.error(
          "Step order updated but required reordering other steps. Refreshing view..."
        );
        // Still refresh the data to show the correct step order
        queryClient.invalidateQueries({
          queryKey: ["bookingFlow", variables.flowId],
        });
        queryClient.invalidateQueries({
          queryKey: ["bookingSteps", variables.flowId],
        });
      } else {
        const errorMessage =
          error.response?.data?.detail || "Failed to update booking step";
        toast.error(errorMessage);
      }
    },
  });

  // Mutation to delete step
  const deleteStepMutation = useMutation({
    mutationFn: ({ id, flowId }: { id: number; flowId: number }) =>
      bookingFlowApi.deleteBookingStep(id),
    onSuccess: (_, variables) => {
      toast.success("Booking step deleted successfully");
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["bookingFlow", variables.flowId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookingSteps", variables.flowId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete booking step";
      toast.error(errorMessage);
    },
  });

  // Mutation to reorder steps
  const reorderStepsMutation = useMutation({
    mutationFn: (data: ReorderStepsRequest) =>
      bookingFlowApi.reorderSteps(data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["bookingSteps", data.flow_id],
      });

      // Snapshot the previous values
      const previousSteps = queryClient.getQueryData<BookingStep[]>([
        "bookingSteps",
        data.flow_id,
      ]);

      if (previousSteps) {
        // Create a new array for the optimistic update
        const updatedSteps = [...previousSteps];

        // Create a sorted version of steps according to the new order mapping
        const sortedSteps = [...updatedSteps].sort((a, b) => {
          const orderA = data.order_mapping[a.id.toString()] || a.order;
          const orderB = data.order_mapping[b.id.toString()] || b.order;
          return orderA - orderB;
        });

        // Apply the new order values to maintain proper sequence
        sortedSteps.forEach((step, index) => {
          const stepIndex = updatedSteps.findIndex((s) => s.id === step.id);
          if (stepIndex !== -1) {
            // Order is 1-based, so add 1 to the index
            const newOrder = index + 1;
            updatedSteps[stepIndex] = {
              ...updatedSteps[stepIndex],
              order: newOrder,
            };

            // If this step is in the order_mapping, update the mapping
            if (step.id.toString() in data.order_mapping) {
              data.order_mapping[step.id.toString()] = newOrder;
            }
          }
        });

        // Update the cache with optimistic data
        queryClient.setQueryData(["bookingSteps", data.flow_id], updatedSteps);
      }

      return { previousSteps };
    },
    onSuccess: (data, variables) => {
      toast.success("Booking steps reordered successfully");
      // Refresh the data to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["bookingFlow", variables.flow_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookingSteps", variables.flow_id],
      });
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousSteps) {
        queryClient.setQueryData(
          ["bookingSteps", variables.flow_id],
          context.previousSteps
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to reorder booking steps";
      toast.error(errorMessage);
    },
  });

  // Mutation to create product item
  const createProductItemMutation = useMutation({
    mutationFn: ({
      configId,
      itemData,
    }: {
      configId: number;
      itemData: ProductStepItemFormData;
    }) => bookingFlowApi.createProductItem(configId, itemData),
    onSuccess: (data, variables) => {
      toast.success("Product item added successfully");
      // Invalidate product items cache
      queryClient.invalidateQueries({
        queryKey: ["productItems", variables.configId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to add product item";
      toast.error(errorMessage);
    },
  });

  // Mutation to update product item
  const updateProductItemMutation = useMutation({
    mutationFn: ({
      id,
      itemData,
      configId,
    }: {
      id: number;
      itemData: Partial<ProductStepItemFormData>;
      configId: number;
    }) => bookingFlowApi.updateProductItem(id, itemData),
    onSuccess: (data, variables) => {
      toast.success("Product item updated successfully");
      // Invalidate product items cache
      queryClient.invalidateQueries({
        queryKey: ["productItems", variables.configId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update product item";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete product item
  const deleteProductItemMutation = useMutation({
    mutationFn: ({ id, configId }: { id: number; configId: number }) =>
      bookingFlowApi.deleteProductItem(id),
    onSuccess: (_, variables) => {
      toast.success("Product item deleted successfully");
      // Invalidate product items cache
      queryClient.invalidateQueries({
        queryKey: ["productItems", variables.configId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete product item";
      toast.error(errorMessage);
    },
  });

  // Mutation to reorder product items
  const reorderProductItemsMutation = useMutation({
    mutationFn: (data: ReorderProductItemsRequest) =>
      bookingFlowApi.reorderProductItems(data),
    onSuccess: (data, variables) => {
      toast.success("Product items reordered successfully");
      // Invalidate product items cache
      queryClient.invalidateQueries({
        queryKey: ["productItems", variables.config_id],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to reorder product items";
      toast.error(errorMessage);
    },
  });

  return {
    // Booking flows data
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

    // Flow mutations
    createFlow: createFlowMutation.mutate,
    isCreatingFlow: createFlowMutation.isPending,
    updateFlow: updateFlowMutation.mutate,
    isUpdatingFlow: updateFlowMutation.isPending,
    deleteFlow: deleteFlowMutation.mutate,
    isDeletingFlow: deleteFlowMutation.isPending,

    // Step mutations
    createStep: createStepMutation.mutate,
    isCreatingStep: createStepMutation.isPending,
    updateStep: updateStepMutation.mutate,
    isUpdatingStep: updateStepMutation.isPending,
    deleteStep: deleteStepMutation.mutate,
    isDeletingStep: deleteStepMutation.isPending,
    reorderSteps: reorderStepsMutation.mutate,
    isReorderingSteps: reorderStepsMutation.isPending,

    // Product item mutations
    createProductItem: createProductItemMutation.mutate,
    isCreatingProductItem: createProductItemMutation.isPending,
    updateProductItem: updateProductItemMutation.mutate,
    isUpdatingProductItem: updateProductItemMutation.isPending,
    deleteProductItem: deleteProductItemMutation.mutate,
    isDeletingProductItem: deleteProductItemMutation.isPending,
    reorderProductItems: reorderProductItemsMutation.mutate,
    isReorderingProductItems: reorderProductItemsMutation.isPending,
  };
};

/**
 * Hook for fetching a specific booking flow and its steps
 */
export const useBookingFlow = (flowId?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific booking flow with detail
  const {
    data: flow,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookingFlow", flowId],
    queryFn: () => bookingFlowApi.getBookingFlowById(flowId!),
    enabled: !!flowId,
  });

  // Query to fetch steps for this booking flow
  const {
    data: steps,
    isLoading: isLoadingSteps,
    refetch: refetchSteps,
  } = useQuery({
    queryKey: ["bookingSteps", flowId],
    queryFn: () => bookingFlowApi.getStepsForFlow(flowId!),
    enabled: !!flowId,
  });

  return {
    flow,
    isLoading,
    error,
    refetch,
    steps,
    isLoadingSteps,
    refetchSteps,
  };
};

/**
 * Hook for fetching product items for a config
 */
export const useProductItems = (configId?: number) => {
  // Query to fetch product items for a config
  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["productItems", configId],
    queryFn: () => bookingFlowApi.getProductItems(configId!),
    enabled: !!configId,
  });

  return {
    items,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for managing event types
 */
export const useEventTypes = (page = 1, search?: string) => {
  const queryClient = useQueryClient();

  // Query to fetch event types
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["eventTypes", page, search],
    queryFn: () => bookingFlowApi.getEventTypes(page, undefined, search),
  });

  // Query to fetch active event types
  const { data: activeEventTypesData, isLoading: isLoadingActiveTypes } =
    useQuery({
      queryKey: ["eventTypes", "active"],
      queryFn: () => bookingFlowApi.getActiveEventTypes(),
    });

  // Mutation to create event type
  const createEventTypeMutation = useMutation({
    mutationFn: (eventTypeData: any) =>
      bookingFlowApi.createEventType(eventTypeData),
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
    mutationFn: ({ id, eventTypeData }: { id: number; eventTypeData: any }) =>
      bookingFlowApi.updateEventType(id, eventTypeData),
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
    mutationFn: (id: number) => bookingFlowApi.deleteEventType(id),
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
