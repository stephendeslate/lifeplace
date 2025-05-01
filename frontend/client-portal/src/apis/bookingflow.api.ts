// frontend/client-portal/src/apis/bookingflow.api.ts
import { Event, EventType } from "../shared/types/events.types";
import {
  BookingFlow,
  BookingStep,
  EventCreateRequest,
} from "../types/bookingflow.types";
import api from "../utils/api"; // Use the shared API client

export const bookingFlowApi = {
  // Get all active event types
  getEventTypes: async (): Promise<EventType[]> => {
    const response = await api.get("/events/event-types/active/");
    return response.data;
  },

  // Get active booking flow for an event type
  getBookingFlow: async (eventTypeId: number): Promise<BookingFlow> => {
    const response = await api.get("/bookingflow/flows/", {
      params: { event_type: eventTypeId, is_active: true },
    });
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    throw new Error("No active booking flow found for this event type");
  },

  // Get all steps for a booking flow
  getBookingSteps: async (flowId: number): Promise<BookingStep[]> => {
    const response = await api.get(`/bookingflow/flows/${flowId}/steps/`);
    return response.data;
  },

  // Save questionnaire responses
  saveQuestionnaireResponses: async (
    eventId: number,
    responses: Array<{ field: number; value: string }>
  ): Promise<any> => {
    const response = await api.post(
      "/questionnaires/responses/save_event_responses/",
      {
        event: eventId,
        responses,
      }
    );
    return response.data;
  },

  // Create a new event based on booking data
  createEvent: async (eventData: EventCreateRequest): Promise<Event> => {
    const response = await api.post("/events/events/", eventData);
    return response.data;
  },

  // Get details of a specific questionnaire
  getQuestionnaire: async (questionnaireId: number): Promise<any> => {
    const response = await api.get(
      `/questionnaires/questionnaires/${questionnaireId}/`
    );
    return response.data;
  },

  // Process payment (placeholder)
  processPayment: async (
    eventId: number,
    paymentDetails: any
  ): Promise<any> => {
    // This would be implemented with actual payment gateway integration
    // For now it's just a placeholder that simulates payment
    const response = await api.post("/payments/process/", {
      event_id: eventId,
      amount: paymentDetails.amount,
      method: paymentDetails.method,
    });
    return response.data;
  },
};
