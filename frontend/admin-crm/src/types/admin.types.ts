// frontend/admin-crm/src/types/admin.types.ts
import { User } from "./auth.types";

export interface AdminInvitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  invited_by: string;
  is_accepted: boolean;
  expires_at: string;
  created_at: string;
}

export interface AdminInvitationRequest {
  email: string;
  first_name: string;
  last_name: string;
}

export interface AdminUser extends User {
  // Admin-specific fields can be added here if needed
}

export interface Pagination {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export interface AdminUserResponse extends Pagination {
  results: AdminUser[];
}

export interface AdminInvitationResponse extends Pagination {
  results: AdminInvitation[];
}
