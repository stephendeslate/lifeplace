// frontend/admin-crm/src/apis/products.api.ts
import {
  Discount,
  DiscountFormData,
  DiscountResponse,
  ProductOption,
  ProductOptionFormData,
  ProductOptionResponse,
} from "../types/products.types";
import api from "../utils/api";

export const productsApi = {
  /**
   * Get all product options with optional filtering
   */
  getProductOptions: async (
    page = 1,
    type?: string,
    isActive?: boolean,
    search?: string
  ): Promise<ProductOptionResponse> => {
    const params: Record<string, any> = { page };

    if (type) {
      params.type = type;
    }

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    if (search) {
      params.search = search;
    }

    const response = await api.get<ProductOptionResponse>(
      "/products/products/",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get product options by type (packages or products)
   */
  getProductsByType: async (
    type: "PACKAGE" | "PRODUCT",
    page = 1
  ): Promise<ProductOptionResponse> => {
    const endpoint = type === "PACKAGE" ? "packages" : "products";
    const response = await api.get<ProductOptionResponse>(
      `/products/products/${endpoint}/`,
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get active product options
   */
  getActiveProducts: async (page = 1): Promise<ProductOptionResponse> => {
    const response = await api.get<ProductOptionResponse>(
      "/products/products/active/",
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get a specific product option by ID
   */
  getProductById: async (id: number): Promise<ProductOption> => {
    const response = await api.get<ProductOption>(`/products/products/${id}/`);
    return response.data;
  },

  /**
   * Create a new product option
   */
  createProduct: async (
    productData: ProductOptionFormData
  ): Promise<ProductOption> => {
    const response = await api.post<ProductOption>(
      "/products/products/",
      productData
    );
    return response.data;
  },

  /**
   * Update an existing product option
   */
  updateProduct: async (
    id: number,
    productData: Partial<ProductOptionFormData>
  ): Promise<ProductOption> => {
    const response = await api.put<ProductOption>(
      `/products/products/${id}/`,
      productData
    );
    return response.data;
  },

  /**
   * Delete a product option
   */
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/products/${id}/`);
  },

  /**
   * Get all discounts with optional filtering
   */
  getDiscounts: async (
    page = 1,
    isActive?: boolean,
    isValid?: boolean,
    search?: string
  ): Promise<DiscountResponse> => {
    const params: Record<string, any> = { page };

    if (isActive !== undefined) {
      params.is_active = isActive;
    }

    if (isValid !== undefined) {
      params.is_valid = isValid;
    }

    if (search) {
      params.search = search;
    }

    const response = await api.get<DiscountResponse>("/products/discounts/", {
      params,
    });
    return response.data;
  },

  /**
   * Get currently valid discounts
   */
  getValidDiscounts: async (page = 1): Promise<DiscountResponse> => {
    const response = await api.get<DiscountResponse>(
      "/products/discounts/valid/",
      { params: { page } }
    );
    return response.data;
  },

  /**
   * Get a specific discount by ID
   */
  getDiscountById: async (id: number): Promise<Discount> => {
    const response = await api.get<Discount>(`/products/discounts/${id}/`);
    return response.data;
  },

  /**
   * Create a new discount
   */
  createDiscount: async (discountData: DiscountFormData): Promise<Discount> => {
    const response = await api.post<Discount>(
      "/products/discounts/",
      discountData
    );
    return response.data;
  },

  /**
   * Update an existing discount
   */
  updateDiscount: async (
    id: number,
    discountData: Partial<DiscountFormData>
  ): Promise<Discount> => {
    const response = await api.put<Discount>(
      `/products/discounts/${id}/`,
      discountData
    );
    return response.data;
  },

  /**
   * Delete a discount
   */
  deleteDiscount: async (id: number): Promise<void> => {
    await api.delete(`/products/discounts/${id}/`);
  },

  /**
   * Increment the usage count of a discount
   */
  incrementDiscountUsage: async (id: number): Promise<Discount> => {
    const response = await api.post<Discount>(
      `/products/discounts/${id}/increment_usage/`
    );
    return response.data;
  },
};

export default productsApi;
