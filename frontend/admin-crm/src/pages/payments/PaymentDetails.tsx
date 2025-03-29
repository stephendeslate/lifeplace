// frontend/admin-crm/src/pages/payments/PaymentDetails.tsx
import {
  ArrowBack as ArrowBackIcon,
  Person as ClientIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Refresh as ProcessIcon,
  Receipt as ReceiptIcon,
  MoneyOff as RefundIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { PaymentForm } from "../../components/payments/PaymentForm";
import { PaymentStatusChip } from "../../components/payments/PaymentStatusChip";
import { usePayment } from "../../hooks/usePayments";
import {
  PaymentFormData,
  ProcessPaymentRequest,
} from "../../types/payments.types";
import { formatCurrency } from "../../utils/formatters";

export const PaymentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const paymentId = id ? parseInt(id) : 0;

  const [editMode, setEditMode] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const {
    payment,
    isLoading,
    error,
    updatePayment,
    isUpdating,
    processPayment,
    isProcessing,
    createRefund,
    isCreatingRefund,
  } = usePayment(paymentId);

  const handleBackToList = () => {
    navigate("/payments");
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleUpdatePayment = (formData: PaymentFormData) => {
    updatePayment(formData);
    setEditMode(false);
  };

  const handleProcessPayment = () => {
    setProcessDialogOpen(true);
  };

  const confirmProcess = () => {
    if (payment && payment.payment_method) {
      const processData: ProcessPaymentRequest = {
        payment_method:
          typeof payment.payment_method === "object"
            ? payment.payment_method.id
            : payment.payment_method,
      };

      processPayment(processData);
    }
    setProcessDialogOpen(false);
  };

  const handleRefundPayment = () => {
    setRefundDialogOpen(true);
  };

  const confirmRefund = () => {
    if (payment) {
      createRefund({
        amount: payment.amount,
        reason: "Customer requested refund",
      });
    }
    setRefundDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !payment) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">
              Error loading payment. The payment may not exist or you may not
              have permission to view it.
            </Alert>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
              sx={{ mt: 2 }}
            >
              Back to Payments
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Header with back button and payment info */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToList}
            >
              Back to Payments
            </Button>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PaymentStatusChip status={payment.status} sx={{ mr: 1 }} />
              {payment.status === "PENDING" ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProcessPayment}
                  startIcon={<ProcessIcon />}
                  sx={{ mr: 1 }}
                >
                  Process Payment
                </Button>
              ) : payment.status === "COMPLETED" ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleRefundPayment}
                  startIcon={<RefundIcon />}
                  sx={{ mr: 1 }}
                >
                  Refund
                </Button>
              ) : null}
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditToggle}
              >
                {editMode ? "Cancel Edit" : "Edit Payment"}
              </Button>
            </Box>
          </Box>

          {/* Payment info */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Payment {payment.payment_number}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PaymentIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {formatCurrency(payment.amount)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EventIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {typeof payment.event === "object"
                    ? payment.event.name
                    : payment.event_details
                    ? payment.event_details.name
                    : `Event ${payment.event}`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ClientIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  {payment.event_details?.client_name || "Client"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {editMode ? (
            <Card>
              <CardHeader title="Edit Payment" />
              <Divider />
              <CardContent>
                <PaymentForm
                  initialValues={{
                    event:
                      typeof payment.event === "object"
                        ? payment.event.id
                        : payment.event,
                    amount: payment.amount,
                    status: payment.status,
                    due_date: payment.due_date,
                    payment_method: payment.payment_method
                      ? typeof payment.payment_method === "object"
                        ? payment.payment_method.id
                        : payment.payment_method
                      : undefined,
                    description: payment.description,
                    notes: payment.notes,
                    reference_number: payment.reference_number,
                    is_manual: payment.is_manual,
                  }}
                  onSubmit={handleUpdatePayment}
                  isSubmitting={isUpdating}
                  editMode={true}
                />
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {/* Payment Details */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Payment Details" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <PaymentStatusChip status={payment.status} />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(payment.due_date), "MMM dd, yyyy")}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Paid On
                        </Typography>
                        <Typography variant="body1">
                          {payment.paid_on
                            ? format(new Date(payment.paid_on), "MMM dd, yyyy")
                            : "Not paid yet"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Method
                        </Typography>
                        <Typography variant="body1">
                          {payment.payment_method_details
                            ? payment.payment_method_details.nickname ||
                              payment.payment_method_details.type_display
                            : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Reference Number
                        </Typography>
                        <Typography variant="body1">
                          {payment.reference_number || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {payment.description || "No description"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body1">
                          {payment.notes || "No notes"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Related Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Related Information" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Event
                        </Typography>
                        <Typography variant="body1">
                          {payment.event_details ? (
                            <Button
                              onClick={() =>
                                navigate(`/events/${payment.event_details?.id}`)
                              }
                              variant="text"
                              color="primary"
                              sx={{
                                p: 0,
                                textTransform: "none",
                                fontWeight: "normal",
                              }}
                            >
                              {payment.event_details.name}
                            </Button>
                          ) : (
                            `Event ${payment.event}`
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Invoice
                        </Typography>
                        <Typography variant="body1">
                          {payment.invoice_details ? (
                            <Button
                              onClick={() =>
                                navigate(
                                  `/invoices/${payment.invoice_details?.id}`
                                )
                              }
                              variant="text"
                              color="primary"
                              sx={{
                                p: 0,
                                textTransform: "none",
                                fontWeight: "normal",
                              }}
                            >
                              {payment.invoice_details.invoice_id}
                            </Button>
                          ) : (
                            "No associated invoice"
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Quote
                        </Typography>
                        <Typography variant="body1">
                          {payment.quote_details ? (
                            <Button
                              onClick={() =>
                                navigate(
                                  `/sales/quotes/${payment.quote_details?.id}`
                                )
                              }
                              variant="text"
                              color="primary"
                              sx={{
                                p: 0,
                                textTransform: "none",
                                fontWeight: "normal",
                              }}
                            >
                              Quote #{payment.quote_details.id}
                            </Button>
                          ) : (
                            "No associated quote"
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Receipt
                        </Typography>
                        <Typography variant="body1">
                          {payment.receipt_number ? (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="body1" sx={{ mr: 1 }}>
                                {payment.receipt_number}
                              </Typography>
                              {payment.receipt_pdf && (
                                <Button
                                  startIcon={<ReceiptIcon />}
                                  variant="outlined"
                                  size="small"
                                  href={payment.receipt_pdf}
                                  target="_blank"
                                >
                                  View Receipt
                                </Button>
                              )}
                            </Box>
                          ) : (
                            "No receipt generated"
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Type
                        </Typography>
                        <Typography variant="body1">
                          {payment.is_manual
                            ? "Manual Payment"
                            : "Automatic Payment"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body1">
                          {format(
                            new Date(payment.created_at),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1">
                          {format(
                            new Date(payment.updated_at),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Transactions */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Transactions" />
                  <Divider />
                  <CardContent>
                    {payment.transactions && payment.transactions.length > 0 ? (
                      <Grid container spacing={2}>
                        {payment.transactions.map((transaction) => (
                          <Grid item xs={12} key={transaction.id}>
                            <Box
                              sx={{
                                p: 2,
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Transaction ID
                                  </Typography>
                                  <Typography variant="body2">
                                    {transaction.transaction_id}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Status
                                  </Typography>
                                  <Typography variant="body2">
                                    {transaction.status_display}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Amount
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatCurrency(transaction.amount)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Date
                                  </Typography>
                                  <Typography variant="body2">
                                    {format(
                                      new Date(transaction.created_at),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </Typography>
                                </Grid>
                                {transaction.error_message && (
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="subtitle2"
                                      color="error"
                                    >
                                      Error
                                    </Typography>
                                    <Typography variant="body2" color="error">
                                      {transaction.error_message}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No transactions recorded yet.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Refunds */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Refunds" />
                  <Divider />
                  <CardContent>
                    {payment.refunds && payment.refunds.length > 0 ? (
                      <Grid container spacing={2}>
                        {payment.refunds.map((refund) => (
                          <Grid item xs={12} key={refund.id}>
                            <Box
                              sx={{
                                p: 2,
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Refund ID
                                  </Typography>
                                  <Typography variant="body2">
                                    {refund.refund_transaction_id}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Status
                                  </Typography>
                                  <Typography variant="body2">
                                    {refund.status_display}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Amount
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatCurrency(refund.amount)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Date
                                  </Typography>
                                  <Typography variant="body2">
                                    {format(
                                      new Date(refund.created_at),
                                      "MMM dd, yyyy HH:mm"
                                    )}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                  >
                                    Reason
                                  </Typography>
                                  <Typography variant="body2">
                                    {refund.reason}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No refunds recorded.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>

      {/* Process Payment Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
      >
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to process this payment of{" "}
            {formatCurrency(payment.amount)}? This will mark the payment as
            completed.
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
            {formatCurrency(payment.amount)}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmRefund}
            disabled={isCreatingRefund}
          >
            {isCreatingRefund ? "Processing..." : "Issue Refund"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default PaymentDetails;
