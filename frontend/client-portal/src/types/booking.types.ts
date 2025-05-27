// frontend/client-portal/src/types/booking.types.ts
import { EventType } from "./events.types";
import { ProductOption } from "./products.types";
import { Questionnaire } from "./questionnaires.types";
import { WorkflowTemplate } from "./workflows.types";

// Main booking flow interfaces
export interface BookingFlow {
  id: number;
  name: string;
  description: string;
  event_type: number | EventType;
  event_type_details?: EventType;
  workflow_template?: number | WorkflowTemplate | null;
  workflow_template_details?: WorkflowTemplate;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  intro_config?: IntroConfig;
  date_config?: DateConfig;
  questionnaire_config?: QuestionnaireConfig;
  package_config?: PackageConfig;
  addon_config?: AddonConfig;
  summary_config?: SummaryConfig;
  payment_config?: PaymentConfig;
  confirmation_config?: ConfirmationConfig;
}

// Step configuration interfaces
export interface IntroConfig {
  id?: number;
  title: string;
  description: string;
  show_event_details: boolean;
  is_required: boolean;
  is_visible: boolean;
}

export interface DateConfig {
  id?: number;
  title: string;
  description: string;
  min_days_in_future: number;
  max_days_in_future: number;
  allow_time_selection: boolean;
  buffer_before_event: number;
  buffer_after_event: number;
  allow_multi_day: boolean;
  is_required: boolean;
  is_visible: boolean;
}

export interface QuestionnaireItem {
  id?: number;
  questionnaire: number | Questionnaire;
  questionnaire_details?: Questionnaire;
  order: number;
  is_required: boolean;
}

export interface QuestionnaireConfig {
  id?: number;
  title: string;
  description: string;
  questionnaire_items: QuestionnaireItem[];
  is_required: boolean;
  is_visible: boolean;
}

export interface PackageItem {
  id?: number;
  product: number | ProductOption;
  product_details?: ProductOption;
  order: number;
  is_highlighted: boolean;
  custom_price?: number;
  custom_description?: string;
}

export interface PackageConfig {
  id?: number;
  title: string;
  description: string;
  min_selection: number;
  max_selection: number;
  selection_type: "SINGLE" | "MULTIPLE";
  package_items: PackageItem[];
  is_required: boolean;
  is_visible: boolean;
}

export interface AddonItem {
  id?: number;
  product: number | ProductOption;
  product_details?: ProductOption;
  order: number;
  is_highlighted: boolean;
  custom_price?: number;
  custom_description?: string;
}

export interface AddonConfig {
  id?: number;
  title: string;
  description: string;
  min_selection: number;
  max_selection: number;
  addon_items: AddonItem[];
  is_required: boolean;
  is_visible: boolean;
}

export interface SummaryConfig {
  id?: number;
  title: string;
  description: string;
  show_date: boolean;
  show_packages: boolean;
  show_addons: boolean;
  show_questionnaire: boolean;
  show_total: boolean;
  is_required: boolean;
  is_visible: boolean;
}

export interface PaymentConfig {
  id?: number;
  title: string;
  description: string;
  require_deposit: boolean;
  deposit_percentage: number;
  accept_credit_card: boolean;
  accept_paypal: boolean;
  accept_bank_transfer: boolean;
  payment_instructions: string;
  is_required: boolean;
  is_visible: boolean;
}

export interface ConfirmationConfig {
  id?: number;
  title: string;
  description: string;
  success_message: string;
  send_email: boolean;
  email_template: string;
  show_summary: boolean;
  is_visible: boolean;
}

// Booking form data to track user selections throughout the process
export interface BookingFormData {
  // Event Details
  eventType: number | null;
  eventName: string;
  // Date Selection
  startDate: Date | null;
  endDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  // Questionnaire Responses
  questionnaireResponses: {
    fieldId: number;
    value: string;
  }[];
  // Package Selection
  selectedPackages: {
    packageId: number;
    quantity: number;
  }[];
  // Addon Selection
  selectedAddons: {
    addonId: number;
    quantity: number;
  }[];
  // Payment Details
  paymentMethod: "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER" | null;
  depositOnly: boolean;
  // Total Calculation
  totalPrice: number;
  depositAmount: number;
}

// Booking step type
export type BookingStep =
  | "EVENT_TYPE"
  | "INTRO"
  | "DATE"
  | "QUESTIONNAIRE"
  | "PACKAGE"
  | "ADDON"
  | "SUMMARY"
  | "PAYMENT"
  | "CONFIRMATION";

// Event creation interface that matches backend requirements
export interface EventCreateData {
  client: number; // Current user ID
  event_type: number;
  name: string;
  status: "LEAD";
  start_date: string; // ISO string format
  end_date?: string;
  total_price?: number;
  event_products?: {
    product_option: number;
    quantity: number;
    final_price: number;
  }[];
  questionnaire_responses?: {
    field: number;
    value: string;
  }[];
  booking_flow_id?: number; // Optional booking flow ID for workflow assignment
}

// Payment creation interface
export interface PaymentCreateData {
  event: number;
  amount: number;
  payment_method: string;
  is_deposit: boolean;
}
