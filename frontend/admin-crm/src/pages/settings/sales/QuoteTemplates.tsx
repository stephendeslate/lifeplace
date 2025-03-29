// frontend/admin-crm/src/pages/settings/sales/QuoteTemplates.tsx
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
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
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useEventTypes } from "../../../hooks/useEventTypes";
import { useQuoteTemplates } from "../../../hooks/useSales";
import { EventType } from "../../../types/events.types";
import {
  QuoteTemplate,
  QuoteTemplateFilters,
} from "../../../types/sales.types";

const QuoteTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<QuoteTemplateFilters>({});
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<
    number | undefined
  >(undefined);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<QuoteTemplate | null>(null);

  // Use our custom hooks
  const { eventTypes } = useEventTypes();
  const { templates, totalCount, isLoading, deleteTemplate, isDeleting } =
    useQuoteTemplates(page, filters);

  // Handle search
  const handleSearch = () => {
    setFilters({
      ...filters,
      search: searchTerm,
      event_type: selectedEventType,
      is_active: showActiveOnly ? true : undefined,
    });
    setPage(1);
  };

  // Handle event type change
  const handleEventTypeChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value === "" ? undefined : Number(e.target.value);
    setSelectedEventType(value);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedEventType(undefined);
    setShowActiveOnly(false);
    setFilters({});
    setPage(1);
  };

  // Handle delete template
  const handleDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <SettingsLayout
      title="Quote Templates"
      description="Manage quote templates for creating standardized quotes for events"
    >
      {/* Search and filter section */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search templates"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="event-type-label">Event Type</InputLabel>
              <Select
                labelId="event-type-label"
                value={selectedEventType || ""}
                label="Event Type"
                onChange={handleEventTypeChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Event Types</MenuItem>
                {eventTypes.map((type: EventType) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                />
              }
              label="Active only"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                size="small"
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                size="small"
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* New template button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/settings/sales/quote-templates/new")}
        >
          New Quote Template
        </Button>
      </Box>

      {/* Templates list */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No quote templates found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first quote template to streamline your sales process
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/settings/sales/quote-templates/new")}
          >
            Create Template
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" noWrap sx={{ maxWidth: "70%" }}>
                      {template.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Edit Template">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(
                              `/settings/sales/quote-templates/${template.id}/edit`
                            )
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Template">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setTemplateToDelete(template);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {template.introduction || "No description provided"}
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                  >
                    {template.event_type_name && (
                      <Chip
                        label={template.event_type_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={template.is_active ? "Active" : "Inactive"}
                      size="small"
                      color={template.is_active ? "success" : "default"}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {template.products?.length || 0} products
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created{" "}
                      {formatDistanceToNow(new Date(template.created_at), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      navigate(`/settings/sales/quote-templates/${template.id}`)
                    }
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Quote Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the quote template "
            {templateToDelete?.name}"? This action cannot be undone and may
            affect any quotes that use this template.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteTemplate}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={16} />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default QuoteTemplates;
