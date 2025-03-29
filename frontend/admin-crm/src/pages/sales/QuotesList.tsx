// frontend/admin-crm/src/pages/sales/QuotesList.tsx
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  FileCopy as DuplicateIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/common/Layout";
import { useEventQuotes } from "../../hooks/useSales";
import { EventQuote } from "../../types/sales.types";
import { formatCurrency } from "../../utils/formatters";

const QuotesList: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQuotes, setFilterQuotes] = useState<EventQuote[]>([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<EventQuote | null>(null);

  // Get quotes for this event
  const {
    quotes,
    isLoading,
    error,
    deleteQuote,
    isDeleting,
    sendQuote,
    isSending,
    duplicateQuote,
    isDuplicating,
  } = useEventQuotes(eventId ? parseInt(eventId) : undefined);

  // Filter quotes based on search term
  useEffect(() => {
    if (quotes) {
      const filtered = quotes.filter(
        (quote) =>
          quote.id.toString().includes(searchTerm) ||
          quote.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (quote.event_details?.name &&
            quote.event_details.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilterQuotes(filtered);
    }
  }, [quotes, searchTerm]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view quote
  const handleViewQuote = (quoteId: number) => {
    navigate(`/sales/quotes/${quoteId}`);
  };

  // Handle edit quote
  const handleEditQuote = (quoteId: number) => {
    navigate(`/sales/quotes/${quoteId}/edit`);
  };

  // Handle send quote
  const handleSendQuote = (quoteId: number) => {
    sendQuote(quoteId);
  };

  // Handle duplicate quote
  const handleDuplicateQuote = (quoteId: number) => {
    duplicateQuote(quoteId);
  };

  // Handle delete quote
  const handleDeleteClick = (quote: EventQuote) => {
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      deleteQuote(quoteToDelete.id);
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    }
  };

  // Handle create new quote
  const handleCreateQuote = () => {
    navigate(`/sales/quotes/new${eventId ? `?eventId=${eventId}` : ""}`);
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">
            {eventId ? "Event Quotes" : "All Quotes"}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateQuote}
          >
            Create Quote
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search quotes"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error.message}</Typography>
        ) : filterQuotes.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No quotes found
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {searchTerm
                ? "No quotes match your search criteria."
                : "There are no quotes yet."}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateQuote}
            >
              Create Quote
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quote ID</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterQuotes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>Q-{quote.id}</TableCell>
                      <TableCell>
                        {quote.event_details?.name || String(quote.event)}
                      </TableCell>
                      <TableCell>{quote.version}</TableCell>
                      <TableCell>
                        <Chip
                          label={quote.status_display || quote.status}
                          color={getStatusChipColor(quote.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(quote.total_amount)}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(quote.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => handleViewQuote(quote.id)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {quote.status === "DRAFT" && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditQuote(quote.id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Send to Client">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleSendQuote(quote.id)}
                                  disabled={isSending}
                                >
                                  <SendIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip title="Duplicate">
                            <IconButton
                              size="small"
                              onClick={() => handleDuplicateQuote(quote.id)}
                              disabled={isDuplicating}
                            >
                              <DuplicateIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {quote.status !== "ACCEPTED" && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(quote)}
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filterQuotes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
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
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default QuotesList;
