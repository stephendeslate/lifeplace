// frontend/admin-crm/src/apis/bookingflow.api.ts
import {
  AddonConfig,
  AddonItem,
  BookingFlow,
  BookingFlowDetail, // Added this import
  BookingFlowFormData,
  ConfirmationConfig,
  DateConfig,
  // Removed BookingStep imports
  // Added configuration type imports as needed
  IntroConfig,
  PackageConfig,
  PackageItem,
  PaymentConfig,
  QuestionnaireConfig,
  QuestionnaireItem,
  SummaryConfig,
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

interface BookingFlowResponse {
  count: number;
  results: BookingFlow[];
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
   * Get booking flow by ID with all configurations
   */
  getBookingFlowById: async (id: number): Promise<BookingFlowDetail> => {
    const response = await api.get<BookingFlowDetail>(
      `/bookingflow/flows/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new booking flow with default configurations
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
   * Update intro configuration
   */
  updateIntroConfig: async (
    flowId: number,
    configData: Partial<IntroConfig>
  ): Promise<IntroConfig> => {
    const response = await api.patch<IntroConfig>(
      `/bookingflow/flows/${flowId}/intro_config/`,
      configData
    );
    return response.data;
  },

  /**
   * Update date configuration
   */
  updateDateConfig: async (
    flowId: number,
    configData: Partial<DateConfig>
  ): Promise<DateConfig> => {
    const response = await api.patch<DateConfig>(
      `/bookingflow/flows/${flowId}/date_config/`,
      configData
    );
    return response.data;
  },

  /**
   * Update questionnaire configuration
   */
  updateQuestionnaireConfig: async (
    flowId: number,
    configData: Partial<QuestionnaireConfig>
  ): Promise<QuestionnaireConfig> => {
    const response = await api.patch<QuestionnaireConfig>(
      `/bookingflow/flows/${flowId}/questionnaire_config/`,
      configData
    );
    return response.data;
  },

  /**
   * Add questionnaire item to config
   */
  addQuestionnaireItem: async (
    configId: number,
    itemData: Partial<QuestionnaireItem>
  ): Promise<QuestionnaireItem> => {
    const response = await api.post<QuestionnaireItem>(
      `/bookingflow/questionnaire-items/`,
      {
        ...itemData,
        config: configId,
      }
    );
    return response.data;
  },

  /**
   * Remove questionnaire item from config
   */
  removeQuestionnaireItem: async (itemId: number): Promise<void> => {
    await api.delete(`/bookingflow/questionnaire-items/${itemId}/`);
  },

  /**
   * Update package configuration
   */
  updatePackageConfig: async (
    flowId: number,
    configData: Partial<PackageConfig>
  ): Promise<PackageConfig> => {
    const response = await api.patch<PackageConfig>(
      `/bookingflow/flows/${flowId}/package_config/`,
      configData
    );
    return response.data;
  },

  /**
   * Add package item to config
   */
  addPackageItem: async (
    configId: number,
    itemData: Partial<PackageItem>
  ): Promise<PackageItem> => {
    const response = await api.post<PackageItem>(
      `/bookingflow/package-items/`,
      {
        ...itemData,
        config: configId,
      }
    );
    return response.data;
  },

  /**
   * Update package item
   */
  updatePackageItem: async (
    itemId: number,
    itemData: Partial<PackageItem>
  ): Promise<PackageItem> => {
    const response = await api.patch<PackageItem>(
      `/bookingflow/package-items/${itemId}/`,
      itemData
    );
    return response.data;
  },

  /**
   * Remove package item from config
   */
  removePackageItem: async (itemId: number): Promise<void> => {
    await api.delete(`/bookingflow/package-items/${itemId}/`);
  },

  /**
   * Update addon configuration
   */
  updateAddonConfig: async (
    flowId: number,
    configData: Partial<AddonConfig>
  ): Promise<AddonConfig> => {
    const response = await api.patch<AddonConfig>(
      `/bookingflow/flows/${flowId}/addon_config/`,
      configData
    );
    return response.data;
  },

  /**
   * Add addon item to config
   */
  addAddonItem: async (
    configId: number,
    itemData: Partial<AddonItem>
  ): Promise<AddonItem> => {
    const response = await api.post<AddonItem>(`/bookingflow/addon-items/`, {
      ...itemData,
      config: configId,
    });
    return response.data;
  },

  /**
   * Update addon item
   */
  updateAddonItem: async (
    itemId: number,
    itemData: Partial<AddonItem>
  ): Promise<AddonItem> => {
    const response = await api.patch<AddonItem>(
      `/bookingflow/addon-items/${itemId}/`,
      itemData
    );
    return response.data;
  },

  /**
   * Remove addon item from config
   */
  removeAddonItem: async (itemId: number): Promise<void> => {
    await api.delete(`/bookingflow/addon-items/${itemId}/`);
  },

  /**
   * Update summary configuration
   */
  updateSummaryConfig: async (
    flowId: number,
    configData: Partial<SummaryConfig>
  ): Promise<SummaryConfig> => {
    const response = await api.patch<SummaryConfig>(
      `/bookingflow/flows/${flowId}/summary_config/`,
      configData
    );
    return response.data;
  },

  /**
   * Update payment configuration
   */
  updatePaymentConfig: async (
    flowId: number,
    configData: Partial<PaymentConfig>
  ): Promise<PaymentConfig> => {
    const response = await api.patch<PaymentConfig>(
      `/bookingflow/flows/${flowId}/payment_config/`,
      configData
    );
    return response.data;
  },

  /**
   * Update confirmation configuration
   */
  updateConfirmationConfig: async (
    flowId: number,
    configData: Partial<ConfirmationConfig>
  ): Promise<ConfirmationConfig> => {
    const response = await api.patch<ConfirmationConfig>(
      `/bookingflow/flows/${flowId}/confirmation_config/`,
      configData
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
