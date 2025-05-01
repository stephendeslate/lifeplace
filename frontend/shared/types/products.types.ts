// frontend/admin-crm/src/types/products.types.ts
import { EventType } from "./events.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Product option types
export type ProductType = "PRODUCT" | "PACKAGE";

export interface ProductOption {
  id: number;
  name: string;
  description: string;
  base_price: number;
  currency: string;
  tax_rate: number;
  event_type: number | EventType | null;
  type: ProductType;
  type_display: string;
  is_active: boolean;
  allow_multiple: boolean;
  has_excess_hours: boolean;
  included_hours: number | null;
  excess_hour_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductOptionResponse
  extends PaginationResponse<ProductOption> {}

export interface ProductOptionFormData {
  name: string;
  description: string;
  base_price: number;
  currency: string;
  tax_rate: number;
  event_type?: number | EventType | null;
  type: ProductType;
  is_active: boolean;
  allow_multiple: boolean;
  has_excess_hours: boolean;
  included_hours?: number | null;
  excess_hour_price?: number | null;
}

export interface ProductOptionFormErrors {
  name?: string;
  description?: string;
  base_price?: string;
  tax_rate?: string;
  event_type?: string;
  type?: string;
  included_hours?: string;
  excess_hour_price?: string;
}

// Discount types
export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Discount {
  id: number;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_type_display: string;
  value: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  is_valid_now: boolean;
  applicable_products: number[] | ProductOption[];
  applicable_products_count: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountResponse extends PaginationResponse<Discount> {}

export interface DiscountFormData {
  code: string;
  description: string;
  discount_type: DiscountType;
  value: number;
  is_active: boolean;
  valid_from: string;
  valid_until?: string | null;
  max_uses?: number | null;
  applicable_products: number[];
}

export interface DiscountFormErrors {
  code?: string;
  description?: string;
  discount_type?: string;
  value?: string;
  valid_from?: string;
  valid_until?: string;
  max_uses?: string;
  applicable_products?: string;
}
