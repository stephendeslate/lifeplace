// frontend/admin-crm/src/apis/invitation.api.ts
import axios from "axios";
import {
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  InvitationDetails,
} from "../types/invitation.types";

// Create a separate axios instance for invitation requests
// This doesn't use the authenticated API instance since these requests
// don't require authentication
const invitationAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const invitationApi = {
  /**
   * Get invitation details by ID
   */
  getInvitationById: async (
    invitationId: string
  ): Promise<InvitationDetails> => {
    const response = await invitationAxios.get<InvitationDetails>(
      `/users/invitations/${invitationId}/`
    );
    return response.data;
  },

  /**
   * Accept an invitation
   */
  acceptInvitation: async (
    invitationId: string,
    data: AcceptInvitationRequest
  ): Promise<AcceptInvitationResponse> => {
    const response = await invitationAxios.post<AcceptInvitationResponse>(
      `/users/invitations/${invitationId}/accept/`,
      data
    );
    return response.data;
  },
};

export default invitationApi;
