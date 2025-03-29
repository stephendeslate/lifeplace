// frontend/admin-crm/src/apis/payments.api.ts
import {
  CreatePaymentFromInstallmentRequest,
  Invoice,
  InvoiceFormData,
  InvoiceResponse,
  Payment,
  PaymentFilters,
  PaymentFormData,
  PaymentGateway,
  PaymentGatewayFormData,
  PaymentGatewayResponse,
  PaymentMethod,
  PaymentMethodFormData,
  PaymentNotificationResponse,
  PaymentPlan,
  PaymentPlanFormData,
  PaymentResponse,
  PaymentTransaction,
  ProcessPaymentRequest,
  RefundRequest,
  TaxRate,
  TaxRateFormData,
  TaxRateResponse,
} from "../types/payments.types";
import api from "../utils/api";

export const paymentsApi = {
  /**
   * Get all payments with optional filtering
   */
  getPayments: async (
    page = 1,
    filters?: PaymentFilters
  ): Promise<PaymentResponse> => {
    const params: Record<string, any> = { page };

    // Add filters to params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
    }

    const response = await api.get<PaymentResponse>("/payments/payments/", {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific payment by ID
   */
  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/payments/${id}/`);
    return response.data;
  },

  /**
   * Get payments for a specific event
   */
  getPaymentsForEvent: async (eventId: number): Promise<Payment[]> => {
    const response = await api.get<Payment[]>("/payments/payments/for_event/", {
      params: { event_id: eventId },
    });
    return response.data;
  },

  /**
   * Create a new payment
   */
  createPayment: async (paymentData: PaymentFormData): Promise<Payment> => {
    const response = await api.post<Payment>(
      "/payments/payments/",
      paymentData
    );
    return response.data;
  },

  /**
   * Update an existing payment
   */
  updatePayment: async (
    id: number,
    paymentData: Partial<PaymentFormData>
  ): Promise<Payment> => {
    const response = await api.patch<Payment>(
      `/payments/payments/${id}/`,
      paymentData
    );
    return response.data;
  },

  /**
   * Process a payment through payment gateway
   */
  processPayment: async (
    id: number,
    processData: ProcessPaymentRequest
  ): Promise<PaymentTransaction> => {
    const response = await api.post<PaymentTransaction>(
      `/payments/payments/${id}/process/`,
      processData
    );
    return response.data;
  },

  /**
   * Create a refund for a payment
   */
  createRefund: async (
    paymentId: number,
    refundData: RefundRequest
  ): Promise<any> => {
    const response = await api.post<any>(
      `/payments/payments/${paymentId}/refund/`,
      refundData
    );
    return response.data;
  },

  /**
   * Get all invoices with optional filtering
   */
  getInvoices: async (page = 1, filters?: any): Promise<InvoiceResponse> => {
    const params: Record<string, any> = { page };

    // Add filters to params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
    }

    const response = await api.get<InvoiceResponse>("/payments/invoices/", {
      params,
    });
    return response.data;
  },

  /**
   * Get invoices for a specific event
   */
  getInvoicesForEvent: async (eventId: number): Promise<Invoice[]> => {
    const response = await api.get<Invoice[]>("/payments/invoices/for_event/", {
      params: { event_id: eventId },
    });
    return response.data;
  },

  /**
   * Get a specific invoice by ID
   */
  getInvoiceById: async (id: number): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/payments/invoices/${id}/`);
    return response.data;
  },

  /**
   * Create a new invoice
   */
  createInvoice: async (invoiceData: InvoiceFormData): Promise<Invoice> => {
    const response = await api.post<Invoice>(
      "/payments/invoices/",
      invoiceData
    );
    return response.data;
  },

  /**
   * Update an existing invoice
   */
  updateInvoice: async (
    id: number,
    invoiceData: Partial<InvoiceFormData>
  ): Promise<Invoice> => {
    const response = await api.patch<Invoice>(
      `/payments/invoices/${id}/`,
      invoiceData
    );
    return response.data;
  },

  /**
   * Delete an invoice
   */
  deleteInvoice: async (id: number): Promise<void> => {
    await api.delete(`/payments/invoices/${id}/`);
  },

  /**
   * Issue an invoice to client
   */
  issueInvoice: async (id: number): Promise<Invoice> => {
    const response = await api.post<Invoice>(`/payments/invoices/${id}/issue/`);
    return response.data;
  },

  /**
   * Mark an invoice as paid
   */
  markInvoiceAsPaid: async (id: number): Promise<Invoice> => {
    const response = await api.post<Invoice>(
      `/payments/invoices/${id}/mark_paid/`
    );
    return response.data;
  },

  /**
   * Get all payment methods for a user
   */
  getPaymentMethods: async (userId?: number): Promise<PaymentMethod[]> => {
    const params: Record<string, any> = {};
    if (userId) {
      params.user_id = userId;
    }

    const response = await api.get<PaymentMethod[]>(
      "/payments/payment-methods/for_user/",
      { params }
    );
    return response.data;
  },

  /**
   * Get a specific payment method by ID
   */
  getPaymentMethodById: async (id: number): Promise<PaymentMethod> => {
    const response = await api.get<PaymentMethod>(
      `/payments/payment-methods/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new payment method
   */
  createPaymentMethod: async (
    methodData: PaymentMethodFormData
  ): Promise<PaymentMethod> => {
    const response = await api.post<PaymentMethod>(
      "/payments/payment-methods/",
      methodData
    );
    return response.data;
  },

  /**
   * Update an existing payment method
   */
  updatePaymentMethod: async (
    id: number,
    methodData: Partial<PaymentMethodFormData>
  ): Promise<PaymentMethod> => {
    const response = await api.patch<PaymentMethod>(
      `/payments/payment-methods/${id}/`,
      methodData
    );
    return response.data;
  },

  /**
   * Delete a payment method
   */
  deletePaymentMethod: async (id: number): Promise<void> => {
    await api.delete(`/payments/payment-methods/${id}/`);
  },

  /**
   * Get all payment gateways
   */
  getPaymentGateways: async (
    page = 1,
    is_active?: boolean
  ): Promise<PaymentGatewayResponse> => {
    const params: Record<string, any> = { page };
    if (is_active !== undefined) {
      params.is_active = is_active;
    }

    const response = await api.get<PaymentGatewayResponse>(
      "/payments/gateways/",
      { params }
    );
    return response.data;
  },

  /**
   * Get active payment gateways
   */
  getActivePaymentGateways: async (): Promise<PaymentGateway[]> => {
    const response = await api.get<PaymentGateway[]>(
      "/payments/gateways/active/"
    );
    return response.data;
  },

  /**
   * Get a specific payment gateway by ID
   */
  getPaymentGatewayById: async (id: number): Promise<PaymentGateway> => {
    const response = await api.get<PaymentGateway>(`/payments/gateways/${id}/`);
    return response.data;
  },

  /**
   * Create a new payment gateway
   */
  createPaymentGateway: async (
    gatewayData: PaymentGatewayFormData
  ): Promise<PaymentGateway> => {
    const response = await api.post<PaymentGateway>(
      "/payments/gateways/",
      gatewayData
    );
    return response.data;
  },

  /**
   * Update an existing payment gateway
   */
  updatePaymentGateway: async (
    id: number,
    gatewayData: Partial<PaymentGatewayFormData>
  ): Promise<PaymentGateway> => {
    const response = await api.patch<PaymentGateway>(
      `/payments/gateways/${id}/`,
      gatewayData
    );
    return response.data;
  },

  /**
   * Delete a payment gateway
   */
  deletePaymentGateway: async (id: number): Promise<void> => {
    await api.delete(`/payments/gateways/${id}/`);
  },

  /**
   * Get all tax rates
   */
  getTaxRates: async (
    page = 1,
    is_default?: boolean
  ): Promise<TaxRateResponse> => {
    const params: Record<string, any> = { page };
    if (is_default !== undefined) {
      params.is_default = is_default;
    }

    const response = await api.get<TaxRateResponse>("/payments/tax-rates/", {
      params,
    });
    return response.data;
  },

  /**
   * Get the default tax rate
   */
  getDefaultTaxRate: async (): Promise<TaxRate> => {
    const response = await api.get<TaxRate>("/payments/tax-rates/default/");
    return response.data;
  },

  /**
   * Get a specific tax rate by ID
   */
  getTaxRateById: async (id: number): Promise<TaxRate> => {
    const response = await api.get<TaxRate>(`/payments/tax-rates/${id}/`);
    return response.data;
  },

  /**
   * Create a new tax rate
   */
  createTaxRate: async (taxRateData: TaxRateFormData): Promise<TaxRate> => {
    const response = await api.post<TaxRate>(
      "/payments/tax-rates/",
      taxRateData
    );
    return response.data;
  },

  /**
   * Update an existing tax rate
   */
  updateTaxRate: async (
    id: number,
    taxRateData: Partial<TaxRateFormData>
  ): Promise<TaxRate> => {
    const response = await api.patch<TaxRate>(
      `/payments/tax-rates/${id}/`,
      taxRateData
    );
    return response.data;
  },

  /**
   * Delete a tax rate
   */
  deleteTaxRate: async (id: number): Promise<void> => {
    await api.delete(`/payments/tax-rates/${id}/`);
  },

  /**
   * Get payment plan for an event
   */
  getPaymentPlanForEvent: async (eventId: number): Promise<PaymentPlan> => {
    const response = await api.get<PaymentPlan>(
      "/payments/payment-plans/for_event/",
      {
        params: { event_id: eventId },
      }
    );
    return response.data;
  },

  /**
   * Get a specific payment plan by ID
   */
  getPaymentPlanById: async (id: number): Promise<PaymentPlan> => {
    const response = await api.get<PaymentPlan>(
      `/payments/payment-plans/${id}/`
    );
    return response.data;
  },

  /**
   * Create a new payment plan
   */
  createPaymentPlan: async (
    planData: PaymentPlanFormData
  ): Promise<PaymentPlan> => {
    const response = await api.post<PaymentPlan>(
      "/payments/payment-plans/",
      planData
    );
    return response.data;
  },

  /**
   * Update an existing payment plan
   */
  updatePaymentPlan: async (
    id: number,
    planData: Partial<PaymentPlanFormData>
  ): Promise<PaymentPlan> => {
    const response = await api.patch<PaymentPlan>(
      `/payments/payment-plans/${id}/`,
      planData
    );
    return response.data;
  },

  /**
   * Create a payment from an installment
   */
  createPaymentFromInstallment: async (
    installmentId: number,
    paymentData: CreatePaymentFromInstallmentRequest
  ): Promise<Payment> => {
    const response = await api.post<Payment>(
      `/payments/installments/${installmentId}/create_payment/`,
      paymentData
    );
    return response.data;
  },

  /**
   * Check and update an installment's status
   */
  checkInstallmentStatus: async (
    installmentId: number
  ): Promise<{ installment: Payment; status_updated: boolean }> => {
    const response = await api.post<{
      installment: Payment;
      status_updated: boolean;
    }>(`/payments/installments/${installmentId}/check_status/`);
    return response.data;
  },

  /**
   * Get payment notifications
   */
  getPaymentNotifications: async (
    page = 1,
    filters?: any
  ): Promise<PaymentNotificationResponse> => {
    const params: Record<string, any> = { page };

    // Add filters to params if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
    }

    const response = await api.get<PaymentNotificationResponse>(
      "/payments/notifications/",
      { params }
    );
    return response.data;
  },
};

export default paymentsApi;
