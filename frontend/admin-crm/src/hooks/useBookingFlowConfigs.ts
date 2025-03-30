// frontend/admin-crm/src/hooks/useBookingFlowConfigs.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { bookingFlowApi } from "../apis/bookingflow.api";
import {
  BookingFlowConfig,
  BookingFlowConfigFormData,
} from "../types/bookingflow.types";

export const useBookingFlowConfigs = (
  page = 1,
  eventTypeId?: number,
  isActive?: boolean
) => {
  const queryClient = useQueryClient();

  // Query to fetch booking flow configurations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookingFlowConfigs", page, eventTypeId, isActive],
    queryFn: () => bookingFlowApi.getConfigs(page, eventTypeId, isActive),
  });

  // Mutation to create config
  const createConfigMutation = useMutation({
    mutationFn: (configData: BookingFlowConfigFormData) =>
      bookingFlowApi.createConfig(configData),
    onSuccess: (data) => {
      toast.success(`Configuration "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["bookingFlowConfigs"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create configuration";
      toast.error(errorMessage);
    },
  });

  // Mutation to update config
  const updateConfigMutation = useMutation({
    mutationFn: ({
      id,
      configData,
    }: {
      id: number;
      configData: Partial<BookingFlowConfigFormData>;
    }) => bookingFlowApi.updateConfig(id, configData),
    onMutate: async ({ id, configData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["bookingFlowConfigs"] });
      await queryClient.cancelQueries({ queryKey: ["bookingFlowConfig", id] });

      // Snapshot the previous value
      const previousConfigs = queryClient.getQueryData([
        "bookingFlowConfigs",
        page,
        eventTypeId,
        isActive,
      ]);
      const previousConfig = queryClient.getQueryData([
        "bookingFlowConfig",
        id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["bookingFlowConfigs", page, eventTypeId, isActive],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((config: BookingFlowConfig) =>
              config.id === id ? { ...config, ...configData } : config
            ),
          };
        }
      );

      // Optimistically update the config detail if available
      if (previousConfig) {
        queryClient.setQueryData(["bookingFlowConfig", id], {
          ...previousConfig,
          ...configData,
        });
      }

      return { previousConfigs, previousConfig };
    },
    onSuccess: (data) => {
      toast.success(`Configuration "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousConfigs) {
        queryClient.setQueryData(
          ["bookingFlowConfigs", page, eventTypeId, isActive],
          context.previousConfigs
        );
      }
      if (context?.previousConfig) {
        queryClient.setQueryData(
          ["bookingFlowConfig", variables.id],
          context.previousConfig
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update configuration";
      toast.error(errorMessage);
    },
    onSettled: (data) => {
      // Refetch to ensure data consistency
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["bookingFlowConfigs"] });
        queryClient.invalidateQueries({
          queryKey: ["bookingFlowConfig", data.id],
        });
      }
    },
  });

  // Mutation to delete config
  const deleteConfigMutation = useMutation({
    mutationFn: (id: number) => bookingFlowApi.deleteConfig(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["bookingFlowConfigs"] });

      // Snapshot the previous value
      const previousConfigs = queryClient.getQueryData([
        "bookingFlowConfigs",
        page,
        eventTypeId,
        isActive,
      ]);

      // Optimistically remove the config
      queryClient.setQueryData(
        ["bookingFlowConfigs", page, eventTypeId, isActive],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.filter(
              (config: BookingFlowConfig) => config.id !== id
            ),
          };
        }
      );

      // Remove the config detail
      queryClient.removeQueries({ queryKey: ["bookingFlowConfig", id] });

      return { previousConfigs };
    },
    onSuccess: () => {
      toast.success("Configuration deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousConfigs) {
        queryClient.setQueryData(
          ["bookingFlowConfigs", page, eventTypeId, isActive],
          context.previousConfigs
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete configuration";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["bookingFlowConfigs"] });
    },
  });

  return {
    configs: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createConfig: createConfigMutation.mutate,
    isCreating: createConfigMutation.isPending,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
    deleteConfig: deleteConfigMutation.mutate,
    isDeleting: deleteConfigMutation.isPending,
  };
};

// Hook to get a single booking flow config by ID
export const useBookingFlowConfig = (id?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific config
  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookingFlowConfig", id],
    queryFn: () => (id ? bookingFlowApi.getConfigById(id) : null),
    enabled: !!id,
  });

  // Mutation to update config
  const updateConfigMutation = useMutation({
    mutationFn: (configData: Partial<BookingFlowConfigFormData>) =>
      id
        ? bookingFlowApi.updateConfig(id, configData)
        : Promise.reject("No config ID"),
    onSuccess: (data) => {
      toast.success(`Configuration "${data.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["bookingFlowConfig", id] });
      queryClient.invalidateQueries({ queryKey: ["bookingFlowConfigs"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update configuration";
      toast.error(errorMessage);
    },
  });

  return {
    config,
    isLoading,
    error,
    refetch,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
};

// Hook to get booking flow config for a specific event type
export const useBookingFlowConfigForEventType = (eventTypeId?: number) => {
  // Query to fetch config for event type
  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookingFlowConfigForEventType", eventTypeId],
    queryFn: () =>
      eventTypeId
        ? bookingFlowApi.getConfigForEventType(eventTypeId)
        : Promise.reject("No event type ID"),
    enabled: !!eventTypeId,
  });

  return {
    config,
    isLoading,
    error,
    refetch,
  };
};
