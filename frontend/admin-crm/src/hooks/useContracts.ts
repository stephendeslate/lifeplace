// frontend/admin-crm/src/hooks/useContracts.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { contractsApi } from "../apis/contracts.api";
import {
  ContractSignatureData,
  ContractTemplate,
  ContractTemplateFilters,
  ContractTemplateFormData,
  EventContractFormData,
  EventContractUpdateData,
} from "../types/contracts.types";

export const useContractTemplates = (
  page = 1,
  filters?: ContractTemplateFilters
) => {
  const queryClient = useQueryClient();
  const search = filters?.search;
  const eventTypeId = filters?.event_type;

  // Query to fetch contract templates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contractTemplates", page, search, eventTypeId],
    queryFn: () => contractsApi.getContractTemplates(page, search, eventTypeId),
  });

  // Mutation to create contract template
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: ContractTemplateFormData) =>
      contractsApi.createContractTemplate(templateData),
    onSuccess: (data) => {
      toast.success(`Template "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["contractTemplates"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create template";
      toast.error(errorMessage);
    },
  });

  // Mutation to update contract template
  const updateTemplateMutation = useMutation({
    mutationFn: ({
      id,
      templateData,
    }: {
      id: number;
      templateData: Partial<ContractTemplateFormData>;
    }) => contractsApi.updateContractTemplate(id, templateData),
    onMutate: async ({ id, templateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["contractTemplates"] });
      await queryClient.cancelQueries({ queryKey: ["contractTemplate", id] });

      // Snapshot the previous values
      const previousTemplates = queryClient.getQueryData([
        "contractTemplates",
        page,
        search,
        eventTypeId,
      ]);
      const previousTemplate = queryClient.getQueryData([
        "contractTemplate",
        id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["contractTemplates", page, search, eventTypeId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((template: ContractTemplate) =>
              template.id === id ? { ...template, ...templateData } : template
            ),
          };
        }
      );

      // Optimistically update the template detail if available
      if (previousTemplate) {
        queryClient.setQueryData(["contractTemplate", id], {
          ...previousTemplate,
          ...templateData,
        });
      }

      return { previousTemplates, previousTemplate };
    },
    onSuccess: (data) => {
      toast.success(`Template "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousTemplates) {
        queryClient.setQueryData(
          ["contractTemplates", page, search, eventTypeId],
          context.previousTemplates
        );
      }
      if (context?.previousTemplate) {
        queryClient.setQueryData(
          ["contractTemplate", variables.id],
          context.previousTemplate
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update template";
      toast.error(errorMessage);
    },
    onSettled: (data) => {
      // Refetch to ensure data consistency
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["contractTemplates"] });
        queryClient.invalidateQueries({
          queryKey: ["contractTemplate", data.id],
        });
      }
    },
  });

  // Mutation to delete contract template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => contractsApi.deleteContractTemplate(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["contractTemplates"] });

      // Snapshot the previous value
      const previousTemplates = queryClient.getQueryData([
        "contractTemplates",
        page,
        search,
        eventTypeId,
      ]);

      // Optimistically remove the template
      queryClient.setQueryData(
        ["contractTemplates", page, search, eventTypeId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.filter(
              (template: ContractTemplate) => template.id !== id
            ),
          };
        }
      );

      // Remove the template detail
      queryClient.removeQueries({ queryKey: ["contractTemplate", id] });

      return { previousTemplates };
    },
    onSuccess: () => {
      toast.success("Template deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousTemplates) {
        queryClient.setQueryData(
          ["contractTemplates", page, search, eventTypeId],
          context.previousTemplates
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete template";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["contractTemplates"] });
    },
  });

  return {
    templates: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
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
  };
};

export const useContractTemplate = (id?: number) => {
  // Query to fetch a specific template
  const {
    data: template,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["contractTemplate", id],
    queryFn: () => (id ? contractsApi.getContractTemplateById(id) : null),
    enabled: !!id,
  });

  return {
    template,
    isLoading,
    error,
    refetch,
  };
};

export const useEventContracts = (eventId?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch contracts for an event
  const {
    data: contracts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventContracts", eventId],
    queryFn: () => (eventId ? contractsApi.getContractsForEvent(eventId) : []),
    enabled: !!eventId,
  });

  // Mutation to create event contract
  const createContractMutation = useMutation({
    mutationFn: (contractData: EventContractFormData) =>
      contractsApi.createEventContract(contractData),
    onSuccess: (data) => {
      toast.success("Contract created successfully");
      if (eventId) {
        queryClient.invalidateQueries({
          queryKey: ["eventContracts", eventId],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create contract";
      toast.error(errorMessage);
    },
  });

  // Mutation to update event contract status to SENT
  const sendContractMutation = useMutation({
    mutationFn: (id: number) => contractsApi.sendContract(id),
    onSuccess: (data) => {
      toast.success("Contract sent to client");
      if (eventId) {
        queryClient.invalidateQueries({
          queryKey: ["eventContracts", eventId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["eventContract", data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to send contract";
      toast.error(errorMessage);
    },
  });

  // Mutation to void a contract
  const voidContractMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      contractsApi.voidContract(id, reason),
    onSuccess: (data) => {
      toast.success("Contract voided successfully");
      if (eventId) {
        queryClient.invalidateQueries({
          queryKey: ["eventContracts", eventId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["eventContract", data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to void contract";
      toast.error(errorMessage);
    },
  });

  return {
    contracts: contracts || [],
    isLoading,
    error,
    refetch,
    createContract: createContractMutation.mutate,
    isCreating: createContractMutation.isPending,
    sendContract: sendContractMutation.mutate,
    isSending: sendContractMutation.isPending,
    voidContract: voidContractMutation.mutate,
    isVoiding: voidContractMutation.isPending,
  };
};

export const useEventContract = (id?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific contract
  const {
    data: contract,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventContract", id],
    queryFn: () => (id ? contractsApi.getContractById(id) : null),
    enabled: !!id,
  });

  // Mutation to update contract
  const updateContractMutation = useMutation({
    mutationFn: (contractData: EventContractUpdateData) =>
      id
        ? contractsApi.updateEventContract(id, contractData)
        : Promise.reject("No contract ID"),
    onSuccess: (data) => {
      toast.success("Contract updated successfully");
      queryClient.invalidateQueries({ queryKey: ["eventContract", id] });
      // Also invalidate the list of contracts for this event
      if (typeof data.event === "number") {
        queryClient.invalidateQueries({
          queryKey: ["eventContracts", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update contract";
      toast.error(errorMessage);
    },
  });

  // Mutation to sign contract
  const signContractMutation = useMutation({
    mutationFn: (signatureData: ContractSignatureData) =>
      id
        ? contractsApi.signContract(id, signatureData)
        : Promise.reject("No contract ID"),
    onSuccess: (data) => {
      toast.success("Contract signed successfully");
      queryClient.invalidateQueries({ queryKey: ["eventContract", id] });
      // Also invalidate the list of contracts for this event
      if (typeof data.event === "number") {
        queryClient.invalidateQueries({
          queryKey: ["eventContracts", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to sign contract";
      toast.error(errorMessage);
    },
  });

  return {
    contract,
    isLoading,
    error,
    refetch,
    updateContract: updateContractMutation.mutate,
    isUpdating: updateContractMutation.isPending,
    signContract: signContractMutation.mutate,
    isSigning: signContractMutation.isPending,
  };
};
