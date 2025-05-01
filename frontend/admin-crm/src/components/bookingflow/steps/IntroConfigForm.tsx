// frontend/admin-crm/src/components/bookingflow/steps/IntroConfigForm.tsx
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
import { IntroConfig } from "../../../types/bookingflow.types";

interface IntroConfigFormProps {
  initialConfig?: IntroConfig;
  onSave: (config: IntroConfig) => void;
  isLoading?: boolean;
}

const IntroConfigForm: React.FC<IntroConfigFormProps> = ({
  initialConfig,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: IntroConfig = {
    title: "Welcome",
    description:
      "Thank you for choosing our services. Let's get started with your booking.",
    show_event_details: true,
    is_required: true,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<IntroConfig>(
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
          Introduction Step Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure the introduction step that clients will see at the beginning
          of the booking process.
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

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.show_event_details}
                    onChange={handleChange}
                    name="show_event_details"
                  />
                }
                label="Show event details"
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

export default IntroConfigForm;
