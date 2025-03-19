// frontend/admin-crm/src/hooks/useAdminInvitations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminApi } from "../apis/admin.api";
import { AdminInvitationRequest } from "../types/admin.types";

export const useAdminInvitations = (page = 1) => {
  const queryClient = useQueryClient();

  // Query to fetch admin invitations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminInvitations", page],
    queryFn: () => adminApi.getAdminInvitations(page),
  });

  // Mutation to send admin invitation
  const sendInvitationMutation = useMutation({
    mutationFn: (invitationData: AdminInvitationRequest) =>
      adminApi.sendAdminInvitation(invitationData),
    onSuccess: (data) => {
      toast.success(`Invitation sent to ${data.email}`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["adminInvitations"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to send invitation";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete admin invitation
  const deleteInvitationMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminInvitation(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["adminInvitations"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["adminInvitations", page]);

      // Optimistically update the data
      queryClient.setQueryData(["adminInvitations", page], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.filter(
            (invitation: any) => invitation.id !== id
          ),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Invitation deleted successfully");
    },
    onError: (error, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["adminInvitations", page],
          context.previousData
        );
      }
      toast.error("Failed to delete invitation");
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["adminInvitations"] });
    },
  });

  return {
    invitations: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    sendInvitation: sendInvitationMutation.mutate,
    isSending: sendInvitationMutation.isPending,
    deleteInvitation: deleteInvitationMutation.mutate,
    isDeleting: deleteInvitationMutation.isPending,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
  };
};
