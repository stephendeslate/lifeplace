// frontend/admin-crm/src/components/bookingflow/steps/DateConfigForm.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { DateConfig } from "../../../types/bookingflow.types";

interface DateConfigFormProps {
  initialConfig?: DateConfig;
  onSave: (config: DateConfig) => void;
  isLoading?: boolean;
}

const DateConfigForm: React.FC<DateConfigFormProps> = ({
  initialConfig,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: DateConfig = {
    title: "Select a Date",
    description: "Please select a date and time for your event.",
    min_days_in_future: 1,
    max_days_in_future: 365,
    allow_time_selection: true,
    buffer_before_event: 0,
    buffer_after_event: 0,
    allow_multi_day: false,
    is_required: true,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<DateConfig>(
    initialConfig || defaultConfig
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;

    setConfig({
      ...config,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10) || 0
          : value,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!config.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (config.min_days_in_future < 0) {
      newErrors.min_days_in_future = "Cannot be negative";
      isValid = false;
    }

    if (config.max_days_in_future < config.min_days_in_future) {
      newErrors.max_days_in_future = "Must be greater than minimum days";
      isValid = false;
    }

    if (config.buffer_before_event < 0) {
      newErrors.buffer_before_event = "Cannot be negative";
      isValid = false;
    }

    if (config.buffer_after_event < 0) {
      newErrors.buffer_after_event = "Cannot be negative";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(config);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Date Selection Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure how clients select dates and times for their booking.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={config.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={config.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Days in Future"
                name="min_days_in_future"
                type="number"
                value={config.min_days_in_future}
                onChange={handleChange}
                error={!!errors.min_days_in_future}
                helperText={
                  errors.min_days_in_future ||
                  "Minimum days from today a client can book"
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Days in Future"
                name="max_days_in_future"
                type="number"
                value={config.max_days_in_future}
                onChange={handleChange}
                error={!!errors.max_days_in_future}
                helperText={
                  errors.max_days_in_future ||
                  "Maximum days from today a client can book"
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buffer Before Event (minutes)"
                name="buffer_before_event"
                type="number"
                value={config.buffer_before_event}
                onChange={handleChange}
                error={!!errors.buffer_before_event}
                helperText={
                  errors.buffer_before_event || "Buffer time before event start"
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buffer After Event (minutes)"
                name="buffer_after_event"
                type="number"
                value={config.buffer_after_event}
                onChange={handleChange}
                error={!!errors.buffer_after_event}
                helperText={
                  errors.buffer_after_event || "Buffer time after event end"
                }
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.allow_time_selection}
                    onChange={handleChange}
                    name="allow_time_selection"
                  />
                }
                label="Allow time selection"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.allow_multi_day}
                    onChange={handleChange}
                    name="allow_multi_day"
                  />
                }
                label="Allow multi-day events"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_required}
                    onChange={handleChange}
                    name="is_required"
                  />
                }
                label="Step is required"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.is_visible}
                    onChange={handleChange}
                    name="is_visible"
                  />
                }
                label="Step is visible"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DateConfigForm;
