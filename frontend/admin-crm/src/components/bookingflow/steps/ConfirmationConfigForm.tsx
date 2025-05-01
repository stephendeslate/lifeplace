// frontend/admin-crm/src/components/bookingflow/steps/ConfirmationConfigForm.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormHelperText,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ConfirmationConfig } from "../../../types/bookingflow.types";

interface ConfirmationConfigFormProps {
  initialConfig?: ConfirmationConfig;
  onSave: (config: ConfirmationConfig) => void;
  isLoading?: boolean;
}

const ConfirmationConfigForm: React.FC<ConfirmationConfigFormProps> = ({
  initialConfig,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: ConfirmationConfig = {
    title: "Booking Confirmed",
    description: "Thank you for your booking.",
    success_message:
      "We have received your booking and payment. You will receive a confirmation email shortly.",
    send_email: true,
    email_template: "booking_confirmation",
    show_summary: true,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<ConfirmationConfig>(
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
      [name]: type === "checkbox" ? checked : value,
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

    if (!config.success_message.trim()) {
      newErrors.success_message = "Success message is required";
      isValid = false;
    }

    if (config.send_email && !config.email_template.trim()) {
      newErrors.email_template =
        "Email template is required when sending emails";
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
          Confirmation Step Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure the final confirmation page shown to clients after
          successful booking.
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
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Success Message"
                name="success_message"
                value={config.success_message}
                onChange={handleChange}
                error={!!errors.success_message}
                helperText={
                  errors.success_message ||
                  "The main message shown on successful booking completion"
                }
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.send_email}
                    onChange={handleChange}
                    name="send_email"
                  />
                }
                label="Send confirmation email"
              />
            </Grid>

            {config.send_email && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Template"
                  name="email_template"
                  value={config.email_template}
                  onChange={handleChange}
                  error={!!errors.email_template}
                  helperText={
                    errors.email_template ||
                    "Template name for confirmation emails"
                  }
                  required
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.show_summary}
                    onChange={handleChange}
                    name="show_summary"
                  />
                }
                label="Show booking summary on confirmation page"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
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
              <FormHelperText>
                Note: This step is always required when visible as it's the
                final step
              </FormHelperText>
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

export default ConfirmationConfigForm;
