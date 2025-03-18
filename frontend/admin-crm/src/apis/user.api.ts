// frontend/admin-crm/src/apis/user.api.ts
import { User } from "../types/auth.types";
import api from "../utils/api";

interface CreateUserData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "CLIENT";
  profile?: {
    phone?: string;
    company?: string;
  };
}

interface InvitationData {
  email: string;
  first_name: string;
  last_name: string;
}

interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  invited_by: string;
  is_accepted: boolean;
  expires_at: string;
  created_at: string;
}

interface AcceptInvitationData {
  password: string;
  confirm_password: string;
}

interface AcceptInvitationResponse {
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
}

export const userApi = {
  /**
   * Get all users
   */
  getUsers: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await api.get("/users/", { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: number) => {
    const response = await api.get<User>(`/users/${userId}/`);
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (userData: CreateUserData) => {
    const response = await api.post<User>("/users/", userData);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (userId: number, userData: Partial<User>) => {
    const response = await api.put<User>(`/users/${userId}/`, userData);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: number) => {
    await api.delete(`/users/${userId}/`);
  },

  /**
   * Get all admin invitations
   */
  getInvitations: async () => {
    const response = await api.get<{ results: Invitation[] }>(
      "/users/invitations/"
    );
    return response.data;
  },

  /**
   * Create new admin invitation
   */
  createInvitation: async (invitationData: InvitationData) => {
    const response = await api.post<Invitation>(
      "/users/invitations/",
      invitationData
    );
    return response.data;
  },

  /**
   * Get invitation by ID
   */
  getInvitationById: async (invitationId: string) => {
    const response = await api.get<Invitation>(
      `/users/invitations/${invitationId}/`
    );
    return response.data;
  },

  /**
   * Accept invitation
   */
  acceptInvitation: async (
    invitationId: string,
    data: AcceptInvitationData
  ) => {
    const response = await api.post<AcceptInvitationResponse>(
      `/users/invitations/${invitationId}/accept/`,
      data
    );
    return response.data;
  },
};

export default userApi;
