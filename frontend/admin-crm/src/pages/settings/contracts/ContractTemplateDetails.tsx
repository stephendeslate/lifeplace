// frontend/admin-crm/src/pages/settings/contracts/ContractTemplateDetails.tsx
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContractTemplateForm } from "../../../components/contracts";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import {
  useContractTemplate,
  useContractTemplates,
} from "../../../hooks/useContracts";
import { useEventTypes } from "../../../hooks/useEventTypes";
import { ContractTemplateFormData } from "../../../types/contracts.types";

const ContractTemplateDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const templateId = id ? parseInt(id) : 0;
  const isEditMode = window.location.pathname.includes("/edit");

  // State for dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch template and event types
  const { template, isLoading, error } = useContractTemplate(templateId);
  const { eventTypes } = useEventTypes();
  const { updateTemplate, isUpdating, deleteTemplate, isDeleting } =
    useContractTemplates();

  // Handle navigation back to list
  const handleBackToList = () => {
    navigate("/settings/contracts/templates");
  };

  // Handle edit button click
  const handleEditClick = () => {
    navigate(`/settings/contracts/templates/${templateId}/edit`);
  };

  // Handle delete template
  const handleDeleteTemplate = () => {
    deleteTemplate(templateId);
    setDeleteDialogOpen(false);
    navigate("/settings/contracts/templates");
  };

  // Handle form submission (in edit mode)
  const handleUpdateTemplate = (formData: ContractTemplateFormData) => {
    updateTemplate({
      id: templateId,
      templateData: formData,
    });

    // Navigate back to view mode after successful update
    if (!isUpdating) {
      navigate(`/settings/contracts/templates/${templateId}`);
    }
  };

  // If loading
  if (isLoading) {
    return (
      <SettingsLayout
        title="Contract Template Details"
        description="Loading..."
      >
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      </SettingsLayout>
    );
  }

  // If error or template not found
  if (error || !template) {
    return (
      <SettingsLayout
        title="Contract Template Details"
        description="Error loading template"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading template. It may not exist or you may not have
          permission to view it.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
        >
          Back to Templates
        </Button>
      </SettingsLayout>
    );
  }

  // Prepare initial form values for edit mode
  const initialFormValues: ContractTemplateFormData = {
    name: template.name,
    description: template.description,
    event_type: template.event_type
      ? typeof template.event_type === "number"
        ? template.event_type
        : template.event_type.id
      : null,
    content: template.content,
    variables: template.variables || [],
    requires_signature: template.requires_signature,
    sections: template.sections || [],
  };

  return (
    <SettingsLayout
      title={
        isEditMode ? "Edit Contract Template" : "Contract Template Details"
      }
      description={template.name}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
        >
          Back to Templates
        </Button>

        {!isEditMode && (
          <Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
            >
              Edit
            </Button>
          </Box>
        )}
      </Box>

      {isEditMode ? (
        // Edit Mode Form
        <Paper sx={{ p: 3 }}>
          <ContractTemplateForm
            initialValues={initialFormValues}
            eventTypes={eventTypes}
            onSubmit={handleUpdateTemplate}
            isSubmitting={isUpdating}
            editMode
          />
        </Paper>
      ) : (
        // View Mode
        <>
          {/* Template Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {template.event_type ? (
                    typeof template.event_type === "number" ? (
                      <Chip
                        label="Specific Event Type"
                        color="primary"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label={`Event Type: ${template.event_type.name}`}
                        color="primary"
                        size="small"
                      />
                    )
                  ) : (
                    <Chip
                      label="All Event Types"
                      variant="outlined"
                      size="small"
                    />
                  )}

                  <Chip
                    label={
                      template.requires_signature
                        ? "Signature Required"
                        : "Signature Optional"
                    }
                    color={template.requires_signature ? "success" : "default"}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    borderLeft: { md: 1 },
                    borderColor: "divider",
                    pl: { md: 3 },
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(template.created_at), "MMMM d, yyyy")}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(template.updated_at), "MMMM d, yyyy")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Variables */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Template Variables
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {template.variables && template.variables.length > 0 ? (
                template.variables.map((variable) => (
                  <Chip key={variable} label={variable} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No variables defined for this template
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Sections */}
          {template.sections && template.sections.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contract Sections
              </Typography>

              {template.sections.map((section, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {section.title}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {section.content}
                  </Typography>
                  {index < template.sections.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
          )}

          {/* Content */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Template Content
            </Typography>
            <Box
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "#f5f5f5",
                maxHeight: "500px",
                overflow: "auto",
              }}
            >
              {template.content}
            </Box>
          </Paper>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Contract Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the template "{template.name}"? This
            action cannot be undone and may affect existing contracts based on
            this template.
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

export default ContractTemplateDetails;
