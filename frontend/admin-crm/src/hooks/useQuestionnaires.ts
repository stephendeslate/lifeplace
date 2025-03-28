// frontend/admin-crm/src/hooks/useQuestionnaires.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { questionnairesApi } from "../apis/questionnaires.api";
import {
  Questionnaire,
  QuestionnaireField,
  QuestionnaireFilters,
  QuestionnaireFormData,
  QuestionnaireResponseFormData,
} from "../types/questionnaires.types";

export const useQuestionnaires = (page = 1, filters?: QuestionnaireFilters) => {
  const queryClient = useQueryClient();

  // Extract filter values
  const search = filters?.search;
  const eventType = filters?.event_type;
  const isActive = filters?.is_active;

  // Query to fetch questionnaires
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["questionnaires", page, eventType, isActive, search],
    queryFn: () =>
      questionnairesApi.getQuestionnaires(page, eventType, isActive, search),
  });

  // Mutation to create questionnaire
  const createQuestionnaireMutation = useMutation({
    mutationFn: (questionnaireData: QuestionnaireFormData) =>
      questionnairesApi.createQuestionnaire(questionnaireData),
    onSuccess: (data) => {
      toast.success(`Questionnaire "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create questionnaire";
      toast.error(errorMessage);
    },
  });

  // Mutation to update questionnaire
  const updateQuestionnaireMutation = useMutation({
    mutationFn: ({
      id,
      questionnaireData,
    }: {
      id: number;
      questionnaireData: Partial<QuestionnaireFormData>;
    }) => questionnairesApi.updateQuestionnaire(id, questionnaireData),
    onMutate: async ({ id, questionnaireData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaires"] });
      await queryClient.cancelQueries({ queryKey: ["questionnaire", id] });

      // Snapshot the previous values
      const previousQuestionnaires = queryClient.getQueryData([
        "questionnaires",
        page,
        eventType,
        isActive,
        search,
      ]);

      const previousQuestionnaire = queryClient.getQueryData([
        "questionnaire",
        id,
      ]);

      // Optimistically update the questionnaire in the list
      queryClient.setQueryData(
        ["questionnaires", page, eventType, isActive, search],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((questionnaire: Questionnaire) =>
              questionnaire.id === id
                ? { ...questionnaire, ...questionnaireData }
                : questionnaire
            ),
          };
        }
      );

      // Optimistically update the questionnaire detail if available
      if (previousQuestionnaire) {
        queryClient.setQueryData(["questionnaire", id], {
          ...previousQuestionnaire,
          ...questionnaireData,
        });
      }

      return { previousQuestionnaires, previousQuestionnaire };
    },
    onSuccess: (data) => {
      toast.success(`Questionnaire "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaires) {
        queryClient.setQueryData(
          ["questionnaires", page, eventType, isActive, search],
          context.previousQuestionnaires
        );
      }

      if (context?.previousQuestionnaire) {
        queryClient.setQueryData(
          ["questionnaire", variables.id],
          context.previousQuestionnaire
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to update questionnaire";
      toast.error(errorMessage);
    },
    onSettled: (data) => {
      // Refetch to ensure data consistency
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
        queryClient.invalidateQueries({ queryKey: ["questionnaire", data.id] });
      }
    },
  });

  // Mutation to delete questionnaire
  const deleteQuestionnaireMutation = useMutation({
    mutationFn: (id: number) => questionnairesApi.deleteQuestionnaire(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaires"] });
      await queryClient.cancelQueries({ queryKey: ["questionnaire", id] });

      // Snapshot the previous values
      const previousQuestionnaires = queryClient.getQueryData([
        "questionnaires",
        page,
        eventType,
        isActive,
        search,
      ]);

      // Optimistically update to remove the questionnaire
      queryClient.setQueryData(
        ["questionnaires", page, eventType, isActive, search],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.filter(
              (questionnaire: Questionnaire) => questionnaire.id !== id
            ),
          };
        }
      );

      // Remove the questionnaire detail
      queryClient.removeQueries({ queryKey: ["questionnaire", id] });

      return { previousQuestionnaires };
    },
    onSuccess: () => {
      toast.success("Questionnaire deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaires) {
        queryClient.setQueryData(
          ["questionnaires", page, eventType, isActive, search],
          context.previousQuestionnaires
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to delete questionnaire";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
    },
  });

  // Mutation to reorder questionnaires
  const reorderQuestionnairesMutation = useMutation({
    mutationFn: (orderMapping: Record<string, number>) =>
      questionnairesApi.reorderQuestionnaires(orderMapping),
    onMutate: async (orderMapping) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaires"] });

      // Snapshot the previous values
      const previousQuestionnaires = queryClient.getQueryData([
        "questionnaires",
        page,
        eventType,
        isActive,
        search,
      ]);

      // Get the current questionnaires
      const current = queryClient.getQueryData([
        "questionnaires",
        page,
        eventType,
        isActive,
        search,
      ]) as any;

      if (current && current.results) {
        // Create a new sorted array based on the order mapping
        const sortedResults = [...current.results].sort((a, b) => {
          const orderA = orderMapping[a.id.toString()] || a.order;
          const orderB = orderMapping[b.id.toString()] || b.order;
          return orderA - orderB;
        });

        // Update the cache with the new order
        queryClient.setQueryData(
          ["questionnaires", page, eventType, isActive, search],
          {
            ...current,
            results: sortedResults.map((questionnaire, index) => ({
              ...questionnaire,
              order: index + 1, // Update the order property
            })),
          }
        );
      }

      return { previousQuestionnaires };
    },
    onSuccess: () => {
      toast.success("Questionnaires reordered successfully");
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaires) {
        queryClient.setQueryData(
          ["questionnaires", page, eventType, isActive, search],
          context.previousQuestionnaires
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to reorder questionnaires";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
    },
  });

  return {
    questionnaires: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createQuestionnaire: createQuestionnaireMutation.mutate,
    isCreating: createQuestionnaireMutation.isPending,
    updateQuestionnaire: updateQuestionnaireMutation.mutate,
    isUpdating: updateQuestionnaireMutation.isPending,
    deleteQuestionnaire: deleteQuestionnaireMutation.mutate,
    isDeleting: deleteQuestionnaireMutation.isPending,
    reorderQuestionnaires: reorderQuestionnairesMutation.mutate,
    isReordering: reorderQuestionnairesMutation.isPending,
  };
};

