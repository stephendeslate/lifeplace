// frontend/admin-crm/src/apis/sales.api.ts
import {
  EventQuote,
  EventQuoteFormData,
  EventQuoteResponse,
  QuoteTemplate,
  QuoteTemplateFormData,
  QuoteTemplateProductFormData,
  QuoteTemplateResponse,
} from "../types/sales.types";
import api from "../utils/api";

class SalesAPI {
  // Quote Templates
  async getQuoteTemplates(
    page = 1,
    search?: string,
    eventType?: number,
    isActive?: boolean
  ): Promise<QuoteTemplateResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
    });

    if (search) params.append("search", search);
    if (eventType) params.append("event_type", eventType.toString());
    if (isActive !== undefined) params.append("is_active", isActive.toString());

    const response = await api.get(`/sales/templates/?${params}`);
    return response.data;
  }

  async getQuoteTemplateById(id: number): Promise<QuoteTemplate> {
    const response = await api.get(`/sales/templates/${id}/`);
    return response.data;
  }

  async createQuoteTemplate(
    data: QuoteTemplateFormData
  ): Promise<QuoteTemplate> {
    const response = await api.post("/sales/templates/", data);
    return response.data;
  }

  async updateQuoteTemplate(
    id: number,
    data: Partial<QuoteTemplateFormData>
  ): Promise<QuoteTemplate> {
    const response = await api.patch(`/sales/templates/${id}/`, data);
    return response.data;
  }

  async deleteQuoteTemplate(id: number): Promise<void> {
    await api.delete(`/sales/templates/${id}/`);
  }

  async getActiveTemplates(page = 1): Promise<QuoteTemplateResponse> {
    const response = await api.get(`/sales/templates/active/?page=${page}`);
    return response.data;
  }

  async getTemplatesForEventType(
    eventType: number,
    page = 1
  ): Promise<QuoteTemplateResponse> {
    const response = await api.get(
      `/sales/templates/for_event_type/?event_type=${eventType}&page=${page}`
    );
    return response.data;
  }

  // Template Products
  async addProductToTemplate(data: QuoteTemplateProductFormData): Promise<any> {
    const response = await api.post("/sales/template-products/", data);
    return response.data;
  }

  async updateTemplateProduct(
    id: number,
    data: Partial<QuoteTemplateProductFormData>
  ): Promise<any> {
    const response = await api.patch(`/sales/template-products/${id}/`, data);
    return response.data;
  }

  async removeTemplateProduct(id: number): Promise<void> {
    await api.delete(`/sales/template-products/${id}/`);
  }

  // Event Quotes
  async getQuotes(
    page = 1,
    eventId?: number,
    status?: string
  ): Promise<EventQuoteResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
    });

    if (eventId) params.append("event_id", eventId.toString());
    if (status) params.append("status", status);

    const response = await api.get(`/sales/quotes/?${params}`);
    return response.data;
  }

  async getQuotesForEvent(eventId: number): Promise<EventQuote[]> {
    const response = await api.get(
      `/sales/quotes/for_event/?event_id=${eventId}`
    );
    return response.data;
  }

  async getQuoteById(id: number): Promise<EventQuote> {
    const response = await api.get(`/sales/quotes/${id}/`);
    return response.data;
  }

  async createQuote(data: EventQuoteFormData): Promise<EventQuote> {
    const response = await api.post("/sales/quotes/", data);
    return response.data;
  }

  async updateQuote(
    id: number,
    data: Partial<EventQuoteFormData>
  ): Promise<EventQuote> {
    const response = await api.patch(`/sales/quotes/${id}/`, data);
    return response.data;
  }

  async deleteQuote(id: number): Promise<void> {
    await api.delete(`/sales/quotes/${id}/`);
  }

  async sendQuote(id: number): Promise<EventQuote> {
    const response = await api.post(`/sales/quotes/${id}/send/`);
    return response.data;
  }

  async acceptQuote(id: number, notes?: string): Promise<EventQuote> {
    const data = notes ? { notes } : {};
    const response = await api.post(`/sales/quotes/${id}/accept/`, data);
    return response.data;
  }

  async rejectQuote(id: number, notes?: string): Promise<EventQuote> {
    const data = notes ? { notes } : {};
    const response = await api.post(`/sales/quotes/${id}/reject/`, data);
    return response.data;
  }

  async duplicateQuote(id: number): Promise<EventQuote> {
    const response = await api.post(`/sales/quotes/${id}/duplicate/`);
    return response.data;
  }

  // Line Items
  async createQuoteLineItem(data: any): Promise<any> {
    const response = await api.post("/sales/line-items/", data);
    return response.data;
  }

  async updateQuoteLineItem(id: number, data: any): Promise<any> {
    const response = await api.patch(`/sales/line-items/${id}/`, data);
    return response.data;
  }

  async deleteQuoteLineItem(id: number): Promise<void> {
    await api.delete(`/sales/line-items/${id}/`);
  }
}

export const salesApi = new SalesAPI();
