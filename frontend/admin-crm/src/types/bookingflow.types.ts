// frontend/admin-crm/src/types/bookingflow.types.ts
import { EventType } from "./events.types";
import { ProductOption } from "./products.types";
import { Questionnaire } from "./questionnaires.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Booking Flow
export interface BookingFlow {
  id: number;
  name: string;
  description: string;
  event_type: number | EventType;
  event_type_details?: EventType;
  is_active: boolean;
  steps_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BookingFlowResponse extends PaginationResponse<BookingFlow> {}

// Booking Step Types
export type StepType =
  | "INTRO"
  | "EVENT_TYPE"
  | "DATE"
  | "QUESTIONNAIRE"
  | "PRODUCT"
  | "ADDON"
  | "SUMMARY"
  | "PAYMENT"
  | "CONFIRMATION"
  | "CUSTOM";

// Booking Step
export interface BookingStep {
  id: number;
  booking_flow: number | BookingFlow;
  name: string;
  step_type: StepType;
  step_type_display?: string;
  description: string;
  instructions: string;
  order: number;
  is_required: boolean;
  is_visible: boolean;
  questionnaire_config?: QuestionnaireStepConfiguration;
  product_config?: ProductStepConfiguration;
  date_config?: DateStepConfiguration;
  custom_config?: CustomStepConfiguration;
  created_at: string;
  updated_at: string;
}

export interface BookingStepResponse extends PaginationResponse<BookingStep> {}

// Questionnaire Step Configuration
export interface QuestionnaireStepConfiguration {
  id: number;
  questionnaire: number | Questionnaire;
  questionnaire_details?: Questionnaire;
  require_all_fields: boolean;
  created_at: string;
  updated_at: string;
}

// Product Step Configuration
export interface ProductStepConfiguration {
  id: number;
  min_selection: number;
  max_selection: number;
  selection_type: "SINGLE" | "MULTIPLE";
  product_items: ProductStepItem[];
  created_at: string;
  updated_at: string;
}

// Product Step Item
export interface ProductStepItem {
  id: number;
  product: number | ProductOption;
  product_details?: ProductOption;
  order: number;
  is_highlighted: boolean;
  custom_price: number | null;
  custom_description: string;
  created_at: string;
  updated_at: string;
}

// Date Step Configuration
export interface DateStepConfiguration {
  id: number;
  min_days_in_future: number;
  max_days_in_future: number;
  allow_time_selection: boolean;
  buffer_before_event: number;
  buffer_after_event: number;
  created_at: string;
  updated_at: string;
}

// Custom Step Configuration
export interface CustomStepConfiguration {
  id: number;
  html_content: string;
  use_react_component: boolean;
  component_name: string;
  component_props: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Form Data Types
export interface BookingFlowFormData {
  name: string;
  description: string;
  event_type: number | null;
  is_active: boolean;
  steps?: BookingStepFormData[];
}

export interface BookingStepFormData {
  name: string;
  step_type: StepType;
  description: string;
  instructions: string;
  order?: number;
  is_required: boolean;
  is_visible: boolean;
  booking_flow?: number;
  questionnaire_config?: {
    questionnaire: number;
    require_all_fields: boolean;
  };
  product_config?: {
    min_selection: number;
    max_selection: number;
    selection_type: "SINGLE" | "MULTIPLE";
    product_items?: ProductStepItemFormData[];
  };
  date_config?: {
    min_days_in_future: number;
    max_days_in_future: number;
    allow_time_selection: boolean;
    buffer_before_event: number;
    buffer_after_event: number;
  };
  custom_config?: {
    html_content: string;
    use_react_component: boolean;
    component_name: string;
    component_props: Record<string, any>;
  };
}

export interface ProductStepItemFormData {
  product: number;
  order?: number;
  is_highlighted: boolean;
  custom_price?: number | null;
  custom_description: string;
}

// Error Types
export interface BookingFlowFormErrors {
  name?: string;
  description?: string;
  event_type?: string;
  is_active?: string;
  steps?: string;
}

export interface BookingStepFormErrors {
  name?: string;
  step_type?: string;
  description?: string;
  instructions?: string;
  order?: string;
  is_required?: string;
  is_visible?: string;
  booking_flow?: string;
  questionnaire_config?: {
    questionnaire?: string;
    require_all_fields?: string;
  };
  product_config?: {
    min_selection?: string;
    max_selection?: string;
    selection_type?: string;
    product_items?: string;
  };
  date_config?: {
    min_days_in_future?: string;
    max_days_in_future?: string;
    allow_time_selection?: string;
    buffer_before_event?: string;
    buffer_after_event?: string;
  };
  custom_config?: {
    html_content?: string;
    use_react_component?: string;
    component_name?: string;
    component_props?: string;
  };
}

export interface ProductStepItemFormErrors {
  product?: string;
  order?: string;
  is_highlighted?: string;
  custom_price?: string;
  custom_description?: string;
}

// API Request Types
export interface ReorderStepsRequest {
  flow_id: number;
  order_mapping: { [key: string]: number };
}

export interface ReorderProductItemsRequest {
  config_id: number;
  order_mapping: { [key: string]: number };
}
