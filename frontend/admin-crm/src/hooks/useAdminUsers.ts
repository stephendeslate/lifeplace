// frontend/admin-crm/src/hooks/useAdminUsers.ts
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../apis/admin.api";

export const useAdminUsers = (page = 1, search?: string) => {
  // Query to fetch admin users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsers", page, search],
    queryFn: () => adminApi.getAdminUsers(page, search),
  });

  return {
    adminUsers: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
  };
};
