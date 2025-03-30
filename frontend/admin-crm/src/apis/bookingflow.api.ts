// frontend/admin-crm/src/apis/bookingflow.api.ts
import {
  BookingFlowConfig,
  BookingFlowConfigFormData,
  BookingFlowConfigResponse,
  BookingFlowItem,
  BookingFlowItemFormData,
  BookingFlowItemResponse,
  ReorderItemsRequest,
} from "../types/bookingflow.types";
import api from "../utils/api";

export const bookingFlowApi = {
  /**
   * Get all booking flow configurations with optional filtering
   */
  getConfigs: async (
    page = 1,
    eventTypeId?: number,
    isActive?: boolean
  ): Promise<BookingFlowConfigResponse> => {
    const params: Record<string, any> = { page };

    if (eventTypeId) {
      params.event_type = eventTypeId;
    }

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    const response = await api.get<BookingFlowConfigResponse>(
      "/bookingflow/configs/",
      { params }
    );
    return response.data;
  },

  /**
   * Get active configuration for an event type
   */
  getConfigForEventType: async (
    eventTypeId: number
  ): Promise<BookingFlowConfig> => {
    const response = await api.get<BookingFlowConfig>(
      "/bookingflow/configs/for_event_type/",
      {
        params: { event_type: eventTypeId },
      }
    );
    return response.data;
  },

  /**
   * Get configuration by ID
   */
  getConfigById: async (id: number): Promise<BookingFlowConfig> => {
    const response = await api.get<BookingFlowConfig>(
      `/bookingflow/configs/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new booking flow configuration
   */
  createConfig: async (
    configData: BookingFlowConfigFormData
  ): Promise<BookingFlowConfig> => {
    const response = await api.post<BookingFlowConfig>(
      "/bookingflow/configs/",
      configData
    );
    return response.data;
  },

  /**
   * Update an existing booking flow configuration
   */
  updateConfig: async (
    id: number,
    configData: Partial<BookingFlowConfigFormData>
  ): Promise<BookingFlowConfig> => {
    const response = await api.patch<BookingFlowConfig>(
      `/bookingflow/configs/${id}/`,
      configData
    );
    return response.data;
  },

  /**
   * Delete a booking flow configuration
   */
  deleteConfig: async (id: number): Promise<void> => {
    await api.delete(`/bookingflow/configs/${id}/`);
  },

  /**
   * Get all booking flow items for a configuration
   */
  getItems: async (
    configId: number,
    itemType?: string
  ): Promise<BookingFlowItemResponse> => {
    const params: Record<string, any> = { config: configId };

    if (itemType) {
      params.type = itemType;
    }

    const response = await api.get<BookingFlowItemResponse>(
      "/bookingflow/items/",
      { params }
    );
    return response.data;
  },

  /**
   * Get booking flow item by ID
   */
  getItemById: async (id: number): Promise<BookingFlowItem> => {
    const response = await api.get<BookingFlowItem>(
      `/bookingflow/items/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new booking flow item
   */
  createItem: async (
    itemData: BookingFlowItemFormData
  ): Promise<BookingFlowItem> => {
    const response = await api.post<BookingFlowItem>(
      "/bookingflow/items/",
      itemData
    );
    return response.data;
  },

  /**
   * Update an existing booking flow item
   */
  updateItem: async (
    id: number,
    itemData: Partial<BookingFlowItemFormData>
  ): Promise<BookingFlowItem> => {
    const response = await api.patch<BookingFlowItem>(
      `/bookingflow/items/${id}/`,
      itemData
    );
    return response.data;
  },

  /**
   * Delete a booking flow item
   */
  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/bookingflow/items/${id}/`);
  },

  /**
   * Reorder booking flow items
   */
  reorderItems: async (
    reorderData: ReorderItemsRequest
  ): Promise<BookingFlowItem[]> => {
    const response = await api.post<BookingFlowItem[]>(
      "/bookingflow/items/reorder/",
      reorderData
    );
    return response.data;
  },
};

export default bookingFlowApi;
