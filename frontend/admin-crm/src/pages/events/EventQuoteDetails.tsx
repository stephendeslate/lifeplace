// frontend/admin-crm/src/pages/events/EventQuoteDetails.tsx
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { useEvent } from "../../hooks/useEvents";
import { useEventQuote, useEventQuotes } from "../../hooks/useSales";
import { QuoteStatus } from "../../types/sales.types";

const QuoteStatusChip: React.FC<{ status: QuoteStatus }> = ({ status }) => {
  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "SENT":
        return "info";
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
    <Chip
      label={status.charAt(0) + status.slice(1).toLowerCase()}
      color={getStatusColor(status)}
      size="small"
    />
  );
};

export const EventQuoteDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id: eventId, quoteId } = useParams<{ id: string; quoteId: string }>();

  const parsedEventId = eventId ? parseInt(eventId) : 0;
  const parsedQuoteId = quoteId ? parseInt(quoteId) : 0;
  const isNewQuote = quoteId === "new";

  // Hooks
  const { event, isLoading: isLoadingEvent } = useEvent(parsedEventId);
  const {
    quote,
    isLoading: isLoadingQuote,
    error,
    sendQuote,
    isSending,
  } = useEventQuote(isNewQuote ? undefined : parsedQuoteId);

  // Use the event quotes hook for duplicate functionality
  const { duplicateQuote, isDuplicating } = useEventQuotes(parsedEventId);

  // Handlers
  const handleBackToEvent = () => {
    navigate(`/events/${eventId}`);
  };

  const handleEditQuote = () => {
    if (quote?.status !== "DRAFT") {
      alert("Only draft quotes can be edited");
      return;
    }
    navigate(`/events/${eventId}/quotes/${quoteId}/edit`);
  };

  const handleSendQuote = async () => {
    if (quote?.status !== "DRAFT") {
      alert("Only draft quotes can be sent");
      return;
    }

    try {
      await sendQuote();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDuplicateQuote = async () => {
    if (quote) {
      try {
        await duplicateQuote(quote.id);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoadingEvent || isLoadingQuote) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !quote || !event) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">
              Error loading quote. The quote may not exist or you may not have
              permission to view it.
            </Alert>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToEvent}
              sx={{ mt: 2 }}
            >
              Back to Event
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (isNewQuote) {
    // Render create quote form
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToEvent}
                sx={{ mb: 2 }}
              >
                Back to Event
              </Button>
              <Typography variant="h4" gutterBottom>
                Create New Quote for {event.name}
              </Typography>
            </Box>

            <Card>
              <CardContent>
                <Alert severity="info">
                  Quote creation form will be implemented here. For now, use the
                  simple creation dialog in the event details page.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToEvent}
                sx={{ mb: 1 }}
              >
                Back to Event
              </Button>
              <Typography variant="h4">
                Quote #{quote.version} for {event.name}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}
              >
                <QuoteStatusChip status={quote.status} />
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(quote.created_at).toLocaleDateString()}
                </Typography>
                {quote.sent_at && (
                  <Typography variant="body2" color="text.secondary">
                    Sent: {new Date(quote.sent_at).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              {quote.status === "DRAFT" && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditQuote}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSendQuote}
                    disabled={isSending}
                  >
                    {isSending ? "Sending..." : "Send to Client"}
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                startIcon={<DuplicateIcon />}
                onClick={handleDuplicateQuote}
                disabled={isDuplicating}
              >
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />}>
                Print
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Quote Details */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Quote Details" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Quote Number
                      </Typography>
                      <Typography variant="body1">#{quote.version}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Valid Until
                      </Typography>
                      <Typography variant="body1">
                        {new Date(quote.valid_until).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(quote.subtotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Tax Amount
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(quote.tax_amount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Discount
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(quote.discount_amount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Total Amount</strong>
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(quote.total_amount)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {quote.notes && (
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Notes
                      </Typography>
                      <Typography variant="body1">{quote.notes}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Line Items */}
              {quote.line_items && quote.line_items.length > 0 && (
                <Card sx={{ mt: 3 }}>
                  <CardHeader title="Line Items" />
                  <Divider />
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quote.line_items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="center">
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
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              )}
            </Grid>

            {/* Event Details */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Event Information" />
                <Divider />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Event Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {event.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Client
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {event.client_name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Event Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(event.start_date).toLocaleDateString()}
                    {event.end_date &&
                      ` - ${new Date(event.end_date).toLocaleDateString()}`}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Event Type
                  </Typography>
                  <Typography variant="body1">
                    {event.event_type_name}
                  </Typography>
                </CardContent>
              </Card>

              {/* Quote Activity */}
              {quote.activities && quote.activities.length > 0 && (
                <Card sx={{ mt: 3 }}>
                  <CardHeader title="Quote Activity" />
                  <Divider />
                  <CardContent>
                    {quote.activities.slice(0, 5).map((activity) => (
                      <Box
                        key={activity.id}
                        sx={{ mb: 2, "&:last-child": { mb: 0 } }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.created_at).toLocaleDateString()} -{" "}
                          {activity.action_by_name || "System"}
                        </Typography>
                        {activity.notes && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {activity.notes}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>

          {/* Terms and Conditions */}
          {quote.terms_and_conditions && (
            <Card sx={{ mt: 3 }}>
              <CardHeader title="Terms and Conditions" />
              <Divider />
              <CardContent>
                <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                  {quote.terms_and_conditions}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default EventQuoteDetails;
