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

// Booking Flow Config
export interface BookingFlowConfig {
  id: number;
  name: string;
  event_type: number | EventType | null;
  event_type_details?: EventType;
  is_active: boolean;
  items?: BookingFlowItem[];
  items_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BookingFlowConfigResponse
  extends PaginationResponse<BookingFlowConfig> {}

// Booking Flow Item
export type BookingFlowItemType = "QUESTIONNAIRE" | "PRODUCT";

export interface BookingFlowItem {
  id: number;
  config: number | BookingFlowConfig;
  type: BookingFlowItemType;
  questionnaire: number | null;
  product: number | null;
  questionnaire_details?: Questionnaire;
  product_details?: ProductOption;
  order: number;
  is_visible: boolean;
  is_required: boolean;
  dependency_item: number | null;
  dependency_value: any | null;
  created_at: string;
  updated_at: string;
}

export interface BookingFlowItemResponse
  extends PaginationResponse<BookingFlowItem> {}

// Form Data Types
export interface BookingFlowConfigFormData {
  name: string;
  event_type: number | null;
  is_active: boolean;
}

export interface BookingFlowItemFormData {
  config: number;
  type: BookingFlowItemType;
  questionnaire?: number | null;
  product?: number | null;
  order?: number;
  is_visible: boolean;
  is_required: boolean;
  dependency_item?: number | null;
  dependency_value?: any | null;
}

// Form Error Types
export interface BookingFlowConfigFormErrors {
  name?: string;
  event_type?: string;
}

export interface BookingFlowItemFormErrors {
  type?: string;
  questionnaire?: string;
  product?: string;
  order?: string;
  dependency_item?: string;
  dependency_value?: string;
}

// Reorder Request
export interface ReorderItemsRequest {
  config_id: number;
  item_type: BookingFlowItemType;
  order_mapping: Record<string, number>;
}
