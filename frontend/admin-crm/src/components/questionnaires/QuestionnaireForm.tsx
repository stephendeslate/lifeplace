// frontend/admin-crm/src/components/questionnaires/QuestionnaireForm.tsx
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { EventType } from "../../types/events.types";
import {
  QuestionnaireFieldFormData,
  QuestionnaireFormData,
  QuestionnaireFormErrors,
} from "../../types/questionnaires.types";
import QuestionnaireFieldForm from "./QuestionnaireFieldForm";
import QuestionnaireFieldsList from "./QuestionnaireFieldsList";

interface QuestionnaireFormProps {
  initialValues: QuestionnaireFormData;
  eventTypes: EventType[];
  onSubmit: (formData: QuestionnaireFormData) => void;
  isSubmitting: boolean;
  errors?: QuestionnaireFormErrors;
  editMode?: boolean;
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  initialValues,
  eventTypes,
  onSubmit,
  isSubmitting,
  errors = {},
  editMode = false,
}) => {
  const [formData, setFormData] =
    useState<QuestionnaireFormData>(initialValues);
  const [formErrors, setFormErrors] = useState<QuestionnaireFormErrors>(errors);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] =
    useState<QuestionnaireFieldFormData | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name) {
      setFormData({
        ...formData,
        [name]: name === "is_active" ? checked : value,
      });

      // Clear error when field is edited
      if (formErrors[name as keyof QuestionnaireFormErrors]) {
        setFormErrors({
          ...formErrors,
          [name]: undefined,
        });
      }
    }
  };

  const handleEventTypeChange = (event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      event_type: value === "" ? null : Number(value),
    });

    // Clear error when field is edited
    if (formErrors.event_type) {
      setFormErrors({
        ...formErrors,
        event_type: undefined,
      });
    }
  };

  const handleAddField = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default to ensure it doesn't submit the form
    e.preventDefault();
    e.stopPropagation();

    setEditingField(null);
    setEditingFieldIndex(null);
    setShowFieldForm(true);
  };

  const handleEditField = (
    field: QuestionnaireFieldFormData,
    index: number
  ) => {
    setEditingField(field);
    setEditingFieldIndex(index);
    setShowFieldForm(true);
  };

  const handleDeleteField = (index: number) => {
    const newFields = formData.fields?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      fields: newFields,
    });
  };

  const handleFieldSubmit = (fieldData: QuestionnaireFieldFormData) => {
    const newFields = [...(formData.fields || [])];

    if (editingFieldIndex !== null) {
      // Update existing field
      newFields[editingFieldIndex] = fieldData;
    } else {
      // Add new field
      newFields.push(fieldData);
    }

    setFormData({
      ...formData,
      fields: newFields,
    });

    setShowFieldForm(false);
    setEditingField(null);
    setEditingFieldIndex(null);
  };

  const handleFieldFormCancel = () => {
    setShowFieldForm(false);
    setEditingField(null);
    setEditingFieldIndex(null);
  };

  const handleReorderFields = (
    reorderedFields: QuestionnaireFieldFormData[]
  ) => {
    setFormData({
      ...formData,
      fields: reorderedFields,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: QuestionnaireFormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Questionnaire Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!formErrors.event_type}>
            <InputLabel id="event-type-label">Event Type (Optional)</InputLabel>
            <Select
              labelId="event-type-label"
              name="event_type"
              value={formData.event_type || ""}
              onChange={handleEventTypeChange}
              label="Event Type (Optional)"
            >
              <MenuItem value="">
                <em>All Event Types</em>
              </MenuItem>
              {eventTypes.map((eventType) => (
                <MenuItem key={eventType.id} value={eventType.id}>
                  {eventType.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.event_type && (
              <FormHelperText>{formErrors.event_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_active}
                  onChange={handleChange}
                  name="is_active"
                  color="primary"
                />
              }
              label="Active"
            />
          </FormGroup>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Questionnaire Fields
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddField}
              disabled={showFieldForm}
              type="button" // Explicitly set button type to prevent form submission
            >
              Add Field
            </Button>
          </Box>

          {showFieldForm && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {editingField ? "Edit Field" : "Add New Field"}
              </Typography>
              <QuestionnaireFieldForm
                initialValues={
                  editingField || {
                    name: "",
                    type: "text",
                    required: false,
                    order: (formData.fields?.length || 0) + 1,
                    options: [],
                  }
                }
                onSubmit={handleFieldSubmit}
                onCancel={handleFieldFormCancel}
              />
            </Box>
          )}

          {formData.fields && formData.fields.length > 0 ? (
            <QuestionnaireFieldsList
              fields={formData.fields}
              onEditField={handleEditField}
              onDeleteField={handleDeleteField}
              onReorderFields={handleReorderFields}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No fields added yet. Click "Add Field" to create your first field.
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting
                ? "Saving..."
                : editMode
                ? "Update Questionnaire"
                : "Create Questionnaire"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionnaireForm;
