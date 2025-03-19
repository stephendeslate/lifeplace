// frontend/admin-crm/src/types/invitation.types.ts
import { User } from "./auth.types";

export interface InvitationDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  invited_by: string;
  is_accepted: boolean;
  expires_at: string;
  created_at: string;
}

export interface AcceptInvitationRequest {
  password: string;
  confirm_password: string;
}

export interface AcceptInvitationResponse {
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
}
