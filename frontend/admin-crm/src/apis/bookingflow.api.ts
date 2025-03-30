// frontend/admin-crm/src/apis/bookingflow.api.ts
import {
  BookingFlow,
  BookingFlowFormData,
  BookingFlowResponse,
  BookingStep,
  BookingStepFormData,
  BookingStepResponse,
  ProductStepItem,
  ProductStepItemFormData,
  ReorderProductItemsRequest,
  ReorderStepsRequest,
} from "../types/bookingflow.types";
import { EventType } from "../types/events.types";
import api from "../utils/api";

// Add this interface for the paginated event types response
interface EventTypeResponse {
  count: number;
  results: EventType[];
  next: string | null;
  previous: string | null;
}

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
   * Get active booking flows
   */
  getActiveBookingFlows: async (page = 1): Promise<BookingFlowResponse> => {
    const response = await api.get<BookingFlowResponse>(
      "/bookingflow/flows/active/",
      {
        params: { page },
      }
    );
    return response.data;
  },

  /**
   * Get booking flow by ID
   */
  getBookingFlowById: async (id: number): Promise<BookingFlow> => {
    const response = await api.get<BookingFlow>(`/bookingflow/flows/${id}/`);
    return response.data;
  },

  /**
   * Create a new booking flow
   */
  createBookingFlow: async (
    flowData: BookingFlowFormData
  ): Promise<BookingFlow> => {
    const response = await api.post<BookingFlow>(
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
  ): Promise<BookingFlow> => {
    const response = await api.patch<BookingFlow>(
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
   * Get steps for a booking flow
   */
  getStepsForFlow: async (flowId: number): Promise<BookingStep[]> => {
    const response = await api.get<BookingStep[]>(
      `/bookingflow/flows/${flowId}/steps/`
    );
    return response.data;
  },

  /**
   * Get all steps with optional filtering
   */
  getBookingSteps: async (
    page = 1,
    flowId?: number
  ): Promise<BookingStepResponse> => {
    const params: Record<string, any> = { page };

    if (flowId) {
      params.booking_flow = flowId;
    }

    const response = await api.get<BookingStepResponse>("/bookingflow/steps/", {
      params,
    });
    return response.data;
  },

  /**
   * Get booking step by ID
   */
  getBookingStepById: async (id: number): Promise<BookingStep> => {
    const response = await api.get<BookingStep>(`/bookingflow/steps/${id}/`);
    return response.data;
  },

  /**
   * Create a new booking step
   */
  createBookingStep: async (
    stepData: BookingStepFormData
  ): Promise<BookingStep> => {
    const response = await api.post<BookingStep>(
      "/bookingflow/steps/",
      stepData
    );
    return response.data;
  },

  /**
   * Update an existing booking step
   */
  updateBookingStep: async (
    id: number,
    stepData: Partial<BookingStepFormData>
  ): Promise<BookingStep> => {
    const response = await api.patch<BookingStep>(
      `/bookingflow/steps/${id}/`,
      stepData
    );
    return response.data;
  },

  /**
   * Delete a booking step
   */
  deleteBookingStep: async (id: number): Promise<void> => {
    await api.delete(`/bookingflow/steps/${id}/`);
  },

  /**
   * Reorder steps within a booking flow
   */
  reorderSteps: async (data: ReorderStepsRequest): Promise<BookingStep[]> => {
    const response = await api.post<BookingStep[]>(
      "/bookingflow/steps/reorder/",
      data
    );
    return response.data;
  },

  /**
   * Get product items for a configuration
   */
  getProductItems: async (configId: number): Promise<ProductStepItem[]> => {
    const response = await api.get<ProductStepItem[]>(
      "/bookingflow/product-items/by_config/",
      {
        params: { config_id: configId },
      }
    );
    return response.data;
  },

  /**
   * Create a new product item
   */
  createProductItem: async (
    configId: number,
    itemData: ProductStepItemFormData
  ): Promise<ProductStepItem> => {
    const data = {
      ...itemData,
      config: configId,
    };
    const response = await api.post<ProductStepItem>(
      "/bookingflow/product-items/",
      data
    );
    return response.data;
  },

  /**
   * Update an existing product item
   */
  updateProductItem: async (
    id: number,
    itemData: Partial<ProductStepItemFormData>
  ): Promise<ProductStepItem> => {
    const response = await api.patch<ProductStepItem>(
      `/bookingflow/product-items/${id}/`,
      itemData
    );
    return response.data;
  },

  /**
   * Delete a product item
   */
  deleteProductItem: async (id: number): Promise<void> => {
    await api.delete(`/bookingflow/product-items/${id}/`);
  },

  /**
   * Reorder product items within a configuration
   */
  reorderProductItems: async (
    data: ReorderProductItemsRequest
  ): Promise<ProductStepItem[]> => {
    const response = await api.post<ProductStepItem[]>(
      "/bookingflow/product-items/reorder/",
      data
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
    // Updated return type
    const params: Record<string, any> = { page };

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    if (search) {
      params.search = search;
    }

    const response = await api.get<EventTypeResponse>( // Updated generic type
      "/bookingflow/event-types/",
      {
        params,
      }
    );
    return response.data;
  },

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
   * Create a new event type
   */
  createEventType: async (eventTypeData: any): Promise<EventType> => {
    const response = await api.post<EventType>(
      "/bookingflow/event-types/",
      eventTypeData
    );
    return response.data;
  },

  /**
   * Update an existing event type
   */
  updateEventType: async (
    id: number,
    eventTypeData: any
  ): Promise<EventType> => {
    const response = await api.patch<EventType>(
      `/bookingflow/event-types/${id}/`,
      eventTypeData
    );
    return response.data;
  },

  /**
   * Delete an event type
   */
  deleteEventType: async (id: number): Promise<void> => {
    await api.delete(`/bookingflow/event-types/${id}/`);
  },
};

export default bookingFlowApi;
