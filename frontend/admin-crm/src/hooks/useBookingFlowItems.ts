// frontend/admin-crm/src/hooks/useBookingFlowItems.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { bookingFlowApi } from "../apis/bookingflow.api";
import {
  BookingFlowItem,
  BookingFlowItemFormData,
  BookingFlowItemType,
  ReorderItemsRequest,
} from "../types/bookingflow.types";

export const useBookingFlowItems = (
  configId?: number,
  itemType?: BookingFlowItemType
) => {
  const queryClient = useQueryClient();

  // Query to fetch booking flow items
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookingFlowItems", configId, itemType],
    queryFn: () =>
      configId
        ? bookingFlowApi.getItems(configId, itemType)
        : Promise.reject("No config ID"),
    enabled: !!configId,
  });

  // Mutation to create item
  const createItemMutation = useMutation({
    mutationFn: (itemData: BookingFlowItemFormData) =>
      bookingFlowApi.createItem(itemData),
    onSuccess: (data) => {
      const itemTypeLabel =
        data.type === "QUESTIONNAIRE" ? "Questionnaire" : "Product";
      toast.success(`${itemTypeLabel} added to booking flow successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({
        queryKey: ["bookingFlowItems", configId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookingFlowConfig", configId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to add item to booking flow";
      toast.error(errorMessage);
    },
  });

  // Mutation to update item
  const updateItemMutation = useMutation({
    mutationFn: ({
      id,
      itemData,
    }: {
      id: number;
      itemData: Partial<BookingFlowItemFormData>;
    }) => bookingFlowApi.updateItem(id, itemData),
    onMutate: async ({ id, itemData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["bookingFlowItems", configId],
      });
      await queryClient.cancelQueries({ queryKey: ["bookingFlowItem", id] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData([
        "bookingFlowItems",
        configId,
        itemType,
      ]);
      const previousItem = queryClient.getQueryData(["bookingFlowItem", id]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["bookingFlowItems", configId, itemType],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.map((item: BookingFlowItem) =>
              item.id === id ? { ...item, ...itemData } : item
            ),
          };
        }
      );

      // Optimistically update the item detail if available
      if (previousItem) {
        queryClient.setQueryData(["bookingFlowItem", id], {
          ...previousItem,
          ...itemData,
        });
      }

      return { previousItems, previousItem };
    },
    onSuccess: (data) => {
      const itemTypeLabel =
        data.type === "QUESTIONNAIRE" ? "Questionnaire" : "Product";
      toast.success(`${itemTypeLabel} updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousItems) {
        queryClient.setQueryData(
          ["bookingFlowItems", configId, itemType],
          context.previousItems
        );
      }
      if (context?.previousItem) {
        queryClient.setQueryData(
          ["bookingFlowItem", variables.id],
          context.previousItem
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update item";
      toast.error(errorMessage);
    },
    onSettled: (data) => {
      // Refetch to ensure data consistency
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["bookingFlowItems", configId],
        });
        queryClient.invalidateQueries({
          queryKey: ["bookingFlowItem", data.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["bookingFlowConfig", configId],
        });
      }
    },
  });

  // Mutation to delete item
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => bookingFlowApi.deleteItem(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["bookingFlowItems", configId],
      });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData([
        "bookingFlowItems",
        configId,
        itemType,
      ]);

      // Optimistically remove the item
      queryClient.setQueryData(
        ["bookingFlowItems", configId, itemType],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            results: old.results.filter(
              (item: BookingFlowItem) => item.id !== id
            ),
          };
        }
      );

      // Remove the item detail
      queryClient.removeQueries({ queryKey: ["bookingFlowItem", id] });

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("Item removed from booking flow successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousItems) {
        queryClient.setQueryData(
          ["bookingFlowItems", configId, itemType],
          context.previousItems
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to remove item";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["bookingFlowItems", configId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookingFlowConfig", configId],
      });
    },
  });

  // Mutation to reorder items
  const reorderItemsMutation = useMutation({
    mutationFn: (reorderData: ReorderItemsRequest) =>
      bookingFlowApi.reorderItems(reorderData),
    onMutate: async (reorderData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["bookingFlowItems", configId],
      });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData([
        "bookingFlowItems",
        configId,
        reorderData.item_type,
      ]);

      // Optimistically update the order
      queryClient.setQueryData(
        ["bookingFlowItems", configId, reorderData.item_type],
        (old: any) => {
          if (!old) return old;

          // Create a sorted version of the results based on new order
          const updatedResults = [...old.results].sort((a, b) => {
            const aOrder = reorderData.order_mapping[a.id] || a.order;
            const bOrder = reorderData.order_mapping[b.id] || b.order;
            return aOrder - bOrder;
          });

          // Update the order property for each item
          updatedResults.forEach((item) => {
            if (reorderData.order_mapping[item.id]) {
              item.order = reorderData.order_mapping[item.id];
            }
          });

          return {
            ...old,
            results: updatedResults,
          };
        }
      );

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("Items reordered successfully");
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousItems) {
        queryClient.setQueryData(
          ["bookingFlowItems", configId, variables.item_type],
          context.previousItems
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to reorder items";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["bookingFlowItems", configId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookingFlowConfig", configId],
      });
    },
  });

  return {
    items: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    createItem: createItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    updateItem: updateItemMutation.mutate,
    isUpdating: updateItemMutation.isPending,
    deleteItem: deleteItemMutation.mutate,
    isDeleting: deleteItemMutation.isPending,
    reorderItems: reorderItemsMutation.mutate,
    isReordering: reorderItemsMutation.isPending,
  };
};

// Hook to get a single booking flow item by ID
export const useBookingFlowItem = (id?: number) => {
  // Query to fetch a specific item
  const {
    data: item,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookingFlowItem", id],
    queryFn: () => (id ? bookingFlowApi.getItemById(id) : null),
    enabled: !!id,
  });

  return {
    item,
    isLoading,
    error,
    refetch,
  };
};
