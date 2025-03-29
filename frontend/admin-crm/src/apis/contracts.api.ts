// frontend/admin-crm/src/apis/contracts.api.ts
import {
  ContractSignatureData,
  ContractTemplate,
  ContractTemplateFormData,
  ContractTemplateResponse,
  ContractVariableContext,
  EventContract,
  EventContractFormData,
  EventContractUpdateData,
} from "../types/contracts.types";
import api from "../utils/api";

export const contractsApi = {
  /**
   * Get all contract templates with optional filtering
   */
  getContractTemplates: async (
    page = 1,
    search?: string,
    eventTypeId?: number
  ): Promise<ContractTemplateResponse> => {
    const params: Record<string, any> = { page };

    if (search) {
      params.search = search;
    }

    if (eventTypeId) {
      params.event_type = eventTypeId;
    }

    const response = await api.get<ContractTemplateResponse>(
      "/contracts/templates/",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get templates for a specific event type
   */
  getTemplatesForEventType: async (
    eventTypeId: number,
    page = 1
  ): Promise<ContractTemplateResponse> => {
    const response = await api.get<ContractTemplateResponse>(
      "/contracts/templates/for_event_type/",
      {
        params: { event_type: eventTypeId, page },
      }
    );
    return response.data;
  },

  /**
   * Get contract template by ID
   */
  getContractTemplateById: async (id: number): Promise<ContractTemplate> => {
    const response = await api.get<ContractTemplate>(
      `/contracts/templates/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new contract template
   */
  createContractTemplate: async (
    templateData: ContractTemplateFormData
  ): Promise<ContractTemplate> => {
    const response = await api.post<ContractTemplate>(
      "/contracts/templates/",
      templateData
    );
    return response.data;
  },

  /**
   * Update an existing contract template
   */
  updateContractTemplate: async (
    id: number,
    templateData: Partial<ContractTemplateFormData>
  ): Promise<ContractTemplate> => {
    const response = await api.patch<ContractTemplate>(
      `/contracts/templates/${id}/`,
      templateData
    );
    return response.data;
  },

  /**
   * Delete a contract template
   */
  deleteContractTemplate: async (id: number): Promise<void> => {
    await api.delete(`/contracts/templates/${id}/`);
  },

  /**
   * Get contracts for an event
   */
  getContractsForEvent: async (eventId: number): Promise<EventContract[]> => {
    const response = await api.get<EventContract[]>(
      "/contracts/contracts/for_event/",
      {
        params: { event_id: eventId },
      }
    );
    return response.data;
  },

  /**
   * Get event contract by ID
   */
  getContractById: async (id: number): Promise<EventContract> => {
    const response = await api.get<EventContract>(
      `/contracts/contracts/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new event contract from a template
   */
  createEventContract: async (
    contractData: EventContractFormData
  ): Promise<EventContract> => {
    const response = await api.post<EventContract>(
      "/contracts/contracts/",
      contractData
    );
    return response.data;
  },

  /**
   * Update an event contract
   */
  updateEventContract: async (
    id: number,
    contractData: EventContractUpdateData
  ): Promise<EventContract> => {
    const response = await api.patch<EventContract>(
      `/contracts/contracts/${id}/`,
      contractData
    );
    return response.data;
  },

  /**
   * Sign an event contract
   */
  signContract: async (
    id: number,
    signatureData: ContractSignatureData
  ): Promise<EventContract> => {
    const response = await api.post<EventContract>(
      `/contracts/contracts/${id}/sign/`,
      signatureData
    );
    return response.data;
  },

  /**
   * Void an event contract
   */
  voidContract: async (id: number, reason?: string): Promise<EventContract> => {
    const data = reason ? { reason } : {};
    const response = await api.post<EventContract>(
      `/contracts/contracts/${id}/void/`,
      data
    );
    return response.data;
  },

  /**
   * Send an event contract to the client
   */
  sendContract: async (id: number): Promise<EventContract> => {
    // This is a convenience method that updates the status to SENT
    const response = await api.patch<EventContract>(
      `/contracts/contracts/${id}/`,
      { status: "SENT" }
    );
    return response.data;
  },

  /**
   * Preview a contract with context data
   * Note: This is a client-side utility that doesn't call the backend
   */
  previewContract: (
    template: string,
    context: ContractVariableContext
  ): string => {
    let content = template;

    // Simple variable substitution
    for (const [key, value] of Object.entries(context)) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, "g"), String(value));
    }

    return content;
  },
};

export default contractsApi;
