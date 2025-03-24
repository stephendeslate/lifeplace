// frontend/admin-crm/src/types/events.types.ts

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
