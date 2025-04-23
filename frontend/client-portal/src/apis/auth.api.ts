// frontend/client-portal/src/apis/auth.api.ts
import {
  AcceptInvitationData,
  AcceptInvitationResponse,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
} from "../types/auth.types";
import api from "../utils/api";

export const authApi = {
  /**
   * Login with credentials
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      "/users/login/",
      credentials
    );
    return response.data;
  },

  /**
   * Register a new client account
   */
  register: async (
    userData: RegisterCredentials
  ): Promise<RegisterResponse> => {
    // Set role to CLIENT
    const data = {
      ...userData,
      role: "CLIENT",
    };

    const response = await api.post<RegisterResponse>("/users/register/", data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/users/me/");
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>("/users/me/", userData);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> => {
    const response = await api.post("/users/me/change-password/", passwordData);
    return response.data;
  },

  /**
   * Accept an invitation
   */
  acceptInvitation: async (
    invitationId: string,
    data: AcceptInvitationData
  ): Promise<AcceptInvitationResponse> => {
    const response = await api.post<AcceptInvitationResponse>(
      `/users/invitations/${invitationId}/accept/`,
      data
    );
    return response.data;
  },

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<void> => {
    return api.delete("/users/me/");
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/users/token/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export default authApi;
