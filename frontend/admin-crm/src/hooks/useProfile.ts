// frontend/admin-crm/src/hooks/useProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import authApi from "../apis/auth.api";
import { User } from "../types/auth.types";
import useAuth from "./useAuth";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser: updateAuthUser } = useAuth();

  // Get current user data
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getCurrentUser(),
  });

  // Update profile mutation with optimistic updates
  const updateProfileMutation = useMutation({
    mutationFn: (userData: Partial<User>) =>
      authApi.updateCurrentUser(userData),
    onMutate: async (newUserData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<User>(["profile"]);

      // Optimistically update to the new value
      if (previousProfile) {
        const updatedProfile = { ...previousProfile, ...newUserData };
        queryClient.setQueryData<User>(["profile"], updatedProfile);
      }

      // Return a context object with the previous value
      return { previousProfile };
    },
    onSuccess: (data) => {
      // Update the auth context with the new user data
      updateAuthUser(data);
      toast.success("Profile updated successfully");
    },
    onError: (err, newUserData, context) => {
      // If the mutation fails, use the context returned from onMutate to rollback
      if (context?.previousProfile) {
        queryClient.setQueryData<User>(["profile"], context.previousProfile);
      }
      toast.error("Failed to update profile");
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state is correct
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }) => authApi.changePassword(passwordData),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail || "Failed to change password";
      toast.error(message);
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      // Note: logout logic should be handled externally after this succeeds
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    deleteAccount: deleteAccountMutation.mutate,
    isDeleting: deleteAccountMutation.isPending,
  };
};
