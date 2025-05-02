// frontend/client-portal/src/types/questionnaires.types.ts
import { EventType } from "./events.types";

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

// Questionnaire
export interface Questionnaire {
  id: number;
  name: string;
  event_type: number | EventType | null;
  is_active: boolean;
  order: number;
  fields: QuestionnaireField[]; // Ensure fields is defined as required
  fields_count?: number;
  created_at: string;
  updated_at: string;
}
