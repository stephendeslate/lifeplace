// frontend/admin-crm/src/pages/settings/questionnaires/QuestionnaireDetails.tsx
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Alert,
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
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  QuestionnaireFieldForm,
  QuestionnaireForm,
} from "../../../components/questionnaires";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { useEventTypes } from "../../../hooks/useEventTypes";
import { useQuestionnaire } from "../../../hooks/useQuestionnaires";
import {
  QuestionnaireField,
  QuestionnaireFieldFormData,
  QuestionnaireFormData,
} from "../../../types/questionnaires.types";

const QuestionnaireDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const questionnaireId = id ? parseInt(id) : 0;

  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [deleteFieldDialogOpen, setDeleteFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<QuestionnaireField | null>(
    null
  );
  const [editingField, setEditingField] =
    useState<QuestionnaireFieldFormData | null>(null);

  const { eventTypes } = useEventTypes();
  const {
    questionnaire,
    isLoading,
    error,
    updateQuestionnaire,
    isUpdating,
    deleteQuestionnaire,
    isDeleting,
    updateField,
    createField,
    deleteField,
    isDeletingField,
    reorderFields,
    isReorderingFields,
  } = useQuestionnaire(questionnaireId);

  // Initialize form data when questionnaire is loaded
  const [formData, setFormData] = useState<QuestionnaireFormData>({
    name: "",
    event_type: null,
    is_active: true,
    order: 1,
    fields: [],
  });

  // Update form data when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      setFormData({
        name: questionnaire.name,
        event_type:
          typeof questionnaire.event_type === "number"
            ? questionnaire.event_type
            : questionnaire.event_type?.id || null,
        is_active: questionnaire.is_active,
        order: questionnaire.order,
        fields: [], // Fields are handled separately via the fields property of questionnaire
      });
    }
  }, [questionnaire]);

  const handleBackToList = () => {
    navigate("/settings/questionnaires");
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleUpdateQuestionnaire = (data: QuestionnaireFormData) => {
    updateQuestionnaire(data);
    setEditMode(false);
  };

  const handleDeleteQuestionnaire = () => {
    deleteQuestionnaire();
    setDeleteDialogOpen(false);
    navigate("/settings/questionnaires");
  };

  const handleAddField = () => {
    setEditingField(null);
    setFieldDialogOpen(true);
  };

  const handleEditField = (field: QuestionnaireField) => {
    setEditingField({
      name: field.name,
      type: field.type,
      required: field.required,
      order: field.order,
      options: field.options || [],
      questionnaire: questionnaireId,
    });
    setSelectedField(field);
    setFieldDialogOpen(true);
  };

  const handleDeleteFieldConfirm = (field: QuestionnaireField) => {
    setSelectedField(field);
    setDeleteFieldDialogOpen(true);
  };

  const handleDeleteField = () => {
    if (selectedField) {
      deleteField(selectedField.id);
      setDeleteFieldDialogOpen(false);
      setSelectedField(null);
    }
  };

  const handleFieldSubmit = (fieldData: QuestionnaireFieldFormData) => {
    if (selectedField) {
      // Update existing field
      updateField({
        fieldId: selectedField.id,
        fieldData: {
          ...fieldData,
          questionnaire: questionnaireId,
        },
      });
    } else {
      // Create new field
      createField({
        ...fieldData,
        questionnaire: questionnaireId,
      });
    }
    setFieldDialogOpen(false);
    setSelectedField(null);
    setEditingField(null);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !questionnaire?.fields) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    // Type assertion when creating newFields
    const newFields = [...questionnaire.fields] as QuestionnaireField[];
    const [removed] = newFields.splice(startIndex, 1);
    newFields.splice(endIndex, 0, removed);

    // Create the order mapping for the backend
    const orderMapping: Record<string, number> = {};
    newFields.forEach((field, index) => {
      orderMapping[field.id.toString()] = index + 1;
    });

    reorderFields(orderMapping);
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Questionnaire Details" description="Loading...">
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      </SettingsLayout>
    );
  }

  if (error || !questionnaire) {
    return (
      <SettingsLayout
        title="Questionnaire Details"
        description="Error loading questionnaire"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading questionnaire. It may not exist or you may not have
          permission to view it.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
        >
          Back to Questionnaires
        </Button>
      </SettingsLayout>
    );
  }

  const filteredFields = questionnaire.fields || [];

  return (
    <SettingsLayout
      title={`${editMode ? "Edit" : "View"} Questionnaire`}
      description={questionnaire.name}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
        >
          Back to Questionnaires
        </Button>
        <Box>
          {editMode ? (
            <Button
              variant="outlined"
              onClick={handleEditToggle}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
          ) : (
            <>
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
                onClick={handleEditToggle}
              >
                Edit
              </Button>
            </>
          )}
        </Box>
      </Box>

      {editMode ? (
        <Paper sx={{ p: 3, mb: 4 }}>
          <QuestionnaireForm
            initialValues={formData}
            eventTypes={eventTypes}
            onSubmit={handleUpdateQuestionnaire}
            isSubmitting={isUpdating}
            editMode
          />
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {questionnaire.name}
              </Typography>
              <Box sx={{ display: "flex", mb: 1, gap: 1 }}>
                <Chip
                  label={questionnaire.is_active ? "Active" : "Inactive"}
                  color={questionnaire.is_active ? "success" : "default"}
                  size="small"
                />
                {questionnaire.event_type &&
                  typeof questionnaire.event_type !== "number" && (
                    <Chip
                      label={`Event Type: ${questionnaire.event_type.name}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
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
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {new Date(questionnaire.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Fields ({filteredFields.length || 0})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddField}
        >
          Add Field
        </Button>
      </Box>

      {filteredFields.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields-list">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ mb: 4 }}
              >
                {filteredFields.map(
                  (field: QuestionnaireField, index: number) => (
                    <Draggable
                      key={`field-${field.id}`}
                      draggableId={`field-${field.id}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            mb: 2,
                            position: "relative",
                            boxShadow: snapshot.isDragging
                              ? "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
                              : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                            transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
                            bgcolor: snapshot.isDragging
                              ? "rgba(144, 202, 249, 0.08)"
                              : "background.paper",
                            // Add a subtle transition effect when reordering
                            transform:
                              isReorderingFields && !snapshot.isDragging
                                ? "scale(0.99)"
                                : "scale(1)",
                            opacity:
                              isReorderingFields && !snapshot.isDragging
                                ? 0.7
                                : 1,
                          }}
                        >
                          {isReorderingFields && !snapshot.isDragging && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "rgba(255, 255, 255, 0.6)",
                                zIndex: 1,
                                borderRadius: 1,
                              }}
                            >
                              <CircularProgress size={20} />
                            </Box>
                          )}
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  mr: 2,
                                  color: "text.secondary",
                                  cursor: "grab",
                                }}
                              >
                                <DragIcon />
                              </Box>
                              <Box sx={{ flexGrow: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ mr: 1 }}
                                  >
                                    {field.name}
                                  </Typography>
                                  {field.required && (
                                    <Chip
                                      size="small"
                                      label="Required"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  )}
                                  <Chip
                                    size="small"
                                    label={`Order: ${field.order}`}
                                    sx={{ ml: 1 }}
                                    variant="outlined"
                                  />
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Chip
                                    size="small"
                                    label={field.type_display || field.type}
                                  />
                                  {field.options &&
                                    field.options.length > 0 && (
                                      <Chip
                                        size="small"
                                        label={`${field.options.length} options`}
                                        variant="outlined"
                                      />
                                    )}
                                </Box>
                              </Box>
                              <Box>
                                <IconButton
                                  onClick={() => handleEditField(field)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    handleDeleteFieldConfirm(field)
                                  }
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  )
                )}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          No fields added yet. Click "Add Field" to start building your
          questionnaire.
        </Alert>
      )}

      {/* Delete Questionnaire Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Questionnaire</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the questionnaire "
            {questionnaire.name}"? This action cannot be undone and all
            associated responses will be deleted.
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

      {/* Add/Edit Field Dialog */}
      <Dialog
        open={fieldDialogOpen}
        onClose={() => setFieldDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingField ? "Edit Field" : "Add Field"}</DialogTitle>
        <DialogContent>
          <QuestionnaireFieldForm
            initialValues={
              editingField || {
                name: "",
                type: "text",
                required: false,
                order: (filteredFields.length || 0) + 1,
                options: [],
              }
            }
            onSubmit={handleFieldSubmit}
            onCancel={() => setFieldDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Field Dialog */}
      <Dialog
        open={deleteFieldDialogOpen}
        onClose={() => setDeleteFieldDialogOpen(false)}
      >
        <DialogTitle>Delete Field</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the field "{selectedField?.name}"?
            This action cannot be undone and all associated responses will be
            deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteFieldDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteField}
            color="error"
            variant="contained"
            disabled={isDeletingField}
          >
            {isDeletingField ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsLayout>
  );
};

export default QuestionnaireDetails;
