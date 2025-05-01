// frontend/admin-crm/src/types/bookingflow.types.ts
import { EventType } from "./events.types";
import { ProductOption } from "./products.types";
import { Questionnaire } from "./questionnaires.types";

// Base booking flow interface
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

// Complete booking flow interface with all configurations
export interface BookingFlowDetail extends BookingFlow {
  intro_config?: IntroConfig;
  date_config?: DateConfig;
  questionnaire_config?: QuestionnaireConfig;
  package_config?: PackageConfig;
  addon_config?: AddonConfig;
  summary_config?: SummaryConfig;
  payment_config?: PaymentConfig;
  confirmation_config?: ConfirmationConfig;
}

// Form data interfaces
export interface BookingFlowFormData {
  name: string;
  description: string;
  event_type: number | null;
  is_active: boolean;
}

export interface BookingFlowFormErrors {
  name?: string;
  description?: string;
  event_type?: string;
  is_active?: string;
}
