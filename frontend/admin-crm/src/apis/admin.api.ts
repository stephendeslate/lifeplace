// frontend/admin-crm/src/apis/admin.api.ts
import {
  AdminInvitation,
  AdminInvitationRequest,
  AdminInvitationResponse,
  AdminUser,
  AdminUserResponse,
} from "../types/admin.types";
import api from "../utils/api";

export const adminApi = {
  /**
   * Get all admin users
   */
  getAdminUsers: async (
    page = 1,
    search?: string
  ): Promise<AdminUserResponse> => {
    const params = { page, role: "ADMIN" };
    if (search) {
      Object.assign(params, { search });
    }

    const response = await api.get<AdminUserResponse>("/users/", { params });
    return response.data;
  },

  /**
   * Get pending admin invitations
   */
  getAdminInvitations: async (page = 1): Promise<AdminInvitationResponse> => {
    const response = await api.get<AdminInvitationResponse>(
      "/users/invitations/",
      {
        params: { page },
      }
    );
    return response.data;
  },

  /**
   * Send admin invitation
   */
  sendAdminInvitation: async (
    data: AdminInvitationRequest
  ): Promise<AdminInvitation> => {
    const response = await api.post<AdminInvitation>(
      "/users/invitations/",
      data
    );
    return response.data;
  },

  /**
   * Delete admin invitation
   */
  deleteAdminInvitation: async (id: string): Promise<void> => {
    await api.delete(`/users/invitations/${id}/`);
  },

  /**
   * Get admin user by ID
   */
  getAdminUserById: async (id: number): Promise<AdminUser> => {
    const response = await api.get<AdminUser>(`/users/${id}/`);
    return response.data;
  },

  /**
   * Update admin user
   */
  updateAdminUser: async (
    id: number,
    userData: Partial<AdminUser>
  ): Promise<AdminUser> => {
    const response = await api.put<AdminUser>(`/users/${id}/`, userData);
    return response.data;
  },

  /**
   * Deactivate admin user
   */
  deactivateAdminUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/`);
  },
};

export default adminApi;
