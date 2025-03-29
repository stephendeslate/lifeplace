// frontend/admin-crm/src/pages/payments/PaymentsList.tsx
import {
  Add as AddIcon,
  AttachMoney as PaymentIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { PaymentFilters } from "../../components/payments/PaymentFilters";
import { PaymentForm } from "../../components/payments/PaymentForm";
import { PaymentList } from "../../components/payments/PaymentList";
import { usePayments } from "../../hooks/usePayments";
import {
  Payment,
  PaymentFilters as PaymentFiltersType,
  PaymentFormData,
} from "../../types/payments.types";

export const PaymentsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PaymentFiltersType>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [paymentToProcess, setPaymentToProcess] = useState<Payment | null>(
    null
  );
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [paymentToRefund, setPaymentToRefund] = useState<Payment | null>(null);

  const {
    payments,
    totalCount,
    isLoading,
    createPayment,
    isCreating,
    processPayment,
    isProcessing,
    createRefund,
    isCreatingRefund,
  } = usePayments(page, filters);

  // Initialize with default values for new payment
  const initialPaymentFormData: Partial<PaymentFormData> = {
    status: "PENDING",
    due_date: new Date().toISOString(),
    is_manual: false,
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: PaymentFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleEditPayment = (payment: Payment) => {
    navigate(`/payments/${payment.id}`);
  };

  const handleDeletePayment = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // In a real implementation, you would call a delete API here
    console.log("Delete payment", paymentToDelete);
    setDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  const handleProcessPayment = (payment: Payment) => {
    setPaymentToProcess(payment);
    setProcessDialogOpen(true);
  };

  const confirmProcess = () => {
    if (paymentToProcess && paymentToProcess.payment_method) {
      processPayment({
        id: paymentToProcess.id,
        processData: {
          payment_method:
            typeof paymentToProcess.payment_method === "object"
              ? paymentToProcess.payment_method.id
              : paymentToProcess.payment_method,
        },
      });
    }
    setProcessDialogOpen(false);
    setPaymentToProcess(null);
  };

  const handleRefundPayment = (payment: Payment) => {
    setPaymentToRefund(payment);
    setRefundDialogOpen(true);
  };

  const handleCreatePayment = () => {
    setCreateDialogOpen(true);
  };

  const handleSubmitNewPayment = (formData: PaymentFormData) => {
    createPayment(formData);
    setCreateDialogOpen(false);
  };

  const handleSubmitRefund = () => {
    if (paymentToRefund) {
      createRefund({
        paymentId: paymentToRefund.id,
        refundData: {
          amount: paymentToRefund.amount,
          reason: "Customer requested refund",
        },
      });
    }
    setRefundDialogOpen(false);
    setPaymentToRefund(null);
  };

  return (
    <Layout>
      <Box sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PaymentIcon
                sx={{ mr: 2, color: "primary.main", fontSize: 32 }}
              />
              <Box>
                <Typography variant="h4">Payments</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Manage all payment transactions
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreatePayment}
            >
              New Payment
            </Button>
          </Box>

          <PaymentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <PaymentList
            payments={payments}
            isLoading={isLoading}
            totalCount={totalCount}
            page={page}
            onPageChange={handlePageChange}
            onEdit={handleEditPayment}
            onProcess={handleProcessPayment}
            onRefund={handleRefundPayment}
            onDelete={handleDeletePayment}
          />
        </Container>
      </Box>

      {/* Create Payment Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Payment</DialogTitle>
        <DialogContent>
          <PaymentForm
            initialValues={initialPaymentFormData}
            onSubmit={handleSubmitNewPayment}
            isSubmitting={isCreating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Process Payment Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
      >
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to process this payment of{" "}
            {paymentToProcess ? `$${paymentToProcess.amount}` : ""}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={confirmProcess}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Process Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog
        open={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
      >
        <DialogTitle>Refund Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to refund this payment of{" "}
            {paymentToRefund ? `$${paymentToRefund.amount}` : ""}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmitRefund}
            disabled={isCreatingRefund}
          >
            {isCreatingRefund ? "Processing..." : "Issue Refund"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default PaymentsList;
