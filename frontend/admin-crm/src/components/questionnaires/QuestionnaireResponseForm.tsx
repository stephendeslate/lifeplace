// frontend/admin-crm/src/components/questionnaires/QuestionnaireResponseForm.tsx
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
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  QuestionnaireField,
  QuestionnaireResponse,
} from "../../types/questionnaires.types";

interface QuestionnaireResponseFormProps {
  fields: QuestionnaireField[];
  responses?: QuestionnaireResponse[];
  eventId: number;
  onSubmit: (
    eventId: number,
    responses: { field: number; value: string }[]
  ) => void;
  isSubmitting: boolean;
}

const QuestionnaireResponseForm: React.FC<QuestionnaireResponseFormProps> = ({
  fields,
  responses = [],
  eventId,
  onSubmit,
  isSubmitting,
}) => {
  // Organize responses by field ID for easy lookup
  const responsesByFieldId = responses.reduce((acc, response) => {
    acc[response.field] = response.value;
    return acc;
  }, {} as Record<number, string>);

  // State to track form values
  const [formValues, setFormValues] = useState<Record<number, string>>(() => {
    // Initialize with existing responses
    return { ...responsesByFieldId };
  });

  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleChange = (fieldId: number, value: string) => {
    setFormValues({
      ...formValues,
      [fieldId]: value,
    });

    // Clear error if it exists
    if (errors[fieldId]) {
      setErrors({
        ...errors,
        [fieldId]: "",
      });
    }
  };

  const handleMultiSelectChange = (
    fieldId: number,
    option: string,
    checked: boolean
  ) => {
    // Current selected options as array
    const currentValues =
      formValues[fieldId]
        ?.split(",")
        .map((v) => v.trim())
        .filter(Boolean) || [];

    // Update the array based on the checkbox change
    let newValues: string[];
    if (checked) {
      // Add option if not already included
      newValues = [...currentValues, option].filter(
        (v, i, a) => a.indexOf(v) === i
      );
    } else {
      // Remove option
      newValues = currentValues.filter((v) => v !== option);
    }

    // Update form values with the joined string
    handleChange(fieldId, newValues.join(", "));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    // Check each required field
    fields.forEach((field) => {
      if (
        field.required &&
        (!formValues[field.id] || formValues[field.id].trim() === "")
      ) {
        newErrors[field.id] = "This field is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert form values to the expected format
      const responseData = Object.entries(formValues).map(
        ([fieldId, value]) => ({
          field: parseInt(fieldId),
          value: value.toString(),
        })
      );

      onSubmit(eventId, responseData);
    }
  };

  const renderField = (field: QuestionnaireField) => {
    const value = formValues[field.id] || "";
    const error = errors[field.id] || "";

    switch (field.type) {
      case "text":
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        );

      case "number":
        return (
          <TextField
            fullWidth
            type="number"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
          />
        );

      case "date":
        return (
          <TextField
            fullWidth
            type="date"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            InputLabelProps={{ shrink: true }}
          />
        );

      case "time":
        return (
          <TextField
            fullWidth
            type="time"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            InputLabelProps={{ shrink: true }}
          />
        );

      case "email":
        return (
          <TextField
            fullWidth
            type="email"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            placeholder="email@example.com"
          />
        );

      case "phone":
        return (
          <TextField
            fullWidth
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
            placeholder="(123) 456-7890"
          />
        );

      case "boolean":
        return (
          <FormControl component="fieldset" error={!!error}>
            <RadioGroup
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case "select":
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel>{field.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value as string)}
              label={field.name}
            >
              <MenuItem value="">
                <em>Select an option</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case "multi-select":
        // For multi-select, we maintain a comma-separated list of values
        const selectedOptions = value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

        return (
          <FormControl fullWidth component="fieldset" error={!!error}>
            <FormGroup>
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={selectedOptions.includes(option)}
                      onChange={(e) =>
                        handleMultiSelectChange(
                          field.id,
                          option,
                          e.target.checked
                        )
                      }
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case "file":
        // For simplicity, file uploads are not fully implemented here
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              File upload not supported in this form
            </Typography>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={!!error}
            helperText={error}
          />
        );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        {fields.map((field) => (
          <Grid item xs={12} key={field.id}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle1">
                {field.name}
                {field.required && (
                  <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                    *
                  </Typography>
                )}
              </Typography>
              {renderField(field)}
            </Box>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Saving..." : "Save Responses"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionnaireResponseForm;
