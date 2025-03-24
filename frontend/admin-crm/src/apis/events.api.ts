// frontend/admin-crm/src/apis/events.api.ts
import {
  EventType,
  EventTypeFormData,
  EventTypeResponse,
} from "../types/events.types";
import api from "../utils/api";

export const eventsApi = {
  /**
   * Get all event types with optional filtering
   */
  getEventTypes: async (
    page = 1,
    isActive?: boolean,
    search?: string
  ): Promise<EventTypeResponse> => {
    const params: Record<string, any> = { page };

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    if (search) {
      params.search = search;
    }

    const response = await api.get<EventTypeResponse>("/events/event-types/", {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific event type by ID
   */
  getEventTypeById: async (id: number): Promise<EventType> => {
    const response = await api.get<EventType>(`/events/event-types/${id}/`);
    return response.data;
  },

  /**
   * Create a new event type
   */
  createEventType: async (
    eventTypeData: EventTypeFormData
  ): Promise<EventType> => {
    const response = await api.post<EventType>(
      "/events/event-types/",
      eventTypeData
    );
    return response.data;
  },

  /**
   * Update an existing event type
   */
  updateEventType: async (
    id: number,
    eventTypeData: Partial<EventTypeFormData>
  ): Promise<EventType> => {
    const response = await api.put<EventType>(
      `/events/event-types/${id}/`,
      eventTypeData
    );
    return response.data;
  },

  /**
   * Delete an event type
   */
  deleteEventType: async (id: number): Promise<void> => {
    await api.delete(`/events/event-types/${id}/`);
  },
};

export default eventsApi;
