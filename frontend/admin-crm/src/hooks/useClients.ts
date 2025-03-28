// frontend/admin-crm/src/hooks/useClients.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { clientsApi } from "../apis/clients.api";
import {
  AcceptClientInvitationRequest,
  Client,
  ClientAccountStatus,
  ClientFilters,
  ClientFormData,
} from "../types/clients.types";

export const useClients = (page = 1, filters?: ClientFilters) => {
  const queryClient = useQueryClient();

  // Extract filter values
  const search = filters?.search;
  const isActive = filters?.is_active;
  const hasAccount = filters?.has_account;

  // Query to fetch clients
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["clients", page, search, isActive, hasAccount],
    queryFn: () => clientsApi.getClients(page, search, isActive, hasAccount),
  });

  // Mutation to create client
  const createClientMutation = useMutation({
    mutationFn: (clientData: ClientFormData) =>
      clientsApi.createClient(clientData),
    onSuccess: (data) => {
      toast.success(
        `Client ${data.first_name} ${data.last_name} created successfully`
      );
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create client";
      toast.error(errorMessage);
    },
  });

  // Mutation to update client
  const updateClientMutation = useMutation({
    mutationFn: ({
      id,
      clientData,
    }: {
      id: number;
      clientData: Partial<ClientFormData>;
    }) => clientsApi.updateClient(id, clientData),
    onMutate: async ({ id, clientData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      await queryClient.cancelQueries({ queryKey: ["client", id] });

      // Snapshot the previous values
      const previousClients = queryClient.getQueryData([
        "clients",
        page,
        search,
        isActive,
      ]);
      const previousClient = queryClient.getQueryData(["client", id]);

      // Optimistically update the client in the list
      queryClient.setQueryData(
        ["clients", page, search, isActive],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((client: Client) =>
              client.id === id ? { ...client, ...clientData } : client
            ),
          };
        }
      );

      // Optimistically update the client detail
      if (previousClient) {
        queryClient.setQueryData(["client", id], {
          ...previousClient,
          ...clientData,
          profile: {
            ...((previousClient as Client).profile || {}),
            ...(clientData.profile || {}),
          },
        });
      }

      return { previousClients, previousClient };
    },
    onSuccess: (data) => {
      toast.success(
        `Client ${data.first_name} ${data.last_name} updated successfully`
      );
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousClients) {
        queryClient.setQueryData(
          ["clients", page, search, isActive],
          context.previousClients
        );
      }
      if (context?.previousClient) {
        queryClient.setQueryData(
          ["client", variables.id],
          context.previousClient
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update client";
      toast.error(errorMessage);
    },
    onSettled: (data) => {
      // Refetch to ensure data consistency
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({ queryKey: ["client", data.id] });
      }
    },
  });

  // Mutation to deactivate client
  const deactivateClientMutation = useMutation({
    mutationFn: (id: number) => clientsApi.deactivateClient(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      await queryClient.cancelQueries({ queryKey: ["client", id] });

      // Snapshot the previous values
      const previousClients = queryClient.getQueryData([
        "clients",
        page,
        search,
        isActive,
      ]);
      const previousClient = queryClient.getQueryData(["client", id]);

      // Optimistically update to set is_active to false
      queryClient.setQueryData(
        ["clients", page, search, isActive],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((client: Client) =>
              client.id === id ? { ...client, is_active: false } : client
            ),
          };
        }
      );

      if (previousClient) {
        queryClient.setQueryData(["client", id], {
          ...previousClient,
          is_active: false,
        });
      }

      return { previousClients, previousClient };
    },
    onSuccess: () => {
      toast.success("Client deactivated successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousClients) {
        queryClient.setQueryData(
          ["clients", page, search, isActive],
          context.previousClients
        );
      }
      if (context?.previousClient) {
        queryClient.setQueryData(["client", id], context.previousClient);
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to deactivate client";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  // Mutation to send client invitation
  const sendInvitationMutation = useMutation({
    mutationFn: (clientId: number) => clientsApi.sendClientInvitation(clientId),
    onSuccess: (data) => {
      toast.success(`Invitation sent to ${data.client_name}`);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to send invitation";
      toast.error(errorMessage);
    },
  });

  return {
    clients: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createClient: createClientMutation.mutate,
    isCreating: createClientMutation.isPending,
    updateClient: updateClientMutation.mutate,
    isUpdating: updateClientMutation.isPending,
    deactivateClient: deactivateClientMutation.mutate,
    isDeactivating: deactivateClientMutation.isPending,
    sendInvitation: sendInvitationMutation.mutate,
    isSendingInvitation: sendInvitationMutation.isPending,
  };
};

// Helper to determine client account status
export const getClientAccountStatus = (client: Client): ClientAccountStatus => {
  if (!client) return ClientAccountStatus.NO_ACCOUNT;

  // Safe way to check for password existence
  const hasPassword = client.password !== undefined && client.password !== "";

  if (!hasPassword) {
    return ClientAccountStatus.NO_ACCOUNT;
  } else if (client.is_active) {
    return ClientAccountStatus.ACTIVE;
  } else {
    return ClientAccountStatus.INACTIVE;
  }
};

export const useClientInvitation = (invitationId: string) => {
  // Query to fetch invitation details
  const {
    data: invitation,
    isLoading: isLoadingInvitation,
    error: invitationError,
  } = useQuery({
    queryKey: ["clientInvitation", invitationId],
    queryFn: () => clientsApi.getInvitationById(invitationId),
    enabled: !!invitationId,
  });

  // Mutation to accept invitation
  const acceptInvitationMutation = useMutation({
    mutationFn: (data: AcceptClientInvitationRequest) =>
      clientsApi.acceptInvitation(invitationId, data),
    onSuccess: (data) => {
      toast.success("Account activated successfully");
      // Store tokens and user data in localStorage
      if (data.tokens) {
        localStorage.setItem("access_token", data.tokens.access);
        localStorage.setItem("refresh_token", data.tokens.refresh);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to activate account";
      toast.error(errorMessage);
    },
  });

  return {
    invitation,
    isLoadingInvitation,
    invitationError,
    acceptInvitation: acceptInvitationMutation.mutate,
    isAccepting: acceptInvitationMutation.isPending,
    isAcceptSuccess: acceptInvitationMutation.isSuccess,
  };
};

export const useClient = (id: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific client
  const {
    data: client,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsApi.getClientById(id),
    enabled: !!id,
  });

  // Query to fetch client events
  const {
    data: events,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ["client", id, "events"],
    queryFn: () => clientsApi.getClientEvents(id),
    enabled: !!id,
  });

  // Mutation to update client
  const updateClientMutation = useMutation({
    mutationFn: (clientData: Partial<ClientFormData>) =>
      clientsApi.updateClient(id, clientData),
    onSuccess: (data) => {
      toast.success(
        `Client ${data.first_name} ${data.last_name} updated successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update client";
      toast.error(errorMessage);
    },
  });

  return {
    client,
    isLoading,
    error,
    refetch,
    events,
    isLoadingEvents,
    refetchEvents,
    updateClient: updateClientMutation.mutate,
    isUpdating: updateClientMutation.isPending,
  };
};
