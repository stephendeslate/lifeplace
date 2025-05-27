// frontend/admin-crm/src/components/events/EventQuotesCard.tsx
import {
  Add as AddIcon,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEventQuotes, useQuoteTemplates } from "../../hooks/useSales";
import { Event } from "../../types/events.types";
import {
  EventQuote,
  EventQuoteFormData,
  QuoteStatus,
} from "../../types/sales.types";

interface EventQuotesCardProps {
  event: Event;
}

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

const EventQuotesCard: React.FC<EventQuotesCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuote, setSelectedQuote] = useState<EventQuote | null>(null);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState<EventQuoteFormData>({
    event: event.id,
    total_amount: 0,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    notes: "",
    terms_and_conditions: "",
  });

  // Hooks
  const {
    quotes,
    isLoading,
    createQuote,
    sendQuote,
    duplicateQuote,
    deleteQuote,
    isCreating,
  } = useEventQuotes(event.id);

  const { activeTemplates } = useQuoteTemplates();

  // Handlers
  const handleCreateQuote = async () => {
    try {
      await createQuote(quoteForm);
      setCreateDialogOpen(false);
      setQuoteForm({
        event: event.id,
        total_amount: 0,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        notes: "",
        terms_and_conditions: "",
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSendQuote = async (quote: EventQuote) => {
    if (quote.status !== "DRAFT") {
      toast.error("Only draft quotes can be sent");
      return;
    }

    try {
      await sendQuote(quote.id);
      setAnchorEl(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDuplicateQuote = async (quote: EventQuote) => {
    try {
      await duplicateQuote(quote.id);
      setAnchorEl(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteQuote = async (quote: EventQuote) => {
    if (quote.status === "ACCEPTED") {
      toast.error("Cannot delete an accepted quote");
      return;
    }

    if (window.confirm("Are you sure you want to delete this quote?")) {
      try {
        await deleteQuote(quote.id);
        setAnchorEl(null);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleViewQuote = (quote: EventQuote) => {
    navigate(`/events/${event.id}/quotes/${quote.id}`);
  };

  const handleEditQuote = (quote: EventQuote) => {
    if (quote.status !== "DRAFT") {
      toast.error("Only draft quotes can be edited");
      return;
    }
    navigate(`/events/${event.id}/quotes/${quote.id}/edit`);
  };

  const handleCreateNewQuote = () => {
    navigate(`/events/${event.id}/quotes/new`);
  };

  const handleViewAllQuotes = () => {
    navigate(`/events/${event.id}/quotes`);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    quote: EventQuote
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quote);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Quotes" />
        <Divider />
        <CardContent>
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Quotes"
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              {quotes.length > 0 && (
                <Button variant="outlined" onClick={handleViewAllQuotes}>
                  View All
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Quote
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          {quotes.length === 0 ? (
            <Alert severity="info">
              No quotes have been created for this event yet.
            </Alert>
          ) : (
            <List>
              {quotes.map((quote) => (
                <ListItem
                  key={quote.id}
                  divider
                  secondaryAction={
                    <Box>
                      <Tooltip title="View Quote">
                        <IconButton onClick={() => handleViewQuote(quote)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton onClick={(e) => handleMenuOpen(e, quote)}>
                          ⋮
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          Quote #{quote.version}
                        </Typography>
                        <QuoteStatusChip status={quote.status} />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total: {formatCurrency(quote.total_amount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Valid until:{" "}
                          {new Date(quote.valid_until).toLocaleDateString()}
                        </Typography>
                        {quote.sent_at && (
                          <Typography variant="body2" color="text.secondary">
                            Sent: {new Date(quote.sent_at).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedQuote?.status === "DRAFT" && (
          <MenuItem
            onClick={() => selectedQuote && handleEditQuote(selectedQuote)}
          >
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {selectedQuote?.status === "DRAFT" && (
          <MenuItem
            onClick={() => selectedQuote && handleSendQuote(selectedQuote)}
          >
            <SendIcon sx={{ mr: 1 }} />
            Send to Client
          </MenuItem>
        )}
        <MenuItem
          onClick={() => selectedQuote && handleDuplicateQuote(selectedQuote)}
        >
          <DuplicateIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        {selectedQuote?.status !== "ACCEPTED" && (
          <MenuItem
            onClick={() => selectedQuote && handleDeleteQuote(selectedQuote)}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Create Quote Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Quote</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                value={quoteForm.total_amount}
                onChange={(e) =>
                  setQuoteForm({
                    ...quoteForm,
                    total_amount: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Valid Until"
                value={new Date(quoteForm.valid_until)}
                onChange={(date) =>
                  setQuoteForm({
                    ...quoteForm,
                    valid_until: date?.toISOString().split("T")[0] || "",
                  })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={quoteForm.notes}
                onChange={(e) =>
                  setQuoteForm({
                    ...quoteForm,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Terms and Conditions"
                multiline
                rows={4}
                value={quoteForm.terms_and_conditions}
                onChange={(e) =>
                  setQuoteForm({
                    ...quoteForm,
                    terms_and_conditions: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateQuote}
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Creating...
              </>
            ) : (
              "Create Quote"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventQuotesCard;
