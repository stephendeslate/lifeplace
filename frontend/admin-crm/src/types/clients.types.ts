// frontend/admin-crm/src/types/clients.types.ts
import { User } from "./auth.types";
import { Event } from "./events.types";

// Common pagination response interface
export interface PaginationResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Client Profile
export interface ClientProfile {
  phone?: string;
  company?: string;
}

// Client Account Status
export enum ClientAccountStatus {
  ACTIVE = "ACTIVE", // Has account and is active
  INACTIVE = "INACTIVE", // Has account but is inactive
  NO_ACCOUNT = "NO_ACCOUNT", // No account yet (imported client)
}

// Client (extends User type)
export interface Client extends User {
  profile?: ClientProfile;
  events?: Event[];
  account_status?: ClientAccountStatus; // Computed property
  has_account?: boolean; // Added this field to use for account status check
}

export interface ClientResponse extends PaginationResponse<Client> {}

// Client creation/update data
export interface ClientFormData {
  email: string;
  first_name: string;
  last_name: string;
  profile?: ClientProfile;
  password?: string;
  is_active: boolean;
  send_invitation?: boolean;
}

export interface ClientFormErrors {
  email?: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    phone?: string;
    company?: string;
  };
  password?: string;
  is_active?: string; // Added to fix TypeScript error
  send_invitation?: string; // Added for completeness
}

// Client filter options
export interface ClientFilters {
  search?: string;
  is_active?: boolean;
  has_account?: boolean;
}

// Client invitation
export interface ClientInvitation {
  id: string;
  client: string;
  client_name: string;
  invited_by: string;
  is_accepted: boolean;
  expires_at: string;
  created_at: string;
}

export interface ClientInvitationRequest {
  client_id: number;
}

export interface AcceptClientInvitationRequest {
  password: string;
  confirm_password: string;
}

export interface AcceptClientInvitationResponse {
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: Client;
}
