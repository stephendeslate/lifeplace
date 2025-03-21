// frontend/admin-crm/src/hooks/useDiscounts.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { productsApi } from "../apis/products.api";
import { Discount, DiscountFormData } from "../types/products.types";

export const useDiscounts = (page = 1, search?: string) => {
  const queryClient = useQueryClient();

  // Query to fetch all discounts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["discounts", page, search],
    queryFn: () => productsApi.getDiscounts(page, undefined, undefined, search),
  });

  // Query to fetch valid discounts
  const { data: validDiscountsData, isLoading: isLoadingValidDiscounts } =
    useQuery({
      queryKey: ["discounts", "valid", page],
      queryFn: () => productsApi.getValidDiscounts(page),
    });

  // Mutation to create discount
  const createDiscountMutation = useMutation({
    mutationFn: (discountData: DiscountFormData) =>
      productsApi.createDiscount(discountData),
    onSuccess: (data) => {
      toast.success(`Discount "${data.code}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create discount";
      toast.error(errorMessage);
    },
  });

  // Mutation to update discount
  const updateDiscountMutation = useMutation({
    mutationFn: ({
      id,
      discountData,
    }: {
      id: number;
      discountData: Partial<DiscountFormData>;
    }) => productsApi.updateDiscount(id, discountData),
    onMutate: async ({ id, discountData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["discounts"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "discounts",
        page,
        search,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["discounts", page, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.map((discount: Discount) =>
            discount.id === id ? { ...discount, ...discountData } : discount
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(`Discount "${data.code}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["discounts", page, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update discount";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });

  // Mutation to delete discount
  const deleteDiscountMutation = useMutation({
    mutationFn: (id: number) => productsApi.deleteDiscount(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["discounts"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "discounts",
        page,
        search,
      ]);

      // Optimistically remove the discount
      queryClient.setQueryData(["discounts", page, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.filter(
            (discount: Discount) => discount.id !== id
          ),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Discount deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["discounts", page, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete discount";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });

  // Mutation to increment discount usage
  const incrementDiscountUsageMutation = useMutation({
    mutationFn: (id: number) => productsApi.incrementDiscountUsage(id),
    onSuccess: (data) => {
      toast.success(`Discount "${data.code}" usage incremented`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to increment discount usage";
      toast.error(errorMessage);
    },
  });

  return {
    // All discounts data
    discounts: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },

    // Valid discounts data
    validDiscounts: validDiscountsData?.results || [],
    totalValidDiscounts: validDiscountsData?.count || 0,
    isLoadingValidDiscounts,

    // Mutations
    createDiscount: createDiscountMutation.mutate,
    isCreating: createDiscountMutation.isPending,
    updateDiscount: updateDiscountMutation.mutate,
    isUpdating: updateDiscountMutation.isPending,
    deleteDiscount: deleteDiscountMutation.mutate,
    isDeleting: deleteDiscountMutation.isPending,
    incrementDiscountUsage: incrementDiscountUsageMutation.mutate,
    isIncrementing: incrementDiscountUsageMutation.isPending,
  };
};
