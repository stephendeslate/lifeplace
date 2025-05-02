// frontend/client-portal/src/types/products.types.ts
import { EventType } from "./events.types";

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
