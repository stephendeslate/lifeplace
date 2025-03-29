// frontend/admin-crm/src/types/contracts.types.ts
import { User } from "./auth.types";
import { Event, EventType } from "./events.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Contract Template
export interface ContractTemplate {
  id: number;
  name: string;
  description: string;
  event_type: number | EventType | null;
  content: string;
  variables: string[];
  requires_signature: boolean;
  sections: ContractSection[];
  created_at: string;
  updated_at: string;
}

export interface ContractSection {
  title: string;
  content: string;
}

export interface ContractTemplateResponse
  extends PaginationResponse<ContractTemplate> {}

// Event Contract
export type ContractStatus = "DRAFT" | "SENT" | "SIGNED" | "EXPIRED" | "VOID";

export interface EventContract {
  id: number;
  event: number | Event;
  template: number | ContractTemplate;
  template_name: string;
  status: ContractStatus;
  content: string;
  sent_at: string | null;
  signed_at: string | null;
  signed_by: number | User | null;
  signature_data: string | null;
  valid_until: string | null;
  witness_name: string | null;
  witness_signature: string | null;
  created_at: string;
  updated_at: string;
}

// Forms and Filters
export interface ContractTemplateFormData {
  name: string;
  description: string;
  event_type: number | null;
  content: string;
  variables: string[];
  requires_signature: boolean;
  sections: ContractSection[];
}

export interface ContractTemplateFilters {
  search?: string;
  event_type?: number;
}

export interface ContractTemplateFormErrors {
  name?: string;
  description?: string;
  content?: string;
  variables?: string;
  sections?: string;
}

export interface EventContractFormData {
  event: number;
  template: number;
  content?: string;
  valid_until?: string | null;
  context_data?: Record<string, any>;
}

export interface EventContractUpdateData {
  content?: string;
  status?: ContractStatus;
  valid_until?: string | null;
}

export interface EventContractFormErrors {
  event?: string;
  template?: string;
  content?: string;
  valid_until?: string;
}

export interface ContractSignatureData {
  signature_data: string;
  witness_name?: string;
  witness_signature?: string;
}

export interface ContractSignatureFormErrors {
  signature_data?: string;
  witness_name?: string;
  witness_signature?: string;
}

// Template variable context
export interface ContractVariableContext {
  [key: string]: any;
}
