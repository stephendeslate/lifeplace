// frontend/admin-crm/src/hooks/useSales.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { salesApi } from "../apis/sales.api";
import {
  EventQuote,
  EventQuoteFormData,
  QuoteTemplate,
  QuoteTemplateFilters,
  QuoteTemplateFormData,
  QuoteTemplateProductFormData,
} from "../types/sales.types";

/**
 * Hook to manage quote templates
 */
export const useQuoteTemplates = (page = 1, filters?: QuoteTemplateFilters) => {
  const queryClient = useQueryClient();

  // Extract filter values
  const search = filters?.search;
  const eventTypeId = filters?.event_type;
  const isActive = filters?.is_active;

  // Query to fetch quote templates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quoteTemplates", page, search, eventTypeId, isActive],
    queryFn: () =>
      salesApi.getQuoteTemplates(page, search, eventTypeId, isActive),
  });

  // Query to fetch active templates only
  const { data: activeTemplatesData, isLoading: isLoadingActiveTemplates } =
    useQuery({
      queryKey: ["quoteTemplates", "active", page],
      queryFn: () => salesApi.getActiveTemplates(page),
      enabled: !filters, // Only run if not already filtering
    });

  // Mutation to create template
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: QuoteTemplateFormData) =>
      salesApi.createQuoteTemplate(templateData),
    onSuccess: (data) => {
      toast.success(`Template "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["quoteTemplates"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create template";
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
      templateData: Partial<QuoteTemplateFormData>;
    }) => salesApi.updateQuoteTemplate(id, templateData),
    onMutate: async ({ id, templateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["quoteTemplates"] });
      await queryClient.cancelQueries({ queryKey: ["quoteTemplate", id] });

      // Snapshot the previous values
      const previousTemplates = queryClient.getQueryData([
        "quoteTemplates",
        page,
        search,
        eventTypeId,
        isActive,
      ]);
      const previousTemplate = queryClient.getQueryData(["quoteTemplate", id]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["quoteTemplates", page, search, eventTypeId, isActive],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((template: QuoteTemplate) =>
              template.id === id ? { ...template, ...templateData } : template
            ),
          };
        }
      );

      // Optimistically update the template detail if available
      if (previousTemplate) {
        queryClient.setQueryData(["quoteTemplate", id], {
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
          ["quoteTemplates", page, search, eventTypeId, isActive],
          context.previousTemplates
        );
      }
      if (context?.previousTemplate) {
        queryClient.setQueryData(
          ["quoteTemplate", variables.id],
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
        queryClient.invalidateQueries({ queryKey: ["quoteTemplates"] });
        queryClient.invalidateQueries({
          queryKey: ["quoteTemplate", data.id],
        });
      }
    },
  });

  // Mutation to delete template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => salesApi.deleteQuoteTemplate(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["quoteTemplates"] });

      // Snapshot the previous value
      const previousTemplates = queryClient.getQueryData([
        "quoteTemplates",
        page,
        search,
        eventTypeId,
        isActive,
      ]);

      // Optimistically remove the template
      queryClient.setQueryData(
        ["quoteTemplates", page, search, eventTypeId, isActive],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.filter(
              (template: QuoteTemplate) => template.id !== id
            ),
          };
        }
      );

      // Remove the template detail
      queryClient.removeQueries({ queryKey: ["quoteTemplate", id] });

      return { previousTemplates };
    },
    onSuccess: () => {
      toast.success("Template deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousTemplates) {
        queryClient.setQueryData(
          ["quoteTemplates", page, search, eventTypeId, isActive],
          context.previousTemplates
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete template";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["quoteTemplates"] });
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
    activeTemplates: activeTemplatesData?.results || [],
    isLoadingActiveTemplates,
    createTemplate: createTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    updateTemplate: updateTemplateMutation.mutate,
    isUpdating: updateTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeleting: deleteTemplateMutation.isPending,
  };
};

/**
 * Hook to manage a specific quote template
 */
export const useQuoteTemplate = (id?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch template details
  const {
    data: template,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quoteTemplate", id],
    queryFn: () => (id ? salesApi.getQuoteTemplateById(id) : null),
    enabled: !!id,
  });

  // Mutation to add product to template
  const addProductMutation = useMutation({
    mutationFn: (productData: QuoteTemplateProductFormData) =>
      salesApi.addProductToTemplate(productData),
    onSuccess: () => {
      toast.success("Product added to template successfully");
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["quoteTemplate", id] });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to add product to template";
      toast.error(errorMessage);
    },
  });

  // Mutation to update template product
  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      productData,
    }: {
      productId: number;
      productData: Partial<QuoteTemplateProductFormData>;
    }) => salesApi.updateTemplateProduct(productId, productData),
    onSuccess: () => {
      toast.success("Template product updated successfully");
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["quoteTemplate", id] });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update template product";
      toast.error(errorMessage);
    },
  });

  // Mutation to remove product from template
  const removeProductMutation = useMutation({
    mutationFn: (productId: number) =>
      salesApi.removeTemplateProduct(productId),
    onSuccess: () => {
      toast.success("Product removed from template successfully");
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["quoteTemplate", id] });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to remove product from template";
      toast.error(errorMessage);
    },
  });

  // Mutation to update contract templates
  const updateContractTemplatesMutation = useMutation({
    mutationFn: ({ contractTemplateIds }: { contractTemplateIds: number[] }) =>
      salesApi.updateQuoteTemplate(id!, {
        contract_templates: contractTemplateIds,
      }),
    onSuccess: () => {
      toast.success("Contract templates updated successfully");
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["quoteTemplate", id] });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update contract templates";
      toast.error(errorMessage);
      console.error("Contract template update error:", error);
    },
  });

  // Mutation to update questionnaires
  const updateQuestionnairesMutation = useMutation({
    mutationFn: ({ questionnaireIds }: { questionnaireIds: number[] }) =>
      salesApi.updateQuoteTemplate(id!, {
        questionnaires: questionnaireIds,
      }),
    onSuccess: () => {
      toast.success("Questionnaires updated successfully");
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["quoteTemplate", id] });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update questionnaires";
      toast.error(errorMessage);
      console.error("Questionnaire update error:", error);
    },
  });

  return {
    template,
    isLoading,
    error,
    refetch,
    addProduct: addProductMutation.mutate,
    isAddingProduct: addProductMutation.isPending,
    updateProduct: updateProductMutation.mutate,
    isUpdatingProduct: updateProductMutation.isPending,
    removeProduct: removeProductMutation.mutate,
    isRemovingProduct: removeProductMutation.isPending,
    updateContractTemplates: updateContractTemplatesMutation.mutate,
    isUpdatingContractTemplates: updateContractTemplatesMutation.isPending,
    updateQuestionnaires: updateQuestionnairesMutation.mutate,
    isUpdatingQuestionnaires: updateQuestionnairesMutation.isPending,
  };
};

/**
 * Hook to manage event quotes
 */
export const useEventQuotes = (eventId?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch quotes for an event
  const {
    data: quotes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventQuotes", eventId],
    queryFn: () => (eventId ? salesApi.getQuotesForEvent(eventId) : []),
    enabled: !!eventId,
  });

  // Mutation to create a quote
  const createQuoteMutation = useMutation({
    mutationFn: (quoteData: EventQuoteFormData) =>
      salesApi.createQuote(quoteData),
    onSuccess: (data) => {
      toast.success(`Quote created successfully`);
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["eventQuotes", eventId] });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create quote";
      toast.error(errorMessage);
    },
  });

  // Mutation to send a quote
  const sendQuoteMutation = useMutation({
    mutationFn: (quoteId: number) => salesApi.sendQuote(quoteId),
    onSuccess: (data) => {
      toast.success("Quote sent to client successfully");
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["eventQuotes", eventId] });
      }
      queryClient.invalidateQueries({ queryKey: ["eventQuote", data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to send quote";
      toast.error(errorMessage);
    },
  });

  // Mutation to duplicate a quote
  const duplicateQuoteMutation = useMutation({
    mutationFn: (quoteId: number) => salesApi.duplicateQuote(quoteId),
    onSuccess: (data) => {
      toast.success("Quote duplicated successfully");
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["eventQuotes", eventId] });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to duplicate quote";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete a quote
  const deleteQuoteMutation = useMutation({
    mutationFn: (quoteId: number) => salesApi.deleteQuote(quoteId),
    onMutate: async (quoteId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["eventQuotes", eventId] });

      // Snapshot the previous value
      const previousQuotes = queryClient.getQueryData(["eventQuotes", eventId]);

      // Optimistically remove the quote
      queryClient.setQueryData(["eventQuotes", eventId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.filter((quote: EventQuote) => quote.id !== quoteId);
      });

      return { previousQuotes };
    },
    onSuccess: () => {
      toast.success("Quote deleted successfully");
    },
    onError: (error: any, quoteId, context) => {
      // Revert to previous state if there's an error
      if (context?.previousQuotes) {
        queryClient.setQueryData(
          ["eventQuotes", eventId],
          context.previousQuotes
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete quote";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["eventQuotes", eventId] });
      }
    },
  });

  return {
    quotes: quotes || [],
    isLoading,
    error,
    refetch,
    createQuote: createQuoteMutation.mutate,
    isCreating: createQuoteMutation.isPending,
    sendQuote: sendQuoteMutation.mutate,
    isSending: sendQuoteMutation.isPending,
    duplicateQuote: duplicateQuoteMutation.mutate,
    isDuplicating: duplicateQuoteMutation.isPending,
    deleteQuote: deleteQuoteMutation.mutate,
    isDeleting: deleteQuoteMutation.isPending,
  };
};

/**
 * Hook to manage a specific event quote
 */
export const useEventQuote = (id?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific quote
  const {
    data: quote,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventQuote", id],
    queryFn: () => (id ? salesApi.getQuoteById(id) : null),
    enabled: !!id,
  });

  // Mutation to update quote
  const updateQuoteMutation = useMutation({
    mutationFn: (quoteData: Partial<EventQuoteFormData>) =>
      id ? salesApi.updateQuote(id, quoteData) : Promise.reject("No quote ID"),
    onSuccess: (data) => {
      toast.success("Quote updated successfully");
      queryClient.invalidateQueries({ queryKey: ["eventQuote", id] });
      if (typeof data.event === "number") {
        queryClient.invalidateQueries({
          queryKey: ["eventQuotes", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update quote";
      toast.error(errorMessage);
    },
  });

  // Mutation to send quote
  const sendQuoteMutation = useMutation({
    mutationFn: () =>
      id ? salesApi.sendQuote(id) : Promise.reject("No quote ID"),
    onSuccess: (data) => {
      toast.success("Quote sent to client successfully");
      queryClient.invalidateQueries({ queryKey: ["eventQuote", id] });
      if (typeof data.event === "number") {
        queryClient.invalidateQueries({
          queryKey: ["eventQuotes", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to send quote";
      toast.error(errorMessage);
    },
  });

  // Mutation to accept quote
  const acceptQuoteMutation = useMutation({
    mutationFn: (notes?: string) =>
      id ? salesApi.acceptQuote(id, notes) : Promise.reject("No quote ID"),
    onSuccess: (data) => {
      toast.success("Quote accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["eventQuote", id] });
      if (typeof data.event === "number") {
        queryClient.invalidateQueries({
          queryKey: ["eventQuotes", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to accept quote";
      toast.error(errorMessage);
    },
  });

  // Mutation to reject quote
  const rejectQuoteMutation = useMutation({
    mutationFn: (notes?: string) =>
      id ? salesApi.rejectQuote(id, notes) : Promise.reject("No quote ID"),
    onSuccess: (data) => {
      toast.success("Quote rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["eventQuote", id] });
      if (typeof data.event === "number") {
        queryClient.invalidateQueries({
          queryKey: ["eventQuotes", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to reject quote";
      toast.error(errorMessage);
    },
  });

  return {
    quote,
    isLoading,
    error,
    refetch,
    updateQuote: updateQuoteMutation.mutate,
    isUpdating: updateQuoteMutation.isPending,
    sendQuote: sendQuoteMutation.mutate,
    isSending: sendQuoteMutation.isPending,
    acceptQuote: acceptQuoteMutation.mutate,
    isAccepting: acceptQuoteMutation.isPending,
    rejectQuote: rejectQuoteMutation.mutate,
    isRejecting: rejectQuoteMutation.isPending,
  };
};
