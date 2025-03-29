// frontend/admin-crm/src/apis/sales.api.ts
import {
  EventQuote,
  EventQuoteFormData,
  QuoteTemplate,
  QuoteTemplateFormData,
  QuoteTemplateProduct,
  QuoteTemplateProductFormData,
  QuoteTemplateResponse,
} from "../types/sales.types";
import api from "../utils/api";

export const salesApi = {
  /**
   * Get all quote templates with optional filtering
   */
  getQuoteTemplates: async (
    page = 1,
    search?: string,
    eventTypeId?: number,
    isActive?: boolean
  ): Promise<QuoteTemplateResponse> => {
    const params: Record<string, any> = { page };

    if (search) {
      params.search = search;
    }

    if (eventTypeId) {
      params.event_type = eventTypeId;
    }

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    const response = await api.get<QuoteTemplateResponse>("/sales/templates/", {
      params,
    });
    return response.data;
  },

  /**
   * Get active quote templates
   */
  getActiveTemplates: async (page = 1): Promise<QuoteTemplateResponse> => {
    const response = await api.get<QuoteTemplateResponse>(
      "/sales/templates/active/",
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get a specific quote template by ID
   */
  getQuoteTemplateById: async (id: number): Promise<QuoteTemplate> => {
    const response = await api.get<QuoteTemplate>(`/sales/templates/${id}/`);
    return response.data;
  },

  /**
   * Create a new quote template
   */
  createQuoteTemplate: async (
    templateData: QuoteTemplateFormData
  ): Promise<QuoteTemplate> => {
    const response = await api.post<QuoteTemplate>(
      "/sales/templates/",
      templateData
    );
    return response.data;
  },

  /**
   * Update an existing quote template
   */
  updateQuoteTemplate: async (
    id: number,
    templateData: Partial<QuoteTemplateFormData>
  ): Promise<QuoteTemplate> => {
    const response = await api.patch<QuoteTemplate>(
      `/sales/templates/${id}/`,
      templateData
    );
    return response.data;
  },

  /**
   * Delete a quote template
   */
  deleteQuoteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/sales/templates/${id}/`);
  },

  /**
   * Get all quotes for a specific event
   */
  getQuotesForEvent: async (eventId: number): Promise<EventQuote[]> => {
    const response = await api.get<EventQuote[]>("/sales/quotes/for_event/", {
      params: { event_id: eventId },
    });
    return response.data;
  },

  /**
   * Get a specific quote by ID
   */
  getQuoteById: async (id: number): Promise<EventQuote> => {
    const response = await api.get<EventQuote>(`/sales/quotes/${id}/`);
    return response.data;
  },

  /**
   * Create a new quote
   */
  createQuote: async (quoteData: EventQuoteFormData): Promise<EventQuote> => {
    const response = await api.post<EventQuote>("/sales/quotes/", quoteData);
    return response.data;
  },

  /**
   * Update an existing quote
   */
  updateQuote: async (
    id: number,
    quoteData: Partial<EventQuoteFormData>
  ): Promise<EventQuote> => {
    const response = await api.patch<EventQuote>(
      `/sales/quotes/${id}/`,
      quoteData
    );
    return response.data;
  },

  /**
   * Delete a quote
   */
  deleteQuote: async (id: number): Promise<void> => {
    await api.delete(`/sales/quotes/${id}/`);
  },

  /**
   * Send a quote to client
   */
  sendQuote: async (id: number): Promise<EventQuote> => {
    const response = await api.post<EventQuote>(`/sales/quotes/${id}/send/`);
    return response.data;
  },

  /**
   * Accept a quote
   */
  acceptQuote: async (id: number, notes?: string): Promise<EventQuote> => {
    const data = notes ? { notes } : {};
    const response = await api.post<EventQuote>(
      `/sales/quotes/${id}/accept/`,
      data
    );
    return response.data;
  },

  /**
   * Reject a quote
   */
  rejectQuote: async (id: number, notes?: string): Promise<EventQuote> => {
    const data = notes ? { notes } : {};
    const response = await api.post<EventQuote>(
      `/sales/quotes/${id}/reject/`,
      data
    );
    return response.data;
  },

  /**
   * Duplicate a quote
   */
  duplicateQuote: async (id: number): Promise<EventQuote> => {
    const response = await api.post<EventQuote>(
      `/sales/quotes/${id}/duplicate/`
    );
    return response.data;
  },

  /**
   * Add a product to a quote template
   */
  addProductToTemplate: async (
    productData: QuoteTemplateProductFormData
  ): Promise<QuoteTemplateProduct> => {
    const response = await api.post<QuoteTemplateProduct>(
      "/sales/template-products/",
      productData
    );
    return response.data;
  },

  /**
   * Update a template product
   */
  updateTemplateProduct: async (
    id: number,
    productData: Partial<QuoteTemplateProductFormData>
  ): Promise<QuoteTemplateProduct> => {
    const response = await api.patch<QuoteTemplateProduct>(
      `/sales/template-products/${id}/`,
      productData
    );
    return response.data;
  },

  /**
   * Remove a product from a template
   */
  removeTemplateProduct: async (id: number): Promise<void> => {
    await api.delete(`/sales/template-products/${id}/`);
  },
};

export default salesApi;
