// frontend/admin-crm/src/apis/clients.api.ts
import axios from "axios";
import {
  AcceptClientInvitationRequest,
  AcceptClientInvitationResponse,
  Client,
  ClientFormData,
  ClientInvitation,
  ClientInvitationRequest,
  ClientResponse,
} from "../types/clients.types";
import { Event } from "../types/events.types";
import api from "../utils/api";

export const clientsApi = {
  /**
   * Get all clients with optional filtering
   */
  getClients: async (
    page = 1,
    search?: string,
    isActive?: boolean,
    hasAccount?: boolean
  ): Promise<ClientResponse> => {
    const params: Record<string, any> = { page };

    if (search) {
      params.search = search;
    }

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    if (hasAccount !== undefined) {
      params.has_account = hasAccount;
    }

    const response = await api.get<ClientResponse>("/clients/", { params });
    return response.data;
  },

  /**
   * Get active clients
   */
  getActiveClients: async (page = 1): Promise<ClientResponse> => {
    const response = await api.get<ClientResponse>("/clients/active/", {
      params: { page },
    });
    return response.data;
  },

  /**
   * Get client by ID
   */
  getClientById: async (id: number): Promise<Client> => {
    const response = await api.get<Client>(`/clients/${id}/`);
    return response.data;
  },

  /**
   * Create a new client
   */
  createClient: async (clientData: ClientFormData): Promise<Client> => {
    // Remove send_invitation flag as it's not expected by the API
    const { send_invitation, ...dataToSend } = clientData;

    const response = await api.post<Client>("/clients/", dataToSend);

    // If send_invitation is true, send invitation after creating client
    if (send_invitation && response.data.id) {
      try {
        await clientsApi.sendClientInvitation(response.data.id);
      } catch (error) {
        console.error("Failed to send invitation:", error);
        // Continue even if invitation fails - client was created
      }
    }

    return response.data;
  },

  /**
   * Update an existing client
   */
  updateClient: async (
    id: number,
    clientData: Partial<ClientFormData>
  ): Promise<Client> => {
    // Remove send_invitation flag if present
    const { send_invitation, ...dataToSend } = clientData;

    const response = await api.patch<Client>(`/clients/${id}/`, dataToSend);
    return response.data;
  },

  /**
   * Deactivate a client
   */
  deactivateClient: async (id: number): Promise<void> => {
    await api.delete(`/clients/${id}/`);
  },

  /**
   * Get client events
   */
  getClientEvents: async (id: number): Promise<Event[]> => {
    const response = await api.get<Event[]>(`/clients/${id}/events/`);
    return response.data;
  },

  /**
   * Send invitation to client
   */
  sendClientInvitation: async (clientId: number): Promise<ClientInvitation> => {
    const data: ClientInvitationRequest = { client_id: clientId };
    const response = await api.post<ClientInvitation>(
      `/clients/${clientId}/send_invitation/`,
      data
    );
    return response.data;
  },

  /**
   * Get invitation details
   */
  getInvitationById: async (
    invitationId: string
  ): Promise<ClientInvitation> => {
    // Use public API endpoint - no auth required
    const baseURL =
      process.env.REACT_APP_API_URL || "http://localhost:8000/api";
    const response = await axios.get<ClientInvitation>(
      `${baseURL}/clients/invitations/${invitationId}/`
    );
    return response.data;
  },

  /**
   * Accept invitation
   */
  acceptInvitation: async (
    invitationId: string,
    data: AcceptClientInvitationRequest
  ): Promise<AcceptClientInvitationResponse> => {
    // Use public API endpoint - no auth required
    const baseURL =
      process.env.REACT_APP_API_URL || "http://localhost:8000/api";
    const response = await axios.post<AcceptClientInvitationResponse>(
      `${baseURL}/clients/invitations/${invitationId}/accept/`,
      data
    );
    return response.data;
  },
};

export default clientsApi;
