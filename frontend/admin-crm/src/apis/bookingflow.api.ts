// frontend/admin-crm/src/apis/bookingflow.api.ts
import {
  BookingFlow,
  BookingFlowDetail,
  BookingFlowFormData,
} from "../types/bookingflow.types";
import { EventType } from "../types/events.types";
import { WorkflowTemplate } from "../types/workflows.types";
import api from "../utils/api";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BookingFlowResponse extends PaginationResponse<BookingFlow> {}

export const bookingFlowApi = {
  /**
   * Get all booking flows with optional filtering
   */
  getBookingFlows: async (
    page = 1,
    eventTypeId?: number,
    isActive?: boolean,
    search?: string
  ): Promise<BookingFlowResponse> => {
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

    const response = await api.get<BookingFlowResponse>("/bookingflow/flows/", {
      params,
    });
    return response.data;
  },

  /**
   * Get active booking flows only
   */
  getActiveBookingFlows: async (
    page = 1,
    eventTypeId?: number
  ): Promise<BookingFlowResponse> => {
    const params: Record<string, any> = { page };

    if (eventTypeId) {
      params.event_type = eventTypeId;
    }

    const response = await api.get<BookingFlowResponse>(
      "/bookingflow/flows/active/",
      { params }
    );
    return response.data;
  },

  /**
   * Get booking flow by ID
   */
  getBookingFlowById: async (id: number): Promise<BookingFlowDetail> => {
    const response = await api.get<BookingFlowDetail>(
      `/bookingflow/flows/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new booking flow
   */
  createBookingFlow: async (
    flowData: BookingFlowFormData
  ): Promise<BookingFlowDetail> => {
    const response = await api.post<BookingFlowDetail>(
      "/bookingflow/flows/",
      flowData
    );
    return response.data;
  },

  /**
   * Update an existing booking flow
   */
  updateBookingFlow: async (
    id: number,
    flowData: Partial<BookingFlowFormData>
  ): Promise<BookingFlowDetail> => {
    const response = await api.put<BookingFlowDetail>(
      `/bookingflow/flows/${id}/`,
      flowData
    );
    return response.data;
  },

  /**
   * Delete a booking flow
   */
  deleteBookingFlow: async (id: number): Promise<void> => {
    await api.delete(`/bookingflow/flows/${id}/`);
  },

  /**
   * Get available workflow templates for assignment
   */
  getWorkflowTemplates: async (): Promise<WorkflowTemplate[]> => {
    const response = await api.get<WorkflowTemplate[]>(
      "/bookingflow/flows/workflow_templates/"
    );
    return response.data;
  },

  /**
   * Get available event types
   */
  getEventTypes: async (): Promise<EventType[]> => {
    const response = await api.get<EventType[]>("/events/event-types/active/");
    return response.data;
  },

  /**
   * Configuration Methods
   */

  /**
   * Get questionnaire configuration for a booking flow
   */
  getQuestionnaireConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(
      `/bookingflow/flows/${flowId}/questionnaire-config/`
    );
    return response.data;
  },

  /**
   * Update questionnaire configuration for a booking flow
   */
  updateQuestionnaireConfig: async (
    flowId: number,
    configData: any
  ): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/questionnaire-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get package configuration for a booking flow
   */
  getPackageConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(
      `/bookingflow/flows/${flowId}/package-config/`
    );
    return response.data;
  },

  /**
   * Update package configuration for a booking flow
   */
  updatePackageConfig: async (
    flowId: number,
    configData: any
  ): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/package-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get addon configuration for a booking flow
   */
  getAddonConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(
      `/bookingflow/flows/${flowId}/addon-config/`
    );
    return response.data;
  },

  /**
   * Update addon configuration for a booking flow
   */
  updateAddonConfig: async (flowId: number, configData: any): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/addon-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get intro configuration for a booking flow
   */
  getIntroConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(
      `/bookingflow/flows/${flowId}/intro-config/`
    );
    return response.data;
  },

  /**
   * Update intro configuration for a booking flow
   */
  updateIntroConfig: async (flowId: number, configData: any): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/intro-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get date configuration for a booking flow
   */
  getDateConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(`/bookingflow/flows/${flowId}/date-config/`);
    return response.data;
  },

  /**
   * Update date configuration for a booking flow
   */
  updateDateConfig: async (flowId: number, configData: any): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/date-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get summary configuration for a booking flow
   */
  getSummaryConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(
      `/bookingflow/flows/${flowId}/summary-config/`
    );
    return response.data;
  },

  /**
   * Update summary configuration for a booking flow
   */
  updateSummaryConfig: async (
    flowId: number,
    configData: any
  ): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/summary-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get payment configuration for a booking flow
   */
  getPaymentConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(
      `/bookingflow/flows/${flowId}/payment-config/`
    );
    return response.data;
  },

  /**
   * Update payment configuration for a booking flow
   */
  updatePaymentConfig: async (
    flowId: number,
    configData: any
  ): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/payment-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get confirmation configuration for a booking flow
   */
  getConfirmationConfig: async (flowId: number): Promise<any> => {
    const response = await api.get(
      `/bookingflow/flows/${flowId}/confirmation-config/`
    );
    return response.data;
  },

  /**
   * Update confirmation configuration for a booking flow
   */
  updateConfirmationConfig: async (
    flowId: number,
    configData: any
  ): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/confirmation-config/`,
      configData
    );
    return response.data;
  },
};

export default bookingFlowApi;
