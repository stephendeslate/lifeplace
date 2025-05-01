// frontend/admin-crm/src/components/bookingflow/steps/SummaryConfigForm.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { SummaryConfig } from "../../../types/bookingflow.types";

interface SummaryConfigFormProps {
  initialConfig?: SummaryConfig;
  onSave: (config: SummaryConfig) => void;
  isLoading?: boolean;
}

const SummaryConfigForm: React.FC<SummaryConfigFormProps> = ({
  initialConfig,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: SummaryConfig = {
    title: "Review Your Booking",
    description:
      "Please review your booking details before proceeding to payment.",
    show_date: true,
    show_packages: true,
    show_addons: true,
    show_questionnaire: true,
    show_total: true,
    is_required: true,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<SummaryConfig>(
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
          Summary Step Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure the booking summary page where clients review their
          selections.
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
              <Typography variant="subtitle1" gutterBottom>
                Summary Content
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose what information to display in the summary.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.show_date}
                        onChange={handleChange}
                        name="show_date"
                      />
                    }
                    label="Show selected date and time"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.show_packages}
                        onChange={handleChange}
                        name="show_packages"
                      />
                    }
                    label="Show selected packages"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.show_addons}
                        onChange={handleChange}
                        name="show_addons"
                      />
                    }
                    label="Show selected add-ons"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.show_questionnaire}
                        onChange={handleChange}
                        name="show_questionnaire"
                      />
                    }
                    label="Show questionnaire responses"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.show_total}
                        onChange={handleChange}
                        name="show_total"
                      />
                    }
                    label="Show total price"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
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

export default SummaryConfigForm;
