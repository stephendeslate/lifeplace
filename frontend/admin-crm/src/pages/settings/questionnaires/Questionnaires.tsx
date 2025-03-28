// frontend/admin-crm/src/pages/settings/questionnaires/Questionnaires.tsx
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Assignment as QuestionnaireIcon,
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
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionnaireList } from "../../../components/questionnaires";
import QuestionnaireForm from "../../../components/questionnaires/QuestionnaireForm";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useEventTypes } from "../../../hooks/useEventTypes";
import { useQuestionnaires } from "../../../hooks/useQuestionnaires";
import {
  QuestionnaireFilters,
  QuestionnaireFormData,
} from "../../../types/questionnaires.types";

const Questionnaires: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<QuestionnaireFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<
    number | null
  >(null);

  // Initialize with default values for new questionnaire
  const initialFormValues: QuestionnaireFormData = {
    name: "",
    event_type: null,
    is_active: true,
    order: 1,
    fields: [],
  };

  const { eventTypes } = useEventTypes();

  const {
    questionnaires,
    totalCount,
    isLoading,
    createQuestionnaire,
    isCreating,
    deleteQuestionnaire,
    isDeleting,
  } = useQuestionnaires(page + 1, filters);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (
    field: keyof QuestionnaireFilters,
    value: any
  ) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange("search", e.target.value);
  };

  const handleEventTypeChange = (e: SelectChangeEvent<number | string>) => {
    const value = e.target.value;
    handleFilterChange("event_type", value === "" ? undefined : Number(value));
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange("is_active", e.target.checked);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleCreateQuestionnaire = (formData: QuestionnaireFormData) => {
    createQuestionnaire(formData);
    setCreateDialogOpen(false);
  };

  const handleDeleteQuestionnaire = () => {
    if (selectedQuestionnaireId) {
      deleteQuestionnaire(selectedQuestionnaireId);
      setDeleteDialogOpen(false);
      setSelectedQuestionnaireId(null);
    }
  };

  const handleViewQuestionnaire = (questionnaire: any) => {
    navigate(`/settings/questionnaires/${questionnaire.id}`);
  };

  return (
    <SettingsLayout
      title="Questionnaires"
      description="Manage client information questionnaires"
    >
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search questionnaires..."
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.is_active}
                      onChange={handleActiveChange}
                      color="primary"
                    />
                  }
                  label="Show Active Only"
                />
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

      {questionnaires.length === 0 && !isLoading ? (
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
          <QuestionnaireIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No Questionnaires Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {filters.search || filters.event_type || filters.is_active
              ? "Try adjusting your search or filters"
              : "Create your first questionnaire to gather client information"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Questionnaire
          </Button>
        </Box>
      ) : (
        <QuestionnaireList
          questionnaires={questionnaires}
          isLoading={isLoading}
          totalCount={totalCount}
          page={page}
          onPageChange={handlePageChange}
          onView={handleViewQuestionnaire}
          onEdit={handleViewQuestionnaire}
          onDelete={(questionnaire) => {
            setSelectedQuestionnaireId(questionnaire.id);
            setDeleteDialogOpen(true);
          }}
        />
      )}

      {/* Create Questionnaire Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Questionnaire</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <QuestionnaireForm
              initialValues={initialFormValues}
              eventTypes={eventTypes}
              onSubmit={handleCreateQuestionnaire}
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
        <DialogTitle>Delete Questionnaire</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this questionnaire? This action
            cannot be undone and all associated responses will be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteQuestionnaire}
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

export default Questionnaires;
