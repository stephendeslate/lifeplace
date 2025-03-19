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
      toast.success("Template updated successfully");
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

    // Update template
    updateTemplate: updateTemplateMutation.mutate,
    isUpdatingTemplate: updateTemplateMutation.isPending,

    // Preview template
    previewTemplate: previewTemplateMutation.mutate,
    isPreviewingTemplate: previewTemplateMutation.isPending,
    previewData: previewTemplateMutation.data,
    previewError: previewTemplateMutation.error,
  };
};
