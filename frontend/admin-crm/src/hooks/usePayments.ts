// frontend/admin-crm/src/hooks/usePayments.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { paymentsApi } from "../apis/payments.api";
import {
  CreatePaymentFromInstallmentRequest,
  Invoice,
  InvoiceFormData,
  Payment,
  PaymentFilters,
  PaymentFormData,
  PaymentGateway,
  PaymentGatewayFormData,
  PaymentMethodFormData,
  PaymentPlanFormData,
  ProcessPaymentRequest,
  RefundRequest,
  TaxRateFormData,
} from "../types/payments.types";

export const usePayments = (page = 1, filters?: PaymentFilters) => {
  const queryClient = useQueryClient();

  // Query to fetch payments with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["payments", page, filters],
    queryFn: () => paymentsApi.getPayments(page, filters),
  });

  // Mutation to create payment
  const createPaymentMutation = useMutation({
    mutationFn: (paymentData: PaymentFormData) =>
      paymentsApi.createPayment(paymentData),
    onSuccess: (data) => {
      toast.success(`Payment ${data.payment_number} created successfully`);
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create payment";
      toast.error(errorMessage);
    },
  });

  // Mutation to update payment
  const updatePaymentMutation = useMutation({
    mutationFn: ({
      id,
      paymentData,
    }: {
      id: number;
      paymentData: Partial<PaymentFormData>;
    }) => paymentsApi.updatePayment(id, paymentData),
    onMutate: async ({ id, paymentData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["payments"] });
      await queryClient.cancelQueries({ queryKey: ["payment", id] });

      // Snapshot the previous values
      const previousPayments = queryClient.getQueryData([
        "payments",
        page,
        filters,
      ]);
      const previousPayment = queryClient.getQueryData(["payment", id]);

      // Optimistically update the payment in the list
      queryClient.setQueryData(["payments", page, filters], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.map((payment: Payment) =>
            payment.id === id ? { ...payment, ...paymentData } : payment
          ),
        };
      });

      // Optimistically update the payment detail
      if (previousPayment) {
        queryClient.setQueryData(["payment", id], {
          ...previousPayment,
          ...paymentData,
        });
      }

      return { previousPayments, previousPayment };
    },
    onSuccess: (data) => {
      toast.success(`Payment ${data.payment_number} updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousPayments) {
        queryClient.setQueryData(
          ["payments", page, filters],
          context.previousPayments
        );
      }
      if (context?.previousPayment) {
        queryClient.setQueryData(
          ["payment", variables.id],
          context.previousPayment
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update payment";
      toast.error(errorMessage);
    },
    onSettled: (data) => {
      // Refetch to ensure data consistency
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["payment", data.id] });
      }
    },
  });

  // Mutation to process payment
  const processPaymentMutation = useMutation({
    mutationFn: ({
      id,
      processData,
    }: {
      id: number;
      processData: ProcessPaymentRequest;
    }) => paymentsApi.processPayment(id, processData),
    onSuccess: () => {
      toast.success("Payment processed successfully");
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to process payment";
      toast.error(errorMessage);
    },
  });

  // Mutation to create refund
  const createRefundMutation = useMutation({
    mutationFn: ({
      paymentId,
      refundData,
    }: {
      paymentId: number;
      refundData: RefundRequest;
    }) => paymentsApi.createRefund(paymentId, refundData),
    onSuccess: () => {
      toast.success("Refund created successfully");
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create refund";
      toast.error(errorMessage);
    },
  });

  return {
    payments: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createPayment: createPaymentMutation.mutate,
    isCreating: createPaymentMutation.isPending,
    updatePayment: updatePaymentMutation.mutate,
    isUpdating: updatePaymentMutation.isPending,
    processPayment: processPaymentMutation.mutate,
    isProcessing: processPaymentMutation.isPending,
    createRefund: createRefundMutation.mutate,
    isCreatingRefund: createRefundMutation.isPending,
  };
};

// Hook to fetch and manage a single payment
export const usePayment = (id: number) => {
  const queryClient = useQueryClient();

  // Query to fetch a specific payment
  const {
    data: payment,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentsApi.getPaymentById(id),
    enabled: !!id,
  });

  // Mutation to update payment
  const updatePaymentMutation = useMutation({
    mutationFn: (paymentData: Partial<PaymentFormData>) =>
      paymentsApi.updatePayment(id, paymentData),
    onSuccess: (data) => {
      toast.success(`Payment ${data.payment_number} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update payment";
      toast.error(errorMessage);
    },
  });

  // Mutation to process payment
  const processPaymentMutation = useMutation({
    mutationFn: (processData: ProcessPaymentRequest) =>
      paymentsApi.processPayment(id, processData),
    onSuccess: () => {
      toast.success("Payment processed successfully");
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to process payment";
      toast.error(errorMessage);
    },
  });

  // Mutation to create refund
  const createRefundMutation = useMutation({
    mutationFn: (refundData: RefundRequest) =>
      paymentsApi.createRefund(id, refundData),
    onSuccess: () => {
      toast.success("Refund created successfully");
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create refund";
      toast.error(errorMessage);
    },
  });

  return {
    payment,
    isLoading,
    error,
    refetch,
    updatePayment: updatePaymentMutation.mutate,
    isUpdating: updatePaymentMutation.isPending,
    processPayment: processPaymentMutation.mutate,
    isProcessing: processPaymentMutation.isPending,
    createRefund: createRefundMutation.mutate,
    isCreatingRefund: createRefundMutation.isPending,
  };
};