export const useQuestionnaire = (id: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific questionnaire with its fields
  const {
    data: questionnaire,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["questionnaire", id],
    queryFn: () => questionnairesApi.getQuestionnaireById(id),
    enabled: !!id,
  });

  // Mutation to update questionnaire
  const updateQuestionnaireMutation = useMutation({
    mutationFn: (questionnaireData: Partial<QuestionnaireFormData>) =>
      questionnairesApi.updateQuestionnaire(id, questionnaireData),
    onMutate: async (questionnaireData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaire", id] });

      // Snapshot the previous value
      const previousQuestionnaire = queryClient.getQueryData([
        "questionnaire",
        id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["questionnaire", id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          ...questionnaireData,
        };
      });

      return { previousQuestionnaire };
    },
    onSuccess: (data) => {
      toast.success(`Questionnaire "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaire) {
        queryClient.setQueryData(
          ["questionnaire", id],
          context.previousQuestionnaire
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to update questionnaire";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["questionnaire", id] });
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
    },
  });

  // Mutation to delete questionnaire
  const deleteQuestionnaireMutation = useMutation({
    mutationFn: () => questionnairesApi.deleteQuestionnaire(id),
    onSuccess: () => {
      toast.success("Questionnaire deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
      queryClient.removeQueries({ queryKey: ["questionnaire", id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete questionnaire";
      toast.error(errorMessage);
    },
  });

  // Mutation to create field
  const createFieldMutation = useMutation({
    mutationFn: (fieldData: Partial<QuestionnaireField>) =>
      questionnairesApi.createQuestionnaireField(
        fieldData as QuestionnaireField
      ),
    onMutate: async (fieldData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaire", id] });

      // Snapshot the previous value
      const previousQuestionnaire = queryClient.getQueryData([
        "questionnaire",
        id,
      ]);

      // Create a temporary ID for optimistic update
      const tempId = Date.now();
      const newField = {
        ...fieldData,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically add the new field
      queryClient.setQueryData(["questionnaire", id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          fields: [...(old.fields || []), newField],
        };
      });

      return { previousQuestionnaire, tempId };
    },
    onSuccess: (data, variables, context) => {
      toast.success("Field created successfully");

      // Update the field with the real ID from the server response
      queryClient.setQueryData(["questionnaire", id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          fields: old.fields.map((field: QuestionnaireField) =>
            field.id === context?.tempId ? data : field
          ),
        };
      });
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaire) {
        queryClient.setQueryData(
          ["questionnaire", id],
          context.previousQuestionnaire
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to create field";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["questionnaire", id] });
    },
  });

  // Mutation to update field
  const updateFieldMutation = useMutation({
    mutationFn: ({
      fieldId,
      fieldData,
    }: {
      fieldId: number;
      fieldData: Partial<QuestionnaireField>;
    }) => questionnairesApi.updateQuestionnaireField(fieldId, fieldData),
    onMutate: async ({ fieldId, fieldData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaire", id] });

      // Snapshot the previous value
      const previousQuestionnaire = queryClient.getQueryData([
        "questionnaire",
        id,
      ]);

      // Optimistically update the field
      queryClient.setQueryData(["questionnaire", id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          fields: old.fields.map((field: QuestionnaireField) =>
            field.id === fieldId ? { ...field, ...fieldData } : field
          ),
        };
      });

      return { previousQuestionnaire };
    },
    onSuccess: () => {
      toast.success("Field updated successfully");
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaire) {
        queryClient.setQueryData(
          ["questionnaire", id],
          context.previousQuestionnaire
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to update field";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["questionnaire", id] });
    },
  });

  // Mutation to delete field
  const deleteFieldMutation = useMutation({
    mutationFn: (fieldId: number) =>
      questionnairesApi.deleteQuestionnaireField(fieldId),
    onMutate: async (fieldId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaire", id] });

      // Snapshot the previous value
      const previousQuestionnaire = queryClient.getQueryData([
        "questionnaire",
        id,
      ]);

      // Optimistically remove the field
      queryClient.setQueryData(["questionnaire", id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          fields: old.fields.filter(
            (field: QuestionnaireField) => field.id !== fieldId
          ),
        };
      });

      return { previousQuestionnaire };
    },
    onSuccess: () => {
      toast.success("Field deleted successfully");
    },
    onError: (error: any, fieldId, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaire) {
        queryClient.setQueryData(
          ["questionnaire", id],
          context.previousQuestionnaire
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to delete field";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["questionnaire", id] });
    },
  });

  // Mutation to reorder fields
  const reorderFieldsMutation = useMutation({
    mutationFn: (orderMapping: Record<string, number>) =>
      questionnairesApi.reorderFields(id, orderMapping),
    onMutate: async (orderMapping) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["questionnaire", id] });

      // Snapshot the previous value
      const previousQuestionnaire = queryClient.getQueryData([
        "questionnaire",
        id,
      ]);

      // Get the current questionnaire
      const current = queryClient.getQueryData(["questionnaire", id]) as any;

      if (current && current.fields) {
        // Create a new sorted array based on the order mapping
        const sortedFields = [...current.fields].sort((a, b) => {
          const orderA = orderMapping[a.id.toString()] || a.order;
          const orderB = orderMapping[b.id.toString()] || b.order;
          return orderA - orderB;
        });

        // Update the cache with the new order
        queryClient.setQueryData(["questionnaire", id], {
          ...current,
          fields: sortedFields.map((field, index) => ({
            ...field,
            order: index + 1, // Update the order property
          })),
        });
      }

      return { previousQuestionnaire };
    },
    onSuccess: () => {
      toast.success("Fields reordered successfully");
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuestionnaire) {
        queryClient.setQueryData(
          ["questionnaire", id],
          context.previousQuestionnaire
        );
      }

      const errorMessage =
        error.response?.data?.detail || "Failed to reorder fields";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["questionnaire", id] });
    },
  });

  return {
    questionnaire,
    isLoading,
    error,
    refetch,
    updateQuestionnaire: updateQuestionnaireMutation.mutate,
    isUpdating: updateQuestionnaireMutation.isPending,
    deleteQuestionnaire: deleteQuestionnaireMutation.mutate,
    isDeleting: deleteQuestionnaireMutation.isPending,
    createField: createFieldMutation.mutate,
    isCreatingField: createFieldMutation.isPending,
    updateField: updateFieldMutation.mutate,
    isUpdatingField: updateFieldMutation.isPending,
    deleteField: deleteFieldMutation.mutate,
    isDeletingField: deleteFieldMutation.isPending,
    reorderFields: reorderFieldsMutation.mutate,
    isReorderingFields: reorderFieldsMutation.isPending,
  };
};

export const useQuestionnaireResponses = (eventId?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch responses for an event
  const {
    data: responses,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["questionnaireResponses", eventId],
    queryFn: () => questionnairesApi.getEventResponses(eventId!),
    enabled: !!eventId,
  });

  // Mutation to save multiple responses for an event
  const saveResponsesMutation = useMutation({
    mutationFn: ({
      eventId,
      responses,
    }: {
      eventId: number;
      responses: { field: number; value: string }[];
    }) => questionnairesApi.saveEventResponses(eventId, responses),
    onSuccess: () => {
      toast.success("Responses saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["questionnaireResponses", eventId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to save responses";
      toast.error(errorMessage);
    },
  });

  // Mutation to create a single response
  const createResponseMutation = useMutation({
    mutationFn: (responseData: QuestionnaireResponseFormData) =>
      questionnairesApi.createResponse(responseData),
    onSuccess: () => {
      toast.success("Response saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["questionnaireResponses", eventId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to save response";
      toast.error(errorMessage);
    },
  });

  // Mutation to update a single response
  const updateResponseMutation = useMutation({
    mutationFn: ({
      responseId,
      responseData,
    }: {
      responseId: number;
      responseData: Partial<QuestionnaireResponseFormData>;
    }) => questionnairesApi.updateResponse(responseId, responseData),
    onSuccess: () => {
      toast.success("Response updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["questionnaireResponses", eventId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update response";
      toast.error(errorMessage);
    },
  });

  return {
    responses: responses || [],
    isLoading,
    error,
    refetch,
    saveResponses: saveResponsesMutation.mutate,
    isSaving: saveResponsesMutation.isPending,
    createResponse: createResponseMutation.mutate,
    isCreating: createResponseMutation.isPending,
    updateResponse: updateResponseMutation.mutate,
    isUpdating: updateResponseMutation.isPending,
  };
};
