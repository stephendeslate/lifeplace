// frontend/admin-crm/src/hooks/useProducts.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { productsApi } from "../apis/products.api";
import {
  ProductOption,
  ProductOptionFormData,
  ProductType,
} from "../types/products.types";

export const useProducts = (page = 1, type?: ProductType, search?: string) => {
  const queryClient = useQueryClient();

  // Query to fetch product options
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", page, type, search],
    queryFn: () => productsApi.getProductOptions(page, type, undefined, search),
  });

  // Query to fetch packages only
  const { data: packagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ["products", "packages", page],
    queryFn: () => productsApi.getProductsByType("PACKAGE", page),
    enabled: !type, // Only fetch if not already filtering by type
  });

  // Query to fetch products only
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "products", page],
    queryFn: () => productsApi.getProductsByType("PRODUCT", page),
    enabled: !type, // Only fetch if not already filtering by type
  });

  // Mutation to create product
  const createProductMutation = useMutation({
    mutationFn: (productData: ProductOptionFormData) =>
      productsApi.createProduct(productData),
    onSuccess: (data) => {
      toast.success(`${data.type_display} "${data.name}" created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any, variables) => {
      const errorMessage =
        error.response?.data?.detail ||
        `Failed to create ${variables.type.toLowerCase()}`;
      toast.error(errorMessage);
    },
  });

  // Mutation to update product
  const updateProductMutation = useMutation({
    mutationFn: ({
      id,
      productData,
    }: {
      id: number;
      productData: Partial<ProductOptionFormData>;
    }) => productsApi.updateProduct(id, productData),
    onMutate: async ({ id, productData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "products",
        page,
        type,
        search,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["products", page, type, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.map((product: ProductOption) =>
            product.id === id ? { ...product, ...productData } : product
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(`${data.type_display} "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["products", page, type, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update product";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Mutation to delete product
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productsApi.deleteProduct(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData([
        "products",
        page,
        type,
        search,
      ]);

      // Optimistically remove the product
      queryClient.setQueryData(["products", page, type, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.filter(
            (product: ProductOption) => product.id !== id
          ),
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
    },
    onError: (error: any, id, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["products", page, type, search],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to delete product";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    // All products data
    products: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },

    // Packages data
    packages: packagesData?.results || [],
    totalPackages: packagesData?.count || 0,
    isLoadingPackages,

    // Products data
    productItems: productsData?.results || [],
    totalProducts: productsData?.count || 0,
    isLoadingProducts,

    // Mutations
    createProduct: createProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutate,
    isUpdating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutate,
    isDeleting: deleteProductMutation.isPending,
  };
};