// Hook to fetch and manage payment methods
export const usePaymentMethods = (userId?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch payment methods
  const {
    data: paymentMethods,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["paymentMethods", userId],
    queryFn: () => paymentsApi.getPaymentMethods(userId),
  });

  // Mutation to create payment method
  const createPaymentMethodMutation = useMutation({
    mutationFn: (methodData: PaymentMethodFormData) =>
      paymentsApi.createPaymentMethod(methodData),
    onSuccess: (data) => {
      toast.success("Payment method created successfully");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create payment method";
      toast.error(errorMessage);
    },
  });

  // Mutation to update payment method
  const updatePaymentMethodMutation = useMutation({
    mutationFn: ({
      id,
      methodData,
    }: {
      id: number;
      methodData: Partial<PaymentMethodFormData>;
    }) => paymentsApi.updatePaymentMethod(id, methodData),
    onSuccess: (data) => {
      toast.success("Payment method updated successfully");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update payment method";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete payment method
  const deletePaymentMethodMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.deletePaymentMethod(id),
    onSuccess: () => {
      toast.success("Payment method deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete payment method";
      toast.error(errorMessage);
    },
  });

  return {
    paymentMethods: paymentMethods || [],
    isLoading,
    error,
    refetch,
    createPaymentMethod: createPaymentMethodMutation.mutate,
    isCreating: createPaymentMethodMutation.isPending,
    updatePaymentMethod: updatePaymentMethodMutation.mutate,
    isUpdating: updatePaymentMethodMutation.isPending,
    deletePaymentMethod: deletePaymentMethodMutation.mutate,
    isDeleting: deletePaymentMethodMutation.isPending,
  };
};

// Hook to fetch and manage payment gateways
export const usePaymentGateways = (page = 1) => {
  const queryClient = useQueryClient();

  // Query to fetch all payment gateways
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["paymentGateways", page],
    queryFn: () => paymentsApi.getPaymentGateways(page),
  });

  // Query to fetch active payment gateways
  const { data: activeGatewaysData, isLoading: isLoadingActive } = useQuery({
    queryKey: ["paymentGateways", "active"],
    queryFn: () => paymentsApi.getActivePaymentGateways(),
  });

  // Mutation to create payment gateway
  const createPaymentGatewayMutation = useMutation({
    mutationFn: (gatewayData: PaymentGatewayFormData) =>
      paymentsApi.createPaymentGateway(gatewayData),
    onSuccess: (data) => {
      toast.success(`Gateway "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["paymentGateways"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create payment gateway";
      toast.error(errorMessage);
    },
  });

  // Mutation to update payment gateway
  const updatePaymentGatewayMutation = useMutation({
    mutationFn: ({
      id,
      gatewayData,
    }: {
      id: number;
      gatewayData: Partial<PaymentGatewayFormData>;
    }) => paymentsApi.updatePaymentGateway(id, gatewayData),
    onMutate: async ({ id, gatewayData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["paymentGateways"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["paymentGateways", page]);

      // Optimistically update to the new value
      queryClient.setQueryData(["paymentGateways", page], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          results: old.results.map((gateway: PaymentGateway) =>
            gateway.id === id ? { ...gateway, ...gatewayData } : gateway
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(`Gateway "${data.name}" updated successfully`);
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state if there's an error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["paymentGateways", page],
          context.previousData
        );
      }
      const errorMessage =
        error.response?.data?.detail || "Failed to update payment gateway";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["paymentGateways"] });
    },
  });

  // Mutation to delete payment gateway
  const deletePaymentGatewayMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.deletePaymentGateway(id),
    onSuccess: () => {
      toast.success("Payment gateway deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["paymentGateways"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete payment gateway";
      toast.error(errorMessage);
    },
  });

  return {
    gateways: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    activeGateways: activeGatewaysData || [],
    isLoadingActive,
    createGateway: createPaymentGatewayMutation.mutate,
    isCreating: createPaymentGatewayMutation.isPending,
    updateGateway: updatePaymentGatewayMutation.mutate,
    isUpdating: updatePaymentGatewayMutation.isPending,
    deleteGateway: deletePaymentGatewayMutation.mutate,
    isDeleting: deletePaymentGatewayMutation.isPending,
  };
};

// Hook to fetch and manage tax rates
export const useTaxRates = (page = 1) => {
  const queryClient = useQueryClient();

  // Query to fetch all tax rates
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["taxRates", page],
    queryFn: () => paymentsApi.getTaxRates(page),
  });

  // Query to fetch default tax rate
  const { data: defaultTaxRate, isLoading: isLoadingDefault } = useQuery({
    queryKey: ["taxRates", "default"],
    queryFn: () => paymentsApi.getDefaultTaxRate(),
  });

  // Mutation to create tax rate
  const createTaxRateMutation = useMutation({
    mutationFn: (taxRateData: TaxRateFormData) =>
      paymentsApi.createTaxRate(taxRateData),
    onSuccess: (data) => {
      toast.success(`Tax rate "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["taxRates"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create tax rate";
      toast.error(errorMessage);
    },
  });

  // Mutation to update tax rate
  const updateTaxRateMutation = useMutation({
    mutationFn: ({
      id,
      taxRateData,
    }: {
      id: number;
      taxRateData: Partial<TaxRateFormData>;
    }) => paymentsApi.updateTaxRate(id, taxRateData),
    onSuccess: (data) => {
      toast.success(`Tax rate "${data.name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["taxRates"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update tax rate";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete tax rate
  const deleteTaxRateMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.deleteTaxRate(id),
    onSuccess: () => {
      toast.success("Tax rate deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["taxRates"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete tax rate";
      toast.error(errorMessage);
    },
  });

  return {
    taxRates: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    defaultTaxRate,
    isLoadingDefault,
    createTaxRate: createTaxRateMutation.mutate,
    isCreating: createTaxRateMutation.isPending,
    updateTaxRate: updateTaxRateMutation.mutate,
    isUpdating: updateTaxRateMutation.isPending,
    deleteTaxRate: deleteTaxRateMutation.mutate,
    isDeleting: deleteTaxRateMutation.isPending,
  };
};

// Hook to fetch and manage invoices
export const useInvoices = (page = 1, filters?: any) => {
  const queryClient = useQueryClient();

  // Query to fetch invoices
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["invoices", page, filters],
    queryFn: () => paymentsApi.getInvoices(page, filters),
  });

  // Mutation to create invoice
  const createInvoiceMutation = useMutation({
    mutationFn: (invoiceData: InvoiceFormData) =>
      paymentsApi.createInvoice(invoiceData),
    onSuccess: (data) => {
      toast.success(`Invoice ${data.invoice_id} created successfully`);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create invoice";
      toast.error(errorMessage);
    },
  });

  // Mutation to update invoice
  const updateInvoiceMutation = useMutation({
    mutationFn: ({
      id,
      invoiceData,
    }: {
      id: number;
      invoiceData: Partial<InvoiceFormData>;
    }) => paymentsApi.updateInvoice(id, invoiceData),
    onSuccess: (data) => {
      toast.success(`Invoice ${data.invoice_id} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", data.id] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update invoice";
      toast.error(errorMessage);
    },
  });

  // Mutation to delete invoice
  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.deleteInvoice(id),
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete invoice";
      toast.error(errorMessage);
    },
  });

  // Mutation to issue invoice
  const issueInvoiceMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.issueInvoice(id),
    onSuccess: (data) => {
      toast.success(
        `Invoice ${(data as Invoice).invoice_id} issued successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({
        queryKey: ["invoice", (data as Invoice).id],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to issue invoice";
      toast.error(errorMessage);
    },
  });

  // Mutation to mark invoice as paid
  const markInvoiceAsPaidMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.markInvoiceAsPaid(id),
    onSuccess: (data) => {
      toast.success(`Invoice ${(data as Invoice).invoice_id} marked as paid`);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({
        queryKey: ["invoice", (data as Invoice).id],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to mark invoice as paid";
      toast.error(errorMessage);
    },
  });

  return {
    invoices: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    pagination: {
      hasNextPage: !!data?.next,
      hasPreviousPage: !!data?.previous,
    },
    createInvoice: createInvoiceMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
    updateInvoice: updateInvoiceMutation.mutate,
    isUpdating: updateInvoiceMutation.isPending,
    deleteInvoice: deleteInvoiceMutation.mutate,
    isDeleting: deleteInvoiceMutation.isPending,
    issueInvoice: issueInvoiceMutation.mutate,
    isIssuing: issueInvoiceMutation.isPending,
    markInvoiceAsPaid: markInvoiceAsPaidMutation.mutate,
    isMarkingAsPaid: markInvoiceAsPaidMutation.isPending,
  };
};

// Hook to fetch and manage payment plans
export const usePaymentPlans = (eventId?: number) => {
  const queryClient = useQueryClient();

  // Query to fetch payment plan for a specific event
  const {
    data: paymentPlan,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["paymentPlan", eventId],
    queryFn: () => paymentsApi.getPaymentPlanForEvent(eventId!),
    enabled: !!eventId,
  });

  // Mutation to create payment plan
  const createPaymentPlanMutation = useMutation({
    mutationFn: (planData: PaymentPlanFormData) =>
      paymentsApi.createPaymentPlan(planData),
    onSuccess: (data) => {
      toast.success("Payment plan created successfully");
      if (data.event) {
        queryClient.invalidateQueries({
          queryKey: ["paymentPlan", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create payment plan";
      toast.error(errorMessage);
    },
  });

  // Mutation to update payment plan
  const updatePaymentPlanMutation = useMutation({
    mutationFn: ({
      id,
      planData,
    }: {
      id: number;
      planData: Partial<PaymentPlanFormData>;
    }) => paymentsApi.updatePaymentPlan(id, planData),
    onSuccess: (data) => {
      toast.success("Payment plan updated successfully");
      if (data.event) {
        queryClient.invalidateQueries({
          queryKey: ["paymentPlan", data.event],
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to update payment plan";
      toast.error(errorMessage);
    },
  });

  // Mutation to create payment from installment
  const createPaymentFromInstallmentMutation = useMutation({
    mutationFn: ({
      installmentId,
      paymentData,
    }: {
      installmentId: number;
      paymentData: CreatePaymentFromInstallmentRequest;
    }) => paymentsApi.createPaymentFromInstallment(installmentId, paymentData),
    onSuccess: (data) => {
      toast.success("Payment created successfully");
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ["paymentPlan", eventId] });
      }
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to create payment";
      toast.error(errorMessage);
    },
  });

  return {
    paymentPlan,
    isLoading,
    error,
    refetch,
    createPaymentPlan: createPaymentPlanMutation.mutate,
    isCreating: createPaymentPlanMutation.isPending,
    updatePaymentPlan: updatePaymentPlanMutation.mutate,
    isUpdating: updatePaymentPlanMutation.isPending,
    createPaymentFromInstallment: createPaymentFromInstallmentMutation.mutate,
    isCreatingPayment: createPaymentFromInstallmentMutation.isPending,
  };
};
