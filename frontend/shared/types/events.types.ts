// frontend/admin-crm/src/shared/types/events.types.ts
import { User } from "./auth.types";
import { ProductOption } from "./products.types";
import { WorkflowStage, WorkflowTemplate } from "./workflows.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Event Type
export interface EventType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventTypeResponse extends PaginationResponse<EventType> {}

export interface EventTypeFormData {
  name: string;
  description: string;
  is_active: boolean;
}

export interface EventTypeFormErrors {
  name?: string;
  description?: string;
}

// Event
export type EventStatus = "LEAD" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Event {
  id: number;
  client: number | User;
  client_name: string;
  event_type: number | EventType;
  event_type_name: string;
  name: string;
  status: EventStatus;
  start_date: string;
  end_date: string | null;
  workflow_template: number | WorkflowTemplate | null;
  current_stage: number | WorkflowStage | null;
  current_stage_name: string | null;
  lead_source: string;
  last_contacted: string | null;
  total_price: number | null;
  payment_status: PaymentStatus;
  total_amount_due: number | null;
  total_amount_paid: number;
  workflow_progress: number;
  next_task: NextTask | null;
  created_at: string;
  updated_at: string;
}

export interface EventResponse extends PaginationResponse<Event> {}

// Event Task
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED"
  | "CANCELLED";

export interface NextTask {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface EventTask {
  id: number;
  event: number;
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: number | null;
  assigned_to_name: string | null;
  workflow_stage: number | null;
  completion_notes: string;
  completed_at: string | null;
  completed_by: number | null;
  is_visible_to_client: boolean;
  requires_client_input: boolean;
  created_at: string;
  updated_at: string;
}

// Event Product Option
export interface EventProductOption {
  id: number;
  event: number;
  product_option: number | ProductOption;
  product_name: string;
  quantity: number;
  final_price: number;
  num_participants: number | null;
  num_nights: number | null;
  excess_hours: number | null;
  created_at: string;
  updated_at: string;
}

// Event File
export type FileCategory =
  | "CONTRACT"
  | "QUOTE"
  | "PAYMENT"
  | "REQUIREMENTS"
  | "PHOTO"
  | "OTHER";

export interface EventFile {
  id: number;
  event: number;
  category: FileCategory;
  file: string;
  file_url: string;
  name: string;
  description: string;
  mime_type: string;
  size: number;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  version: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Event Feedback
export interface EventFeedback {
  id: number;
  event: number;
  submitted_by: number | null;
  submitted_by_name: string | null;
  overall_rating: number;
  categories: Record<string, any>;
  comments: string;
  testimonial: string;
  is_public: boolean;
  response: string;
  response_by: number | null;
  response_by_name: string | null;
  created_at: string;
  updated_at: string;
}

// Event Timeline
export type TimelineActionType =
  | "STATUS_CHANGE"
  | "STAGE_CHANGE"
  | "QUOTE_CREATED"
  | "QUOTE_UPDATED"
  | "QUOTE_ACCEPTED"
  | "CONTRACT_SENT"
  | "CONTRACT_SIGNED"
  | "PAYMENT_RECEIVED"
  | "NOTE_ADDED"
  | "FILE_UPLOADED"
  | "TASK_COMPLETED"
  | "FEEDBACK_RECEIVED"
  | "CLIENT_MESSAGE"
  | "SYSTEM_UPDATE";

export interface EventTimeline {
  id: number;
  event: number;
  action_type: TimelineActionType;
  description: string;
  actor: number | null;
  actor_name: string | null;
  action_data: Record<string, any> | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Event Forms and Filters
export interface EventFilters {
  search?: string;
  event_type?: number;
  status?: EventStatus;
  client?: number;
  start_date_from?: string;
  start_date_to?: string;
  payment_status?: PaymentStatus;
}

export interface EventFormData {
  client: number;
  event_type: number;
  name: string;
  status: EventStatus;
  start_date: string;
  end_date?: string;
  workflow_template?: number;
  current_stage?: number;
  lead_source?: string;
  total_price?: number;
  total_amount_due?: number;
  tasks?: Partial<EventTask>[];
  event_products?: Partial<EventProductOption>[];
}

export interface EventFormErrors {
  client?: string;
  event_type?: string;
  name?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  workflow_template?: string;
  current_stage?: string;
  total_price?: string;
  total_amount_due?: string;
  tasks?: string;
  event_products?: string;
}

export interface EventTaskFormData {
  event: number;
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to?: number;
  workflow_stage?: number;
  is_visible_to_client: boolean;
  requires_client_input: boolean;
}

export interface EventTaskFormErrors {
  title?: string;
  due_date?: string;
  priority?: string;
  status?: string;
}

export interface EventProductFormData {
  event: number;
  product_option: number;
  quantity: number;
  final_price: number;
  num_participants?: number;
  num_nights?: number;
  excess_hours?: number;
}

export interface EventFileFormData {
  event: number;
  category: FileCategory;
  file: File;
  name: string;
  description: string;
  is_public: boolean;
}

export interface EventFeedbackFormData {
  event: number;
  overall_rating: number;
  categories: Record<string, any>;
  comments: string;
  testimonial: string;
  is_public: boolean;
}
