// frontend/admin-crm/src/apis/events.api.ts
import {
  Event,
  EventFeedback,
  EventFeedbackFormData,
  EventFile,
  EventFilters,
  EventFormData,
  EventProductFormData,
  EventProductOption,
  EventResponse,
  EventTask,
  EventTaskFormData,
  EventTimeline,
  EventType,
  EventTypeFormData,
  EventTypeResponse,
} from "../types/events.types";
import api from "../utils/api";

export const eventsApi = {
  /**
   * Get all events with optional filtering
   */
  getEvents: async (
    page = 1,
    filters?: EventFilters
  ): Promise<EventResponse> => {
    const params: Record<string, any> = { page };

    // Add filters to params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
    }

    const response = await api.get<EventResponse>("/events/events/", {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific event by ID
   */
  getEventById: async (id: number): Promise<Event> => {
    const response = await api.get<Event>(`/events/events/${id}/`);
    return response.data;
  },

  /**
   * Create a new event
   */
  createEvent: async (eventData: EventFormData): Promise<Event> => {
    const response = await api.post<Event>("/events/events/", eventData);
    return response.data;
  },

  /**
   * Update an existing event
   */
  updateEvent: async (
    id: number,
    eventData: Partial<EventFormData>
  ): Promise<Event> => {
    const response = await api.patch<Event>(`/events/events/${id}/`, eventData);
    return response.data;
  },

  /**
   * Delete an event (soft delete by setting status to CANCELLED)
   */
  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(`/events/events/${id}/`);
  },

  /**
   * Update an event's status
   */
  updateEventStatus: async (id: number, status: string): Promise<Event> => {
    const response = await api.post<Event>(
      `/events/events/${id}/update_status/`,
      {
        status,
      }
    );
    return response.data;
  },

  /**
   * Update an event's workflow stage
   */
  updateEventStage: async (id: number, stageId: number): Promise<Event> => {
    const response = await api.post<Event>(
      `/events/events/${id}/update_stage/`,
      {
        stage_id: stageId,
      }
    );
    return response.data;
  },

  /**
   * Get tasks for an event
   */
  getEventTasks: async (
    eventId: number,
    status?: string,
    assignedTo?: number
  ): Promise<EventTask[]> => {
    const params: Record<string, any> = {};

    if (status) {
      params.status = status;
    }

    if (assignedTo) {
      params.assigned_to = assignedTo;
    }

    const response = await api.get<EventTask[]>(
      `/events/events/${eventId}/tasks/`,
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get files for an event
   */
  getEventFiles: async (
    eventId: number,
    category?: string,
    isPublic?: boolean
  ): Promise<EventFile[]> => {
    const params: Record<string, any> = {};

    if (category) {
      params.category = category;
    }

    if (isPublic !== undefined) {
      params.is_public = isPublic;
    }

    const response = await api.get<EventFile[]>(
      `/events/events/${eventId}/files/`,
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get timeline entries for an event
   */
  getEventTimeline: async (
    eventId: number,
    isPublic?: boolean
  ): Promise<EventTimeline[]> => {
    const params: Record<string, any> = {};

    if (isPublic !== undefined) {
      params.is_public = isPublic;
    }

    const response = await api.get<EventTimeline[]>(
      `/events/events/${eventId}/timeline/`,
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get feedback for an event
   */
  getEventFeedback: async (eventId: number): Promise<EventFeedback[]> => {
    const response = await api.get<EventFeedback[]>(
      `/events/events/${eventId}/feedback/`
    );
    return response.data;
  },

  /**
   * Get the next task for an event
   */
  getNextTask: async (eventId: number): Promise<EventTask | null> => {
    const response = await api.get<EventTask | null>(
      `/events/events/${eventId}/next_task/`
    );
    return response.data;
  },

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

  /**
   * Get active event types
   */
  getActiveEventTypes: async (): Promise<EventType[]> => {
    const response = await api.get<EventType[]>("/events/event-types/active/");
    return response.data;
  },

  /**
   * Create a new event task
   */
  createEventTask: async (taskData: EventTaskFormData): Promise<EventTask> => {
    const response = await api.post<EventTask>("/events/tasks/", taskData);
    return response.data;
  },

  /**
   * Update an existing event task
   */
  updateEventTask: async (
    id: number,
    taskData: Partial<EventTaskFormData>
  ): Promise<EventTask> => {
    const response = await api.patch<EventTask>(
      `/events/tasks/${id}/`,
      taskData
    );
    return response.data;
  },

  /**
   * Delete an event task
   */
  deleteEventTask: async (id: number): Promise<void> => {
    await api.delete(`/events/tasks/${id}/`);
  },

  /**
   * Complete an event task
   */
  completeEventTask: async (
    id: number,
    completionNotes: string
  ): Promise<EventTask> => {
    const response = await api.post<EventTask>(
      `/events/tasks/${id}/complete/`,
      {
        completion_notes: completionNotes,
      }
    );
    return response.data;
  },

  /**
   * Create a new event product option
   */
  createEventProduct: async (
    productData: EventProductFormData
  ): Promise<EventProductOption> => {
    const response = await api.post<EventProductOption>(
      "/events/products/",
      productData
    );
    return response.data;
  },

  /**
   * Update an existing event product option
   */
  updateEventProduct: async (
    id: number,
    productData: Partial<EventProductFormData>
  ): Promise<EventProductOption> => {
    const response = await api.patch<EventProductOption>(
      `/events/products/${id}/`,
      productData
    );
    return response.data;
  },

  /**
   * Delete an event product option
   */
  deleteEventProduct: async (id: number): Promise<void> => {
    await api.delete(`/events/products/${id}/`);
  },

  /**
   * Upload a file for an event
   */
  uploadEventFile: async (fileData: FormData): Promise<EventFile> => {
    const response = await api.post<EventFile>("/events/files/", fileData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update an event file
   */
  updateEventFile: async (
    id: number,
    fileData: FormData
  ): Promise<EventFile> => {
    const response = await api.patch<EventFile>(
      `/events/files/${id}/`,
      fileData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete an event file
   */
  deleteEventFile: async (id: number): Promise<void> => {
    await api.delete(`/events/files/${id}/`);
  },

  /**
   * Create feedback for an event
   */
  createEventFeedback: async (
    feedbackData: EventFeedbackFormData
  ): Promise<EventFeedback> => {
    const response = await api.post<EventFeedback>(
      "/events/feedback/",
      feedbackData
    );
    return response.data;
  },

  /**
   * Respond to event feedback
   */
  respondToFeedback: async (
    id: number,
    responseText: string
  ): Promise<EventFeedback> => {
    const response = await api.post<EventFeedback>(
      `/events/feedback/${id}/respond/`,
      {
        response: responseText,
      }
    );
    return response.data;
  },

  /**
   * Add a timeline entry
   */
  addTimelineEntry: async (
    eventId: number,
    actionType: string,
    description: string,
    isPublic: boolean,
    actionData?: Record<string, any>
  ): Promise<EventTimeline> => {
    const data = {
      event: eventId,
      action_type: actionType,
      description,
      is_public: isPublic,
      action_data: actionData,
    };

    const response = await api.post<EventTimeline>("/events/timeline/", data);
    return response.data;
  },
};

export default eventsApi;
