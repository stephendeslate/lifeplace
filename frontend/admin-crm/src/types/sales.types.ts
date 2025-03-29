// frontend/admin-crm/src/types/sales.types.ts
import { ContractTemplate } from "./contracts.types";
import { Event } from "./events.types";
import { ProductOption } from "./products.types";
import { Questionnaire } from "./questionnaires.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Quote Template
export interface QuoteTemplate {
  id: number;
  name: string;
  introduction: string;
  event_type: number | any; // Type will be expanded when joined
  event_type_name?: string;
  terms_and_conditions: string;
  is_active: boolean;
  products?: QuoteTemplateProduct[];
  contract_templates?: ContractTemplate[];
  questionnaires?: Questionnaire[];
  created_at: string;
  updated_at: string;
}

export interface QuoteTemplateResponse
  extends PaginationResponse<QuoteTemplate> {}

// Template Product Junction
export interface QuoteTemplateProduct {
  id: number;
  template: number | QuoteTemplate;
  product: number | ProductOption;
  product_details?: ProductOption;
  quantity: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

// Event Quote
export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface EventQuote {
  id: number;
  event: number | Event;
  event_details?: Event;
  template: number | QuoteTemplate | null;
  template_details?: QuoteTemplate;
  version: number;
  status: QuoteStatus;
  status_display?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  valid_until: string;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string;
  notes: string;
  terms_and_conditions: string;
  client_message: string;
  signature_data: string;
  line_items?: QuoteLineItem[];
  options?: QuoteOption[];
  activities?: QuoteActivity[];
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: number;
  quote: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
  product: number | ProductOption | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteOption {
  id: number;
  quote: number;
  name: string;
  description: string;
  total_price: number;
  is_selected: boolean;
  items?: QuoteOptionItem[];
  created_at: string;
  updated_at: string;
}

export interface QuoteOptionItem {
  id: number;
  option: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  product: number | ProductOption | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteActivity {
  id: number;
  quote: number;
  action: string;
  action_by: number | null;
  action_by_name?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface EventQuoteResponse extends PaginationResponse<EventQuote> {}

// Form Data Types
export interface QuoteTemplateFormData {
  name: string;
  introduction: string;
  event_type: number | null;
  terms_and_conditions: string;
  is_active: boolean;
  products?: QuoteTemplateProductFormData[];
  contract_templates?: number[];
  questionnaires?: number[];
}

export interface QuoteTemplateProductFormData {
  product: number;
  quantity: number;
  is_required: boolean;
  template?: number;
  id?: number;
}

export interface EventQuoteFormData {
  event: number;
  template?: number | null;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  valid_until: string;
  notes?: string;
  terms_and_conditions?: string;
  client_message?: string;
  status?: QuoteStatus;
}

// Form Error Types
export interface QuoteTemplateFormErrors {
  name?: string;
  introduction?: string;
  event_type?: string;
  terms_and_conditions?: string;
  products?: string;
}

export interface QuoteTemplateProductFormErrors {
  product?: string;
  quantity?: string;
}

export interface EventQuoteFormErrors {
  event?: string;
  template?: string;
  total_amount?: string;
  valid_until?: string;
  notes?: string;
  terms_and_conditions?: string;
}

// Filter Types
export interface QuoteTemplateFilters {
  search?: string;
  event_type?: number;
  is_active?: boolean;
}

export interface EventQuoteFilters {
  event?: number;
  status?: QuoteStatus;
}
