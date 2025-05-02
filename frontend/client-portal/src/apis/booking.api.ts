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
   * Create a new event (booking)
   */
  createEvent: async (
    eventData: EventCreateData
  ): Promise<{ id: number; status: string }> => {
    const response = await api.post<{ id: number; status: string }>(
      "/events/events/",
      eventData
    );
    return response.data;
  },
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
};

export default bookingClientApi;
