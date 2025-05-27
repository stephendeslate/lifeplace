// frontend/client-portal/src/apis/booking.api.ts
import {
  BookingFlow,
  EventCreateData,
  PaymentCreateData,
} from "../types/booking.types";
import { EventType } from "../types/events.types";
import { Questionnaire } from "../types/questionnaires.types";
import api from "../utils/api";

// Paginated response interface
interface BookingFlowResponse {
  count: number;
  results: BookingFlow[];
  next: string | null;
  previous: string | null;
}

// Configuration update interfaces
interface QuestionnaireConfigUpdate {
  title?: string;
  description?: string;
  questionnaire_items?: Array<{
    questionnaire: number;
    order?: number;
    is_required?: boolean;
  }>;
  is_required?: boolean;
  is_visible?: boolean;
}

interface PackageConfigUpdate {
  title?: string;
  description?: string;
  min_selection?: number;
  max_selection?: number;
  selection_type?: "SINGLE" | "MULTIPLE";
  package_items?: Array<{
    product: number;
    order?: number;
    is_highlighted?: boolean;
    custom_price?: number;
    custom_description?: string;
  }>;
  is_required?: boolean;
  is_visible?: boolean;
}

interface AddonConfigUpdate {
  title?: string;
  description?: string;
  min_selection?: number;
  max_selection?: number;
  addon_items?: Array<{
    product: number;
    order?: number;
    is_highlighted?: boolean;
    custom_price?: number;
    custom_description?: string;
  }>;
  is_required?: boolean;
  is_visible?: boolean;
}

export const bookingClientApi = {
  /**
   * Get active event types
   */
  getActiveEventTypes: async (): Promise<EventType[]> => {
    const response = await api.get<EventType[]>(
      "/bookingflow/event-types/active/"
    );
    return response.data;
  },

  /**
   * Get event type by ID
   */
  getEventTypeById: async (id: number): Promise<EventType> => {
    const response = await api.get<EventType>(
      `/bookingflow/event-types/${id}/`
    );
    return response.data;
  },

  /**
   * Get booking flows with optional filtering
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
   * Get booking flow details by ID
   */
  getBookingFlowById: async (id: number): Promise<BookingFlow> => {
    const response = await api.get<BookingFlow>(`/bookingflow/flows/${id}/`);
    return response.data;
  },

  /**
   * Get active booking flows only
   */
  getActiveBookingFlows: async (
    eventTypeId?: number
  ): Promise<BookingFlowResponse> => {
    const params: Record<string, any> = {};

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
   * Configuration Management Methods
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
    configData: QuestionnaireConfigUpdate
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
    configData: PackageConfigUpdate
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
  updateAddonConfig: async (
    flowId: number,
    configData: AddonConfigUpdate
  ): Promise<any> => {
    const response = await api.patch(
      `/bookingflow/flows/${flowId}/addon-config/`,
      configData
    );
    return response.data;
  },

  /**
   * Get all questionnaires for an event type
   */
  getQuestionnairesForEventType: async (
    eventTypeId: number
  ): Promise<Questionnaire[]> => {
    const response = await api.get<Questionnaire[]>(
      `/questionnaires/questionnaires/`,
      {
        params: { event_type: eventTypeId, is_active: true },
      }
    );
    return response.data;
  },

  /**
   * Get questionnaire details by ID with fields
   */
  getQuestionnaireById: async (id: number): Promise<Questionnaire> => {
    const response = await api.get<Questionnaire>(
      `/questionnaires/questionnaires/${id}/`
    );
    return response.data;
  },

  /**
   * Get all fields for a specific questionnaire
   */
  getQuestionnaireFields: async (questionnaireId: number): Promise<any[]> => {
    const response = await api.get<any[]>(
      `/questionnaires/questionnaires/${questionnaireId}/fields/`
    );
    return response.data;
  },

  /**
   * Event Management Methods
   */

  /**
   * Create a new event (booking) with optional booking flow context
   */
  createEvent: async (
    eventData: EventCreateData,
    bookingFlowId?: number
  ): Promise<{ id: number; status: string }> => {
    // Add booking flow ID to the request if provided
    const requestData = {
      ...eventData,
      ...(bookingFlowId && { booking_flow_id: bookingFlowId }),
    };

    const response = await api.post<{ id: number; status: string }>(
      "/events/events/",
      requestData
    );
    return response.data;
  },

  /**
   * Create event product association
   */
  createEventProduct: async (productData: {
    event: number;
    product_option: number;
    quantity: number;
    final_price: number;
  }): Promise<any> => {
    const response = await api.post("/events/event-products/", productData);
    return response.data;
  },

  /**
   * Payment Methods
   */

  /**
   * Process payment for an event
   */
  processPayment: async (
    paymentData: PaymentCreateData
  ): Promise<{ success: boolean; transaction_id: string }> => {
    const response = await api.post<{
      success: boolean;
      transaction_id: string;
    }>("/payments/process/", paymentData);
    return response.data;
  },

  /**
   * Update event status to confirmed
   */
  confirmEvent: async (eventId: number): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      `/events/events/${eventId}/update-status/`,
      { status: "CONFIRMED" }
    );
    return response.data;
  },

  /**
   * Utility Methods
   */

  /**
   * Setup booking flow with questionnaires for event type
   * This method helps ensure questionnaire items are properly configured
   */
  setupBookingFlowQuestionnaires: async (
    flowId: number,
    eventTypeId: number
  ): Promise<any> => {
    try {
      // First, get all questionnaires for this event type
      const questionnaires =
        await bookingClientApi.getQuestionnairesForEventType(eventTypeId);

      if (questionnaires.length === 0) {
        console.warn(`No questionnaires found for event type ${eventTypeId}`);
        return null;
      }

      // Prepare questionnaire items
      const questionnaireItems = questionnaires.map((q, index) => ({
        questionnaire: q.id,
        order: index + 1,
        is_required: true,
      }));

      // Update the questionnaire configuration
      const result = await bookingClientApi.updateQuestionnaireConfig(flowId, {
        questionnaire_items: questionnaireItems,
      });

      return result;
    } catch (error) {
      console.error("Error setting up booking flow questionnaires:", error);
      throw error;
    }
  },
};

export default bookingClientApi;
