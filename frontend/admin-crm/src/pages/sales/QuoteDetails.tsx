// frontend/admin-crm/src/pages/sales/QuoteDetails.tsx
import {
  CheckCircle as AcceptIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Edit as EditIcon,
  Cancel as RejectIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { useEventQuote } from "../../hooks/useSales";
import { formatCurrency } from "../../utils/formatters";

const QuoteDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const quoteId = id ? parseInt(id) : 0;
  const isEditMode = window.location.pathname.includes("/edit");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const {
    quote,
    isLoading,
    error,
    sendQuote,
    isSending,
    acceptQuote,
    isAccepting,
    rejectQuote,
    isRejecting,
  } = useEventQuote(quoteId);

  if (isEditMode) {
    // For edit mode, we would render a form to edit the quote
    // This is a placeholder for that functionality
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/sales/quotes/${quoteId}`)}
            >
              Back to Quote
            </Button>
          </Box>

          <Typography variant="h4" gutterBottom>
            Edit Quote
          </Typography>

          {/* Quote edit form would go here */}
          <Typography>Quote edit form placeholder</Typography>
        </Box>
      </Layout>
    );
  }

  // Handle send quote
  const handleSendQuote = () => {
    sendQuote();
  };

  // Handle accept quote
  const handleAcceptQuote = () => {
    acceptQuote(notes);
    setAcceptDialogOpen(false);
    setNotes("");
  };

  // Handle reject quote
  const handleRejectQuote = () => {
    rejectQuote(notes);
    setRejectDialogOpen(false);
    setNotes("");
  };

  // Get status chip color based on status
  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "SENT":
        return "primary";
      case "ACCEPTED":
        return "success";
      case "REJECTED":
        return "error";
      case "EXPIRED":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error.message}</Typography>
        ) : quote ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 3,
              }}
            >
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/sales/quotes")}
              >
                Back to Quotes
              </Button>

              <Box>
                <Chip
                  label={quote.status_display || quote.status}
                  color={getStatusChipColor(quote.status)}
                  sx={{ mr: 1 }}
                />
                {quote.status === "DRAFT" && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/sales/quotes/${quoteId}/edit`)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SendIcon />}
                      onClick={handleSendQuote}
                      disabled={isSending}
                      sx={{ mr: 1 }}
                    >
                      {isSending ? "Sending..." : "Send to Client"}
                    </Button>
                  </>
                )}
                {quote.status === "SENT" && (
                  <>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<AcceptIcon />}
                      onClick={() => setAcceptDialogOpen(true)}
                      sx={{ mr: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => setRejectDialogOpen(true)}
                      sx={{ mr: 1 }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  startIcon={<DuplicateIcon />}
                  sx={{ mr: 1 }}
                >
                  Duplicate
                </Button>
                {quote.status !== "ACCEPTED" && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h5">Quote #{quote.id}</Typography>
                      <Typography variant="subtitle1">
                        Version {quote.version}
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Event
                        </Typography>
                        <Typography variant="body1">
                          {quote.event_details?.name || `Event #${quote.event}`}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Valid Until
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(quote.valid_until), "PP")}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Created
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(quote.created_at), "PPp")}
                        </Typography>
                      </Grid>

                      {quote.sent_at && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Sent
                          </Typography>
                          <Typography variant="body1">
                            {format(new Date(quote.sent_at), "PPp")}
                          </Typography>
                        </Grid>
                      )}

                      {quote.accepted_at && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Accepted
                          </Typography>
                          <Typography variant="body1">
                            {format(new Date(quote.accepted_at), "PPp")}
                          </Typography>
                        </Grid>
                      )}

                      {quote.rejected_at && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Rejected
                          </Typography>
                          <Typography variant="body1">
                            {format(new Date(quote.rejected_at), "PPp")}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>

                    {quote.rejection_reason && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Rejection Reason
                        </Typography>
                        <Typography variant="body1" color="error">
                          {quote.rejection_reason}
                        </Typography>
                      </Box>
                    )}

                    {quote.notes && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Notes
                        </Typography>
                        <Typography variant="body1">{quote.notes}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Line Items
                    </Typography>

                    {quote.line_items && quote.line_items.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Description</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Unit Price</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {quote.line_items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell align="right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(item.unit_price)}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(item.total)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} />
                              <TableCell align="right">
                                <Typography variant="subtitle2">
                                  Subtotal
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(quote.subtotal)}
                              </TableCell>
                            </TableRow>
                            {quote.discount_amount > 0 && (
                              <TableRow>
                                <TableCell colSpan={2} />
                                <TableCell align="right">
                                  <Typography variant="subtitle2">
                                    Discount
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(quote.discount_amount)}
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell colSpan={2} />
                              <TableCell align="right">
                                <Typography variant="subtitle2">Tax</Typography>
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(quote.tax_amount)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={2} />
                              <TableCell align="right">
                                <Typography variant="h6">Total</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="h6">
                                  {formatCurrency(quote.total_amount)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No line items
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Template Information
                    </Typography>
                    {quote.template ? (
                      <>
                        <Typography variant="body2" color="textSecondary">
                          Template
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {quote.template_details?.name ||
                            `Template #${quote.template}`}
                        </Typography>

                        {quote.template_details?.event_type_name && (
                          <>
                            <Typography variant="body2" color="textSecondary">
                              Event Type
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {quote.template_details.event_type_name}
                            </Typography>
                          </>
                        )}
                      </>
                    ) : (
                      <Typography variant="body1">No template used</Typography>
                    )}
                  </CardContent>
                </Card>

                {quote.terms_and_conditions && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Terms and Conditions
                      </Typography>
                      <Typography variant="body2" whiteSpace="pre-wrap">
                        {quote.terms_and_conditions}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </>
        ) : null}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Quote</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quote? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Accept dialog */}
      <Dialog
        open={acceptDialogOpen}
        onClose={() => setAcceptDialogOpen(false)}
      >
        <DialogTitle>Accept Quote</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to accept this quote? This will confirm the
            booking and create associated contracts.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Notes (optional)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)}>Cancel</Button>
          <Button
            color="success"
            variant="contained"
            onClick={handleAcceptQuote}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept Quote"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Reject Quote</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this quote.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRejectQuote}
            disabled={isRejecting || !notes.trim()}
          >
            {isRejecting ? "Rejecting..." : "Reject Quote"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default QuoteDetails;
