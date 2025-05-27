// frontend/admin-crm/src/pages/events/EventQuotesList.tsx
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
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
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { useEvent } from "../../hooks/useEvents";
import { useEventQuotes } from "../../hooks/useSales";
import { EventQuote, QuoteStatus } from "../../types/sales.types";

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

export const EventQuotesList: React.FC = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();
  const parsedEventId = eventId ? parseInt(eventId) : 0;

  // Hooks
  const { event, isLoading: isLoadingEvent } = useEvent(parsedEventId);
  const {
    quotes,
    isLoading: isLoadingQuotes,
    sendQuote,
    duplicateQuote,
    deleteQuote,
  } = useEventQuotes(parsedEventId);

  // Handlers
  const handleBackToEvent = () => {
    navigate(`/events/${eventId}`);
  };

  const handleCreateQuote = () => {
    navigate(`/events/${eventId}/quotes/new`);
  };

  const handleViewQuote = (quote: EventQuote) => {
    navigate(`/events/${eventId}/quotes/${quote.id}`);
  };

  const handleEditQuote = (quote: EventQuote) => {
    if (quote.status !== "DRAFT") {
      alert("Only draft quotes can be edited");
      return;
    }
    navigate(`/events/${eventId}/quotes/${quote.id}/edit`);
  };

  const handleSendQuote = async (quote: EventQuote) => {
    if (quote.status !== "DRAFT") {
      alert("Only draft quotes can be sent");
      return;
    }

    try {
      await sendQuote(quote.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDuplicateQuote = async (quote: EventQuote) => {
    try {
      await duplicateQuote(quote.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteQuote = async (quote: EventQuote) => {
    if (quote.status === "ACCEPTED") {
      alert("Cannot delete an accepted quote");
      return;
    }

    if (window.confirm("Are you sure you want to delete this quote?")) {
      try {
        await deleteQuote(quote.id);
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

  if (isLoadingEvent || isLoadingQuotes) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">
              Event not found. Please check the URL and try again.
            </Alert>
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
              <Typography variant="h4" gutterBottom>
                Quotes for {event.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage all quotes and proposals for this event
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateQuote}
            >
              Create New Quote
            </Button>
          </Box>

          {/* Quotes Table */}
          <Card>
            <CardHeader
              title={`Quotes (${quotes.length})`}
              subheader="All quotes for this event"
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {quotes.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Alert severity="info">
                    No quotes have been created for this event yet.
                  </Alert>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Quote #</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell>Valid Until</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Sent</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quotes.map((quote) => (
                        <TableRow key={quote.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              #{quote.version}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <QuoteStatusChip status={quote.status} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(quote.total_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(quote.valid_until).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(quote.created_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {quote.sent_at
                                ? new Date(quote.sent_at).toLocaleDateString()
                                : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="View Quote">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewQuote(quote)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {quote.status === "DRAFT" && (
                                <>
                                  <Tooltip title="Edit Quote">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditQuote(quote)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Send to Client">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleSendQuote(quote)}
                                    >
                                      <SendIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}

                              <Tooltip title="Duplicate Quote">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDuplicateQuote(quote)}
                                >
                                  <DuplicateIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {quote.status !== "ACCEPTED" && (
                                <Tooltip title="Delete Quote">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteQuote(quote)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Layout>
  );
};

export default EventQuotesList;
