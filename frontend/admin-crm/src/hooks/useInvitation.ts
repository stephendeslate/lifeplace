// frontend/admin-crm/src/hooks/useInvitation.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { invitationApi } from "../apis/invitation.api";
import {
  AcceptInvitationRequest,
  InvitationDetails,
} from "../types/invitation.types";
import { setTokens, setUser } from "../utils/storage";

export const useInvitation = (invitationId: string) => {
  // Query to fetch invitation details - explicit typing for data
  const {
    data: invitation,
    isLoading: isLoadingInvitation,
    error: invitationError,
    isError: isInvitationError,
  } = useQuery<InvitationDetails, Error>({
    queryKey: ["invitation", invitationId],
    queryFn: () => invitationApi.getInvitationById(invitationId),
    retry: false,
    // Don't refetch on window focus for invitation details
    refetchOnWindowFocus: false,
    // Only fetch if we have a valid ID
    enabled: !!invitationId && invitationId.length > 0,
    // In newer versions of react-query, use throwOnError instead of useErrorBoundary
    throwOnError: false,
  });

  // Mutation to accept invitation
  const acceptInvitationMutation = useMutation({
    mutationFn: (data: AcceptInvitationRequest) =>
      invitationApi.acceptInvitation(invitationId, data),
    onSuccess: (data) => {
      // Store the tokens and user data
      setTokens(data.tokens.access, data.tokens.refresh);
      setUser(data.user);
      toast.success("Account created successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to accept invitation. Please try again.";
      toast.error(errorMessage);
    },
  });

  return {
    // Ensure invitation is properly typed - this was likely the issue
    invitation: invitation as InvitationDetails | undefined,
    isLoadingInvitation,
    invitationError,
    isInvitationError,
    acceptInvitation: acceptInvitationMutation.mutate,
    isAccepting: acceptInvitationMutation.isPending,
    acceptError: acceptInvitationMutation.error,
    isAcceptError: acceptInvitationMutation.isError,
    isAcceptSuccess: acceptInvitationMutation.isSuccess,
  };
};

export default useInvitation;
