// frontend/admin-crm/src/apis/workflows.api.ts
import {
  ReorderStagesRequest,
  WorkflowStage,
  WorkflowStageFormData,
  WorkflowTemplate,
  WorkflowTemplateFormData,
  WorkflowTemplateResponse,
} from "../types/workflows.types";
import api from "../utils/api";

export const workflowsApi = {
  /**
   * Get all workflow templates with optional filtering
   */
  getWorkflowTemplates: async (
    page = 1,
    eventTypeId?: number,
    isActive?: boolean,
    search?: string
  ): Promise<WorkflowTemplateResponse> => {
    const params: Record<string, any> = { page };

    if (eventTypeId) {
      params.event_type = eventTypeId;
    }

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    if (search) {
      params.search = search;
    }

    const response = await api.get<WorkflowTemplateResponse>(
      "/workflows/templates/",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get active workflow templates
   */
  getActiveTemplates: async (page = 1): Promise<WorkflowTemplateResponse> => {
    const response = await api.get<WorkflowTemplateResponse>(
      "/workflows/templates/active/",
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get a specific workflow template by ID
   */
  getTemplateById: async (id: number): Promise<WorkflowTemplate> => {
    const response = await api.get<WorkflowTemplate>(
      `/workflows/templates/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new workflow template
   */
  createTemplate: async (
    templateData: WorkflowTemplateFormData
  ): Promise<WorkflowTemplate> => {
    const response = await api.post<WorkflowTemplate>(
      "/workflows/templates/",
      templateData
    );
    return response.data;
  },

  /**
   * Update an existing workflow template
   */
  updateTemplate: async (
    id: number,
    templateData: Partial<WorkflowTemplateFormData>
  ): Promise<WorkflowTemplate> => {
    const response = await api.put<WorkflowTemplate>(
      `/workflows/templates/${id}/`,
      templateData
    );
    return response.data;
  },

  /**
   * Delete a workflow template
   */
  deleteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/workflows/templates/${id}/`);
  },

  /**
   * Get stages for a specific template
   */
  getStagesForTemplate: async (
    templateId: number
  ): Promise<WorkflowStage[]> => {
    const response = await api.get<WorkflowStage[]>(
      `/workflows/templates/${templateId}/stages/`
    );
    return response.data;
  },

  /**
   * Create a new workflow stage
   */
  createStage: async (
    templateId: number,
    stageData: WorkflowStageFormData
  ): Promise<WorkflowStage> => {
    const data = {
      ...stageData,
      template: templateId,
    };
    const response = await api.post<WorkflowStage>("/workflows/stages/", data);
    return response.data;
  },

  /**
   * Update an existing workflow stage
   */
  updateStage: async (
    id: number,
    stageData: Partial<WorkflowStageFormData>
  ): Promise<WorkflowStage> => {
    const response = await api.put<WorkflowStage>(
      `/workflows/stages/${id}/`,
      stageData
    );
    return response.data;
  },

  /**
   * Delete a workflow stage
   */
  deleteStage: async (id: number): Promise<void> => {
    await api.delete(`/workflows/stages/${id}/`);
  },

  /**
   * Reorder stages within a template
   */
  reorderStages: async (
    data: ReorderStagesRequest
  ): Promise<WorkflowStage[]> => {
    const response = await api.post<WorkflowStage[]>(
      "/workflows/stages/reorder/",
      data
    );
    return response.data;
  },
};

export default workflowsApi;
