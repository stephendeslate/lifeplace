// frontend/admin-crm/src/apis/communications.api.ts
import {
  EmailTemplate,
  EmailTemplateWithVariables,
  EmailTemplatesResponse,
  TemplatePreviewRequest,
  TemplatePreviewResponse,
} from "../types/settings.types";
import api from "../utils/api";

export const communicationsApi = {
  /**
   * Get all email templates
   */
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await api.get<EmailTemplatesResponse>(
      "/communications/email-templates/"
    );
    return response.data.results || [];
  },

  /**
   * Get a specific email template by ID
   */
  getEmailTemplate: async (id: number): Promise<EmailTemplate> => {
    const response = await api.get<EmailTemplate>(
      `/communications/email-templates/${id}/`
    );
    return response.data;
  },

  /**
   * Get admin invitation template with available variables
   */
  getAdminInvitationTemplate: async (): Promise<EmailTemplateWithVariables> => {
    const response = await api.get<EmailTemplateWithVariables>(
      "/communications/email-templates/admin_invitation/"
    );
    return response.data;
  },

  /**
   * Get available template variables
   */
  getTemplateVariables: async (
    templateType?: string
  ): Promise<Record<string, string>> => {
    const params = templateType ? { type: templateType } : {};
    const response = await api.get<Record<string, string>>(
      "/communications/email-templates/get_variable_options/",
      { params }
    );
    return response.data;
  },

  /**
   * Update an email template
   */
  updateEmailTemplate: async (
    id: number,
    template: Partial<EmailTemplate>
  ): Promise<EmailTemplate> => {
    const response = await api.put<EmailTemplate>(
      `/communications/email-templates/${id}/`,
      template
    );
    return response.data;
  },

  /**
   * Create a new email template
   */
  createEmailTemplate: async (
    template: Partial<EmailTemplate>
  ): Promise<EmailTemplate> => {
    const response = await api.post<EmailTemplate>(
      "/communications/email-templates/",
      template
    );
    return response.data;
  },

  /**
   * Preview an email template with sample data
   */
  previewEmailTemplate: async (
    request: TemplatePreviewRequest
  ): Promise<TemplatePreviewResponse> => {
    const response = await api.post<TemplatePreviewResponse>(
      `/communications/email-templates/${request.template_id}/preview/`,
      request
    );
    return response.data;
  },

  /**
   * Delete an email template
   */
  deleteEmailTemplate: async (id: number): Promise<void> => {
    await api.delete(`/communications/email-templates/${id}/`);
  },
};

export default communicationsApi;
