// frontend/admin-crm/src/types/payments.types.ts
import { User } from "./auth.types";
import { Event } from "./events.types";
import { ProductOption } from "./products.types";
import { EventQuote } from "./sales.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Payment statuses
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

// Payment Model
export interface Payment {
  id: number;
  payment_number: string;
  event: number | Event;
  event_details?: Event;
  amount: number;
  status: PaymentStatus;
  status_display: string;
  due_date: string;
  paid_on: string | null;
  payment_method: number | PaymentMethod | null;
  payment_method_details?: PaymentMethod;
  description: string;
  notes: string;
  reference_number: string;
  is_manual: boolean;
  processed_by: number | User | null;
  processed_by_details?: User;
  receipt_number: string | null;
  receipt_generated_on: string | null;
  receipt_sent: boolean;
  receipt_sent_on: string | null;
  receipt_pdf: string | null;
  quote: number | EventQuote | null;
  quote_details?: EventQuote;
  invoice: number | Invoice | null;
  invoice_details?: Invoice;
  installment: number | PaymentInstallment | null;
  installment_details?: PaymentInstallment;
  transactions?: PaymentTransaction[];
  refunds?: Refund[];
  created_at: string;
  updated_at: string;
}

export interface PaymentResponse extends PaginationResponse<Payment> {}

// Payment Form Data
export interface PaymentFormData {
  event: number;
  amount: number;
  status?: PaymentStatus;
  due_date: string;
  payment_method?: number | null;
  description?: string;
  notes?: string;
  reference_number?: string;
  is_manual?: boolean;
  quote?: number | null;
  invoice?: number | null;
}

// Payment filters
export interface PaymentFilters {
  event?: number;
  status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  payment_method?: number;
  is_manual?: boolean;
  amount_min?: number;
  amount_max?: number;
}

// Payment method types
export type PaymentMethodType =
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "CHECK"
  | "CASH"
  | "DIGITAL_WALLET";

// Payment Method Model
export interface PaymentMethod {
  id: number;
  user: number;
  user_details?: User;
  type: PaymentMethodType;
  type_display: string;
  is_default: boolean;
  nickname: string;
  instructions: string;
  gateway: number | PaymentGateway | null;
  gateway_details?: PaymentGateway;
  token_reference?: string;
  last_four: string;
  expiry_date: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodResponse
  extends PaginationResponse<PaymentMethod> {}

// Payment Method Form Data
export interface PaymentMethodFormData {
  user?: number;
  type: PaymentMethodType;
  is_default?: boolean;
  nickname?: string;
  instructions?: string;
  gateway?: number | null;
  token_reference?: string;
  last_four?: string;
  expiry_date?: string | null;
  metadata?: Record<string, any>;
}

// Payment Gateway Model
export interface PaymentGateway {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  config?: Record<string, any>;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentGatewayResponse
  extends PaginationResponse<PaymentGateway> {}

// Payment Gateway Form Data
export interface PaymentGatewayFormData {
  name: string;
  code: string;
  is_active?: boolean;
  config?: Record<string, any>;
  description?: string;
}

// Transaction status
export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

// Payment Transaction Model
export interface PaymentTransaction {
  id: number;
  payment: number;
  gateway: number;
  gateway_details?: PaymentGateway;
  transaction_id: string;
  amount: number;
  status: TransactionStatus;
  status_display: string;
  response_data?: Record<string, any>;
  error_message: string;
  is_test: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransactionResponse
  extends PaginationResponse<PaymentTransaction> {}

// Process Payment Request
export interface ProcessPaymentRequest {
  payment_method: number;
  is_test?: boolean;
}

// Refund status
export type RefundStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED";

// Refund Model
export interface Refund {
  id: number;
  payment: number;
  payment_details?: { id: number; payment_number: string; amount: number };
  amount: number;
  reason: string;
  status: RefundStatus;
  status_display: string;
  refunded_by: number | null;
  refunded_by_details?: User;
  refund_transaction_id: string;
  gateway_response?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RefundResponse extends PaginationResponse<Refund> {}

// Refund Request
export interface RefundRequest {
  amount: number;
  reason: string;
}

// Invoice Model
export interface Invoice {
  id: number;
  invoice_id: string;
  event: number | Event;
  event_details?: Event;
  client: number | User;
  client_details?: User;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  status: "DRAFT" | "ISSUED" | "PAID" | "VOID" | "CANCELLED";
  status_display: string;
  notes: string;
  payment_terms: string;
  quote: number | EventQuote | null;
  quote_details?: EventQuote;
  invoice_pdf: string | null;
  line_items?: InvoiceLineItem[];
  taxes?: InvoiceTax[];
  related_payments?: Payment[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceResponse extends PaginationResponse<Invoice> {}

// Invoice Form Data
export interface InvoiceFormData {
  event: number;
  invoice_id?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  issue_date?: string;
  due_date?: string;
  status?: "DRAFT" | "ISSUED" | "PAID" | "VOID" | "CANCELLED";
  notes?: string;
  payment_terms?: string;
  quote?: number | null;
  line_items?: InvoiceLineItemFormData[];
}

export interface InvoiceFilters {
  event?: number;
  client?: number;
  status?: string;
  search?: string;
}

// Invoice Line Item
export interface InvoiceLineItem {
  id: number;
  invoice: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
  product: number | ProductOption | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItemFormData {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  total?: number;
  product?: number | null;
}

// Invoice Tax
export interface InvoiceTax {
  id: number;
  invoice: number;
  tax_rate: number;
  tax_rate_details?: TaxRate;
  taxable_amount: number;
  tax_amount: number;
  created_at: string;
  updated_at: string;
}

// Tax Rate
export interface TaxRate {
  id: number;
  name: string;
  rate: number;
  region: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxRateResponse extends PaginationResponse<TaxRate> {}

export interface TaxRateFormData {
  name: string;
  rate: number;
  region?: string;
  is_default?: boolean;
}

// Payment Plan
export interface PaymentPlan {
  id: number;
  event: number | Event;
  event_details?: Event;
  total_amount: number;
  down_payment_amount: number;
  down_payment_due_date: string;
  number_of_installments: number;
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  notes: string;
  quote: number | EventQuote | null;
  quote_details?: EventQuote;
  installments?: PaymentInstallment[];
  created_at: string;
  updated_at: string;
}

export interface PaymentPlanResponse extends PaginationResponse<PaymentPlan> {}

export interface PaymentPlanFormData {
  event: number;
  total_amount: number;
  down_payment_amount: number;
  down_payment_due_date: string;
  number_of_installments: number;
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  notes?: string;
  quote?: number | null;
}

// Payment Installment
export interface PaymentInstallment {
  id: number;
  payment_plan: number;
  payment_plan_details?: {
    id: number;
    event_id: number;
    total_amount: number;
  };
  amount: number;
  due_date: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  status_display: string;
  installment_number: number;
  description: string;
  payment_details?: Payment;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentFromInstallmentRequest {
  payment_method?: number;
  process_now?: boolean;
}

// Payment Notification
export interface PaymentNotification {
  id: number;
  payment: number | null;
  payment_details?: {
    id: number;
    payment_number: string;
    amount: number;
  } | null;
  notification_type: string;
  notification_type_display: string;
  sent_at: string;
  sent_to: string;
  template_used: number | null;
  is_successful: boolean;
  reference: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentNotificationResponse
  extends PaginationResponse<PaymentNotification> {}
