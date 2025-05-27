// frontend/client-portal/src/types/workflows.types.ts
import { EventType } from "./events.types";

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
  email_template: number | null;
  task_description: string;
  // New workflow engine fields
  progression_condition: string;
  required_tasks_completed: boolean;
  metadata: { [key: string]: any };
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
