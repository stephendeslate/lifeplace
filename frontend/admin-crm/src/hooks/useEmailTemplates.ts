// frontend/admin-crm/src/hooks/useEmailTemplates.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { communicationsApi } from "../apis/communications.api";
import {
  EmailTemplate,
  EmailTemplateWithVariables,
  TemplatePreviewRequest,
} from "../types/settings.types";

export const useEmailTemplates = () => {
  const queryClient = useQueryClient();

  // Query to fetch all email templates
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    error: templatesError,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: () => communicationsApi.getEmailTemplates(),
  });

  // Query to fetch admin invitation template with variables
  const {
    data: adminInvitationTemplate,
    isLoading: isLoadingAdminTemplate,
    error: adminTemplateError,
    refetch: refetchAdminTemplate,
  } = useQuery<EmailTemplateWithVariables>({
    queryKey: ["adminInvitationTemplate"],
    queryFn: () => communicationsApi.getAdminInvitationTemplate(),
  });

  // Query to fetch template variables
  const {
    data: templateVariables,
    isLoading: isLoadingVariables,
    error: variablesError,
  } = useQuery({
    queryKey: ["templateVariables"],
    queryFn: () => communicationsApi.getTemplateVariables(),
  });

  // Mutation to create email template
  const createTemplateMutation = useMutation({
    mutationFn: (template: Partial<EmailTemplate>) =>
      communicationsApi.createEmailTemplate(template),
    onSuccess: (data) => {
      toast.success(`Template "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create template";
      toast.error(errorMessage);
    },
  });

  // Mutation to update email template
  const updateTemplateMutation = useMutation({
    mutationFn: ({
      id,
      template,
    }: {
      id: number;
      template: Partial<EmailTemplate>;
    }) => communicationsApi.updateEmailTemplate(id, template),
    onMutate: async ({ id, template }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["emailTemplates"] });

      // Snapshot previous value
      const previousTemplates = queryClient.getQueryData<EmailTemplate[]>([
        "emailTemplates",
      ]);

      // Optimistically update the template
      queryClient.setQueryData<EmailTemplate[]>(["emailTemplates"], (old) => {
        if (!old) return old;

        return old.map((t) => (t.id === id ? { ...t, ...template } : t));
      });

      // If it's the admin invitation template, update that too
      if (
        adminInvitationTemplate &&
        adminInvitationTemplate.template?.id === id
      ) {
        const previousAdminTemplate =
          queryClient.getQueryData<EmailTemplateWithVariables>([
            "adminInvitationTemplate",
          ]);

        queryClient.setQueryData<EmailTemplateWithVariables>(
          ["adminInvitationTemplate"],
          (old) => {
            if (!old || !old.template) return old;
            return {
              ...old,
              template: { ...old.template, ...template },
            };
          }
        );

        return { previousTemplates, previousAdminTemplate };
      }

      return { previousTemplates };
    },
    onSuccess: (data) => {
      toast.success(`Template "${data.name}" updated successfully`);
    },
    onError: (error, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousTemplates) {
        queryClient.setQueryData(["emailTemplates"], context.previousTemplates);
      }

      if (context?.previousAdminTemplate) {
        queryClient.setQueryData(
          ["adminInvitationTemplate"],
          context.previousAdminTemplate
        );
      }

      toast.error("Failed to update template");
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["adminInvitationTemplate"] });
    },
  });

  // Mutation to delete template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => communicationsApi.deleteEmailTemplate(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["emailTemplates"] });

      // Snapshot the previous value
      const previousTemplates = queryClient.getQueryData<EmailTemplate[]>([
        "emailTemplates",
      ]);

      // Optimistically update to remove the template
      queryClient.setQueryData<EmailTemplate[]>(["emailTemplates"], (old) => {
        if (!old) return old;
        return old.filter((template) => template.id !== id);
      });

      return { previousTemplates };
    },
    onSuccess: () => {
      toast.success("Template deleted successfully");
    },
    onError: (error, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousTemplates) {
        queryClient.setQueryData(["emailTemplates"], context.previousTemplates);
      }
      toast.error("Failed to delete template");
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
    },
  });

  // Mutation to preview a template
  const previewTemplateMutation = useMutation({
    mutationFn: (request: TemplatePreviewRequest) =>
      communicationsApi.previewEmailTemplate(request),
  });

  return {
    // Templates data
    templates: templates || [],
    isLoadingTemplates,
    templatesError,
    refetchTemplates,

    // Admin invitation template
    adminInvitationTemplate,
    isLoadingAdminTemplate,
    adminTemplateError,
    refetchAdminTemplate,

    // Template variables
    templateVariables,
    isLoadingVariables,
    variablesError,

    // Create template
    createTemplate: createTemplateMutation.mutate,
    isCreatingTemplate: createTemplateMutation.isPending,
    createTemplateError: createTemplateMutation.error,

    // Update template
    updateTemplate: updateTemplateMutation.mutate,
    isUpdatingTemplate: updateTemplateMutation.isPending,
    updateTemplateError: updateTemplateMutation.error,

    // Delete template
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeletingTemplate: deleteTemplateMutation.isPending,
    deleteTemplateError: deleteTemplateMutation.error,

    // Preview template
    previewTemplate: previewTemplateMutation.mutate,
    isPreviewingTemplate: previewTemplateMutation.isPending,
    previewData: previewTemplateMutation.data,
    previewError: previewTemplateMutation.error,
  };
};
