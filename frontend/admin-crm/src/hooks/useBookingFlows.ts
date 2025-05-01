// frontend/admin-crm/src/hooks/useBookingFlows.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { bookingFlowApi } from "../apis/bookingflow.api";
import {
  AddonConfig,
  BookingFlow,
  BookingFlowDetail,
  BookingFlowFormData,
  ConfirmationConfig,
  DateConfig,
  IntroConfig,
  PackageConfig,
  PaymentConfig,
  QuestionnaireConfig,
  SummaryConfig,
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

  // NEW ADDITIONS: Mutations for specific config types

  // Mutation for updating intro configuration
  const updateIntroConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: IntroConfig;
    }) => bookingFlowApi.updateIntroConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Introduction configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update introduction configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation for updating date configuration
  const updateDateConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: DateConfig;
    }) => bookingFlowApi.updateDateConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Date configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update date configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation for updating questionnaire configuration
  const updateQuestionnaireConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: QuestionnaireConfig;
    }) => bookingFlowApi.updateQuestionnaireConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Questionnaire configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update questionnaire configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation for updating package configuration
  const updatePackageConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: PackageConfig;
    }) => bookingFlowApi.updatePackageConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Package configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update package configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation for updating addon configuration
  const updateAddonConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: AddonConfig;
    }) => bookingFlowApi.updateAddonConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Add-on configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update add-on configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation for updating summary configuration
  const updateSummaryConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: SummaryConfig;
    }) => bookingFlowApi.updateSummaryConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Summary configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update summary configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation for updating payment configuration
  const updatePaymentConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: PaymentConfig;
    }) => bookingFlowApi.updatePaymentConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Payment configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update payment configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation for updating confirmation configuration
  const updateConfirmationConfigMutation = useMutation({
    mutationFn: ({
      flowId,
      configData,
    }: {
      flowId: number;
      configData: ConfirmationConfig;
    }) => bookingFlowApi.updateConfirmationConfig(flowId, configData),
    onSuccess: () => {
      toast.success("Confirmation configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookingFlow"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to update confirmation configuration";
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

    // Configuration mutations
    updateIntroConfig: updateIntroConfigMutation.mutate,
    isUpdatingIntroConfig: updateIntroConfigMutation.isPending,
    updateDateConfig: updateDateConfigMutation.mutate,
    isUpdatingDateConfig: updateDateConfigMutation.isPending,
    updateQuestionnaireConfig: updateQuestionnaireConfigMutation.mutate,
    isUpdatingQuestionnaireConfig: updateQuestionnaireConfigMutation.isPending,
    updatePackageConfig: updatePackageConfigMutation.mutate,
    isUpdatingPackageConfig: updatePackageConfigMutation.isPending,
    updateAddonConfig: updateAddonConfigMutation.mutate,
    isUpdatingAddonConfig: updateAddonConfigMutation.isPending,
    updateSummaryConfig: updateSummaryConfigMutation.mutate,
    isUpdatingSummaryConfig: updateSummaryConfigMutation.isPending,
    updatePaymentConfig: updatePaymentConfigMutation.mutate,
    isUpdatingPaymentConfig: updatePaymentConfigMutation.isPending,
    updateConfirmationConfig: updateConfirmationConfigMutation.mutate,
    isUpdatingConfirmationConfig: updateConfirmationConfigMutation.isPending,
  };
};

/**
 * Hook for fetching a specific booking flow with all configurations
 */
export const useBookingFlow = (flowId?: number) => {
  // Query to fetch a specific booking flow with detail
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookingFlow", flowId],
    queryFn: () => bookingFlowApi.getBookingFlowById(flowId!),
    enabled: !!flowId,
  });

  return {
    flow: data as BookingFlowDetail | null, // Explicitly cast to BookingFlowDetail
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
