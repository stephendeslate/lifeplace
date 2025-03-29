// frontend/admin-crm/src/pages/settings/contracts/ContractTemplates.tsx
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ContractTemplateForm,
  ContractTemplateList,
} from "../../../components/contracts";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useContractTemplates } from "../../../hooks/useContracts";
import { useEventTypes } from "../../../hooks/useEventTypes";
import {
  ContractTemplate,
  ContractTemplateFilters,
  ContractTemplateFormData,
} from "../../../types/contracts.types";

const ContractTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ContractTemplateFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ContractTemplate | null>(null);

  // Initialize with default values for new template
  const initialFormValues: ContractTemplateFormData = {
    name: "",
    description: "",
    event_type: null,
    content: "",
    variables: [],
    requires_signature: true,
    sections: [],
  };

  // Fetch contract templates with filters
  const {
    templates,
    totalCount,
    isLoading,
    createTemplate,
    isCreating,
    deleteTemplate,
    isDeleting,
  } = useContractTemplates(page + 1, filters);

  // Fetch event types for template form
  const { eventTypes } = useEventTypes();

  // Handle page change in pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle filter change
  const handleFilterChange = (
    field: keyof ContractTemplateFilters,
    value: any
  ) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange("search", e.target.value);
  };

  // Handle event type filter change
  const handleEventTypeChange = (e: SelectChangeEvent<number | string>) => {
    const value = e.target.value === "" ? undefined : Number(e.target.value);
    handleFilterChange("event_type", value);
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };

  // Handle create template
  const handleCreateTemplate = (formData: ContractTemplateFormData) => {
    createTemplate(formData);
    setCreateDialogOpen(false);
  };

  // Handle delete template confirmation
  const handleDeleteTemplate = () => {
    if (selectedTemplate) {
      deleteTemplate(selectedTemplate.id);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  // Handle view template details
  const handleViewTemplate = (template: ContractTemplate) => {
    navigate(`/settings/contracts/templates/${template.id}`);
  };

  // Handle edit template
  const handleEditTemplate = (template: ContractTemplate) => {
    navigate(`/settings/contracts/templates/${template.id}/edit`);
  };

  return (
    <SettingsLayout
      title="Contract Templates"
      description="Manage legal contract templates for various event types"
    >
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={toggleFilters}
              size="medium"
            >
              Filters
            </Button>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size="medium"
            >
              New
            </Button>
          </Grid>
        </Grid>

        {showFilters && (
          <Box
            sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="event-type-filter-label">
                    Event Type
                  </InputLabel>
                  <Select
                    labelId="event-type-filter-label"
                    value={filters.event_type || ""}
                    onChange={handleEventTypeChange}
                    label="Event Type"
                  >
                    <MenuItem value="">All Event Types</MenuItem>
                    {eventTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="text" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {templates.length === 0 && !isLoading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            textAlign: "center",
          }}
        >
          <DescriptionIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No Contract Templates Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {filters.search || filters.event_type
              ? "Try adjusting your search or filters"
              : "Create your first contract template to get started"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Template
          </Button>
        </Box>
      ) : (
        <ContractTemplateList
          templates={templates}
          isLoading={isLoading}
          totalCount={totalCount}
          page={page}
          onPageChange={handlePageChange}
          onView={handleViewTemplate}
          onEdit={handleEditTemplate}
          onDelete={(template) => {
            setSelectedTemplate(template);
            setDeleteDialogOpen(true);
          }}
        />
      )}

      {/* Create Template Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Create New Contract Template</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <ContractTemplateForm
              initialValues={initialFormValues}
              eventTypes={eventTypes}
              onSubmit={handleCreateTemplate}
              isSubmitting={isCreating}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Contract Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the template "
            {selectedTemplate?.name}"? This action cannot be undone and may
            affect existing contracts based on this template.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteTemplate}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default ContractTemplates;
