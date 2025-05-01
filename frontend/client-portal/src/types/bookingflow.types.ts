// frontend/client-portal/src/types/bookingflow.types.ts
import { EventType } from "../shared/types/events.types";
import { ProductOption } from "../shared/types/products.types";
import { Questionnaire } from "../shared/types/questionnaires.types";

export type StepType =
  | "EVENT_TYPE"
  | "INTRO"
  | "DATE"
  | "QUESTIONNAIRE"
  | "PRODUCT"
  | "ADDON"
  | "SUMMARY"
  | "PAYMENT"
  | "CONFIRMATION"
  | "CUSTOM";

export interface BookingFlow {
  id: number;
  name: string;
  description: string;
  event_type: number | EventType;
  event_type_details?: EventType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  questionnaire_config?: QuestionnaireStepConfig;
  product_config?: ProductStepConfig;
  date_config?: DateStepConfig;
  custom_config?: CustomStepConfig;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireStepConfig {
  id: number;
  questionnaire: number | Questionnaire;
  questionnaire_details?: Questionnaire;
  require_all_fields: boolean;
}

export interface ProductStepConfig {
  id: number;
  min_selection: number;
  max_selection: number;
  selection_type: "SINGLE" | "MULTIPLE";
  product_items: ProductStepItem[];
}

export interface ProductStepItem {
  id: number;
  product: number | ProductOption;
  product_details?: ProductOption;
  order: number;
  is_highlighted: boolean;
  custom_price: number | null;
  custom_description: string;
}

export interface DateStepConfig {
  id: number;
  min_days_in_future: number;
  max_days_in_future: number;
  allow_time_selection: boolean;
  buffer_before_event: number;
  buffer_after_event: number;
  allow_multi_day: boolean;
}

export interface CustomStepConfig {
  id: number;
  html_content: string;
  use_react_component: boolean;
  component_name: string;
  component_props: Record<string, any>;
}

// Booking state to track progress through steps
export interface BookingState {
  eventType: number | null;
  bookingFlow: BookingFlow | null;
  currentStepIndex: number;
  steps: BookingStep[];

  // Start/end date and time for multi-day support
  selectedStartDate: string | null;
  selectedEndDate: string | null;
  selectedStartTime: string | null;
  selectedEndTime: string | null;

  // For backward compatibility
  selectedDate: string | null;
  selectedTime: string | null;

  questionnaireResponses: Record<number, string>; // fieldId -> value
  selectedProducts: Array<{ productId: number; quantity: number }>;
  selectedAddons: Array<{ productId: number; quantity: number }>;
  paymentMethod: string | null;
  summary: BookingSummary | null;
  eventId?: number;
}

export interface BookingSummary {
  eventType: EventType;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;

  // For backward compatibility
  date: string;
  time?: string;

  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  addons: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
}

// Form data for creating an event
export interface EventCreateRequest {
  client: number;
  event_type: number;
  name: string;
  status: "LEAD";
  start_date: string;
  end_date?: string;
  event_products: Array<{
    product_option: number;
    quantity: number;
    final_price: number;
  }>;
}
