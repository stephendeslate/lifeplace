// frontend/admin-crm/src/types/workflows.types.ts
import { EventType } from "./events.types";
import { EmailTemplate } from "./settings.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Workflow stage types
export type StageType = "LEAD" | "PRODUCTION" | "POST_PRODUCTION";

export interface WorkflowStage {
  id: number;
  template: number;
  name: string;
  stage: StageType;
  stage_display: string;
  order: number;
  is_automated: boolean;
  automation_type: string;
  trigger_time: string;
  email_template: number | EmailTemplate | null;
  task_description: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: number;
  name: string;
  description: string;
  event_type: number | EventType | null;
  is_active: boolean;
  stages?: WorkflowStage[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplateResponse
  extends PaginationResponse<WorkflowTemplate> {}

export interface WorkflowStageFormData {
  name: string;
  stage: StageType;
  order: number;
  is_automated: boolean;
  automation_type?: string;
  trigger_time?: string;
  email_template?: number | null;
  task_description?: string;
  template: number;
}

export interface WorkflowTemplateFormData {
  name: string;
  description: string;
  event_type?: number | null;
  is_active: boolean;
  stages?: WorkflowStageFormData[];
}

export interface WorkflowTemplateFormErrors {
  name?: string;
  description?: string;
  event_type?: string;
  stages?: { [key: string]: string } | string;
}

export interface WorkflowStageFormErrors {
  name?: string;
  stage?: string;
  order?: string;
  automation_type?: string;
  trigger_time?: string;
  email_template?: string;
  task_description?: string;
}

export interface ReorderStagesRequest {
  template_id: number;
  stage_type: StageType;
  order_mapping: { [key: string]: number };
}
