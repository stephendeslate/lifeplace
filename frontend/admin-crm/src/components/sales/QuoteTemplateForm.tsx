// frontend/admin-crm/src/components/sales/QuoteTemplateForm.tsx
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventTypes } from "../../hooks/useEventTypes";
import { useQuoteTemplates } from "../../hooks/useSales";
import {
  QuoteTemplateFormData,
  QuoteTemplateFormErrors,
} from "../../types/sales.types";

import { SelectChangeEvent } from "@mui/material/Select";

interface QuoteTemplateFormProps {
  initialValues?: any;
  isNewTemplate?: boolean;
}

const QuoteTemplateForm: React.FC<QuoteTemplateFormProps> = ({
  initialValues,
  isNewTemplate = false,
}) => {
  const navigate = useNavigate();

  // Default initial form values
  const defaultValues: QuoteTemplateFormData = {
    name: "",
    introduction: "",
    event_type: null,
    terms_and_conditions: "",
    is_active: true,
  };

  // State for form values and errors
  const [formValues, setFormValues] = useState<QuoteTemplateFormData>(
    initialValues || defaultValues
  );
  const [formErrors, setFormErrors] = useState<QuoteTemplateFormErrors>({});

  // Get event types
  const { eventTypes, isLoading: isLoadingEventTypes } = useEventTypes();

  // Get templates hooks for actions
  const { createTemplate, isCreating, updateTemplate, isUpdating } =
    useQuoteTemplates();

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error on change
    if (formErrors[name as keyof QuoteTemplateFormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  // Handle event type selection
  const handleEventTypeChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    setFormValues({
      ...formValues,
      event_type: value,
    });

    // Clear error if needed
    if (formErrors.event_type) {
      setFormErrors({
        ...formErrors,
        event_type: undefined,
      });
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: QuoteTemplateFormErrors = {};
    let isValid = true;

    if (!formValues.name || formValues.name.trim() === "") {
      errors.name = "Template name is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isNewTemplate) {
      // Create new template
      createTemplate(formValues, {
        onSuccess: (data) => {
          navigate(`/settings/sales/quote-templates/${data.id}`);
        },
      });
    } else if (initialValues) {
      // Update existing template
      updateTemplate(
        {
          id: initialValues.id,
          templateData: formValues,
        },
        {
          onSuccess: (data) => {
            navigate(`/settings/sales/quote-templates/${data.id}`);
          },
        }
      );
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    if (isNewTemplate) {
      navigate("/settings/sales/quote-templates");
    } else if (initialValues) {
      navigate(`/settings/sales/quote-templates/${initialValues.id}`);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Template Name"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
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
              value={formValues.event_type || ""}
              onChange={handleEventTypeChange}
              label="Event Type (Optional)"
            >
              <MenuItem value="">
                <em>None (All Event Types)</em>
              </MenuItem>
              {eventTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.event_type && (
              <FormHelperText>{formErrors.event_type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formValues.is_active}
                onChange={handleInputChange}
                name="is_active"
              />
            }
            label="Active"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Introduction"
            name="introduction"
            value={formValues.introduction || ""}
            onChange={handleInputChange}
            multiline
            minRows={3}
            placeholder="Introduction text will appear at the beginning of quotes"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Terms and Conditions"
            name="terms_and_conditions"
            value={formValues.terms_and_conditions || ""}
            onChange={handleInputChange}
            multiline
            minRows={5}
            placeholder="Terms and conditions to include in quotes"
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting
                ? isNewTemplate
                  ? "Creating..."
                  : "Updating..."
                : isNewTemplate
                ? "Create Template"
                : "Update Template"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default QuoteTemplateForm;
