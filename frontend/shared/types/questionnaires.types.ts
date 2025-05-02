// frontend/admin-crm/src/shared/types/questionnaires.types.ts
import { EventType } from "./events.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Field Types
export type FieldType =
  | "text"
  | "number"
  | "date"
  | "time"
  | "boolean"
  | "select"
  | "multi-select"
  | "email"
  | "phone"
  | "file";

// Questionnaire
export interface Questionnaire {
  id: number;
  name: string;
  event_type: number | EventType | null;
  is_active: boolean;
  order: number;
  fields?: QuestionnaireField[];
  fields_count?: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponse
  extends PaginationResponse<Questionnaire> {}

// Questionnaire Field
export interface QuestionnaireField {
  id: number;
  questionnaire: number;
  name: string;
  type: FieldType;
  type_display?: string;
  required: boolean;
  order: number;
  options: string[] | null;
  created_at: string;
  updated_at: string;
}

// Questionnaire Response
export interface QuestionnaireResponse {
  id: number;
  event: number;
  field: number;
  field_name?: string;
  field_type?: string;
  value: string;
  created_at: string;
  updated_at: string;
}

// Forms and Filters
export interface QuestionnaireFormData {
  name: string;
  event_type: number | null;
  is_active: boolean;
  order: number;
  fields?: QuestionnaireFieldFormData[];
}

export interface QuestionnaireFieldFormData {
  name: string;
  type: FieldType;
  required: boolean;
  order: number;
  options?: string[] | null;
  questionnaire?: number;
}

export interface QuestionnaireFormErrors {
  name?: string;
  event_type?: string;
  order?: string;
  fields?: string;
}

export interface QuestionnaireFieldFormErrors {
  name?: string;
  type?: string;
  order?: string;
  options?: string;
}

export interface QuestionnaireResponseFormData {
  event: number;
  field: number;
  value: string;
}

export interface QuestionnaireFilters {
  search?: string;
  event_type?: number;
  is_active?: boolean;
}

export interface EventResponsesData {
  event: number;
  responses: {
    field: number;
    value: string;
  }[];
}
