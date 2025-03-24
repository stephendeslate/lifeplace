// frontend/admin-crm/src/hooks/useWorkflows.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { workflowsApi } from "../apis/workflows.api";
import {
  ReorderStagesRequest,
  WorkflowStage,
  WorkflowStageFormData,
  WorkflowTemplate,
  WorkflowTemplateFormData,
} from "../types/workflows.types";

export const useWorkflows = (
  page = 1,
  eventTypeId?: number,
  search?: string
) => {
  const queryClient = useQueryClient();

  // Query to fetch workflow templates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["workflowTemplates", page, eventTypeId, search],
    queryFn: () =>
      workflowsApi.getWorkflowTemplates(page, eventTypeId, undefined, search),
  });

  // Query to fetch active templates
  const { data: activeTemplatesData, isLoading: isLoadingActiveTemplates } =
    useQuery({
      queryKey: ["workflowTemplates", "active", page],
      queryFn: () => workflowsApi.getActiveTemplates(page),
    });

  // Mutation to create template
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: WorkflowTemplateFormData) =>
      workflowsApi.createTemplate(templateData),
    onSuccess: (data) => {
      toast.success(`Workflow template "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["workflowTemplates"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create workflow template";
      toast.error(errorMessage);
    },
  });

  // Mutation to update template
  const updateTemplateMutation = useMutation({
    mutationFn: ({
      id,
      templateData,
    }: {
      id: number;
      templateData: Partial<WorkflowTemplateFormData>;
    }) => workflowsApi.updateTemplate(id, templateData),
    onMutate: async ({ id, templateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["workflowTemplates"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "workflowTemplates",
        page,
        eventTypeId,
        search,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["workflowTemplates", page, eventTypeId, search],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((template: WorkflowTemplate) =>
              template.id === id ? { ...template, ...templateData } : template
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(`Workflow template "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["workflowTemplates", page, eventTypeId, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update workflow template";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["workflowTemplates"] });
    },
  });

  // Mutation to delete template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => workflowsApi.deleteTemplate(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["workflowTemplates"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "workflowTemplates",
        page,
        eventTypeId,
        search,
      ]);

      // Optimistically remove the template
      queryClient.setQueryData(
        ["workflowTemplates", page, eventTypeId, search],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.filter(
              (template: WorkflowTemplate) => template.id !== id
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Workflow template deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["workflowTemplates", page, eventTypeId, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete workflow template";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["workflowTemplates"] });
    },
  });

  // Mutation to create stage
  const createStageMutation = useMutation({
    mutationFn: ({
      templateId,
      stageData,
    }: {
      templateId: number;
      stageData: WorkflowStageFormData;
    }) => workflowsApi.createStage(templateId, stageData),
    onSuccess: (data, variables) => {
      toast.success(`Workflow stage "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["workflowTemplate", variables.templateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workflowStages", variables.templateId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create workflow stage";
      toast.error(errorMessage);
    },
  });

  // Mutation to update stage
  const updateStageMutation = useMutation({
    mutationFn: ({
      id,
      stageData,
      templateId,
    }: {
      id: number;
      stageData: Partial<WorkflowStageFormData>;
      templateId: number;
    }) => workflowsApi.updateStage(id, stageData),
    onSuccess: (data, variables) => {
      toast.success(`Workflow stage "${data.name}" updated successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["workflowTemplate", variables.templateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workflowStages", variables.templateId],
      });
    },
    onError: (error: any, variables) => {
      // Handle specific known errors with user-friendly messages
      if (error.response?.data?.detail?.includes("already exists")) {
        toast.error(
          "Stage order updated but required reordering other stages. Refreshing view..."
        );
        // Still refresh the data to show the correct stage order
        queryClient.invalidateQueries({
          queryKey: ["workflowTemplate", variables.templateId],
        });
        queryClient.invalidateQueries({
          queryKey: ["workflowStages", variables.templateId],
        });
      } else {
        const errorMessage =
          error.response?.data?.detail || "Failed to update workflow stage";
        toast.error(errorMessage);
      }
    },
  });

  // Mutation to delete stage
  const deleteStageMutation = useMutation({
    mutationFn: ({ id, templateId }: { id: number; templateId: number }) =>
      workflowsApi.deleteStage(id),
    onSuccess: (_, variables) => {
      toast.success("Workflow stage deleted successfully");
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["workflowTemplate", variables.templateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workflowStages", variables.templateId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete workflow stage";
      toast.error(errorMessage);
    },
  });

  // Mutation to reorder stages
  const reorderStagesMutation = useMutation({
    mutationFn: (data: ReorderStagesRequest) =>
      workflowsApi.reorderStages(data),
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["workflowStages", data.template_id],
      });

      // Snapshot the previous values
      const previousStages = queryClient.getQueryData<WorkflowStage[]>([
        "workflowStages",
        data.template_id,
      ]);

      if (previousStages) {
        // Create a new array for the optimistic update
        const updatedStages = [...previousStages];

        // Create a sorted version of stages according to the new order mapping
        const sortedStages = [...updatedStages].sort((a, b) => {
          const orderA = data.order_mapping[a.id.toString()] || a.order;
          const orderB = data.order_mapping[b.id.toString()] || b.order;
          return orderA - orderB;
        });

        // Apply the new order values to maintain proper sequence
        sortedStages.forEach((stage, index) => {
          const stageIndex = updatedStages.findIndex((s) => s.id === stage.id);
          if (stageIndex !== -1) {
            // Order is 1-based, so add 1 to the index
            const newOrder = index + 1;
            updatedStages[stageIndex] = {
              ...updatedStages[stageIndex],
              order: newOrder,
            };

            // If this stage is in the order_mapping, update the mapping
            if (stage.id.toString() in data.order_mapping) {
              data.order_mapping[stage.id.toString()] = newOrder;
            }
          }
        });

        // Update the cache with optimistic data
        queryClient.setQueryData(
          ["workflowStages", data.template_id],
          updatedStages
        );
      }

      return { previousStages };
    },
    onSuccess: (data, variables) => {
      toast.success("Workflow stages reordered successfully");
      // Refresh the data to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["workflowTemplate", variables.template_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workflowStages", variables.template_id],
      });
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousStages) {
        queryClient.setQueryData(
          ["workflowStages", variables.template_id],
          context.previousStages
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to reorder workflow stages";
      toast.error(errorMessage);
    },
  });

  return {
    // All templates data
    templates: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },

    // Active templates data
    activeTemplates: activeTemplatesData?.results || [],
    totalActiveTemplates: activeTemplatesData?.count || 0,
    isLoadingActiveTemplates,

    // Template mutations
    createTemplate: createTemplateMutation.mutate,
    isCreatingTemplate: createTemplateMutation.isPending,
    updateTemplate: updateTemplateMutation.mutate,
    isUpdatingTemplate: updateTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeletingTemplate: deleteTemplateMutation.isPending,

    // Stage mutations
    createStage: createStageMutation.mutate,
    isCreatingStage: createStageMutation.isPending,
    updateStage: updateStageMutation.mutate,
    isUpdatingStage: updateStageMutation.isPending,
    deleteStage: deleteStageMutation.mutate,
    isDeletingStage: deleteStageMutation.isPending,
    reorderStages: reorderStagesMutation.mutate,
    isReorderingStages: reorderStagesMutation.isPending,
  };
};

export const useWorkflowTemplate = (templateId?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific template with stages
  const {
    data: template,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["workflowTemplate", templateId],
    queryFn: () => workflowsApi.getTemplateById(templateId!),
    enabled: !!templateId,
  });

  // Query to fetch stages for this template
  const {
    data: stages,
    isLoading: isLoadingStages,
    refetch: refetchStages,
  } = useQuery({
    queryKey: ["workflowStages", templateId],
    queryFn: () => workflowsApi.getStagesForTemplate(templateId!),
    enabled: !!templateId,
  });

  return {
    template,
    isLoading,
    error,
    refetch,
    stages,
    isLoadingStages,
    refetchStages,
  };
};
