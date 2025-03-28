// frontend/admin-crm/src/components/questionnaires/QuestionnaireFieldForm.tsx
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
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
import {
  FieldType,
  QuestionnaireFieldFormData,
  QuestionnaireFieldFormErrors,
} from "../../types/questionnaires.types";

interface QuestionnaireFieldFormProps {
  initialValues: Partial<QuestionnaireFieldFormData>;
  onSubmit: (formData: QuestionnaireFieldFormData) => void;
  onCancel: () => void;
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "boolean", label: "Yes/No" },
  { value: "select", label: "Select (Single Choice)" },
  { value: "multi-select", label: "Multi-Select (Multiple Choice)" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "file", label: "File Upload" },
];

const QuestionnaireFieldForm: React.FC<QuestionnaireFieldFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<QuestionnaireFieldFormData>({
    name: initialValues.name || "",
    type: initialValues.type || "text",
    required: initialValues.required ?? false,
    order: initialValues.order || 1,
    options: initialValues.options || [],
  });

  const [errors, setErrors] = useState<QuestionnaireFieldFormErrors>({});
  const [newOption, setNewOption] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;

    if (name) {
      setFormData({
        ...formData,
        [name]: name === "required" ? checked : value,
      });

      // Clear error when field is edited
      if (errors[name as keyof QuestionnaireFieldFormErrors]) {
        setErrors({
          ...errors,
          [name]: undefined,
        });
      }
    }
  };

  const handleTypeChange = (e: SelectChangeEvent<FieldType>) => {
    const value = e.target.value as FieldType;
    setFormData({
      ...formData,
      type: value,
      // Reset options when changing away from select types
      options:
        value === "select" || value === "multi-select" ? formData.options : [],
    });
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;

    if (formData.options?.includes(newOption.trim())) {
      setErrors({
        ...errors,
        options: "Option already exists",
      });
      return;
    }

    setFormData({
      ...formData,
      options: [...(formData.options || []), newOption.trim()],
    });
    setNewOption("");

    // Clear options error if it exists
    if (errors.options) {
      setErrors({
        ...errors,
        options: undefined,
      });
    }
  };

  const handleDeleteOption = (optionToDelete: string) => {
    setFormData({
      ...formData,
      options:
        formData.options?.filter((option) => option !== optionToDelete) || [],
    });
  };

  const validateForm = (): boolean => {
    const newErrors: QuestionnaireFieldFormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (formData.order <= 0) {
      newErrors.order = "Order must be a positive number";
      isValid = false;
    }

    // Check if options are provided for select types
    if (
      (formData.type === "select" || formData.type === "multi-select") &&
      (!formData.options || formData.options.length === 0)
    ) {
      newErrors.options = "At least one option is required for select fields";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Field Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="field-type-label">Field Type</InputLabel>
            <Select
              labelId="field-type-label"
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              label="Field Type"
            >
              {fieldTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            error={!!errors.order}
            helperText={errors.order}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.required}
                onChange={handleChange}
                name="required"
                color="primary"
              />
            }
            label="Required Field"
          />
        </Grid>

        {/* Options section for select and multi-select types */}
        {(formData.type === "select" || formData.type === "multi-select") && (
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    label="Add Option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    error={!!errors.options}
                    helperText={errors.options}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddOption}
                    fullWidth
                    sx={{ height: "100%" }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {formData.options?.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onDelete={() => handleDeleteOption(option)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}

              {(!formData.options || formData.options.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No options added yet
                </Typography>
              )}
            </Box>

            {formData.type === "select" || formData.type === "multi-select" ? (
              <FormHelperText>
                Add the options that users will be able to select from
              </FormHelperText>
            ) : null}
          </Grid>
        )}

        <Grid item xs={12}>
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {initialValues.name ? "Update Field" : "Add Field"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuestionnaireFieldForm;
