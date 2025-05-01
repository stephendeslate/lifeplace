// frontend/admin-crm/src/components/bookingflow/steps/PaymentConfigForm.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { PaymentConfig } from "../../../types/bookingflow.types";

interface PaymentConfigFormProps {
  initialConfig?: PaymentConfig;
  onSave: (config: PaymentConfig) => void;
  isLoading?: boolean;
}

const PaymentConfigForm: React.FC<PaymentConfigFormProps> = ({
  initialConfig,
  onSave,
  isLoading = false,
}) => {
  // Default values for new configurations
  const defaultConfig: PaymentConfig = {
    title: "Payment",
    description: "Please complete your payment to confirm your booking.",
    require_deposit: false,
    deposit_percentage: 50,
    accept_credit_card: true,
    accept_paypal: false,
    accept_bank_transfer: false,
    payment_instructions: "",
    is_required: true,
    is_visible: true,
  };

  // Form state
  const [config, setConfig] = useState<PaymentConfig>(
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

  // Handle deposit percentage slider change
  const handleDepositChange = (event: Event, newValue: number | number[]) => {
    setConfig({
      ...config,
      deposit_percentage: newValue as number,
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!config.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (config.deposit_percentage < 1 || config.deposit_percentage > 100) {
      newErrors.deposit_percentage =
        "Deposit percentage must be between 1 and 100";
      isValid = false;
    }

    // Check that at least one payment method is enabled
    if (
      !config.accept_credit_card &&
      !config.accept_paypal &&
      !config.accept_bank_transfer
    ) {
      newErrors.payment_methods = "At least one payment method must be enabled";
      isValid = false;
    }

    if (config.accept_bank_transfer && !config.payment_instructions.trim()) {
      newErrors.payment_instructions =
        "Payment instructions are required for bank transfers";
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
          Payment Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure payment options and requirements for the booking process.
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
                Deposit Options
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={config.require_deposit}
                    onChange={handleChange}
                    name="require_deposit"
                  />
                }
                label="Allow partial payment (deposit)"
              />

              {config.require_deposit && (
                <Box sx={{ mt: 2 }}>
                  <Typography id="deposit-slider" gutterBottom>
                    Deposit percentage: {config.deposit_percentage}%
                  </Typography>
                  <Slider
                    value={config.deposit_percentage}
                    onChange={handleDepositChange}
                    aria-labelledby="deposit-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={10}
                    max={90}
                    sx={{ maxWidth: 400 }}
                  />
                  {errors.deposit_percentage && (
                    <Typography color="error" variant="caption">
                      {errors.deposit_percentage}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Methods
              </Typography>

              {errors.payment_methods && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.payment_methods}
                </Typography>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.accept_credit_card}
                        onChange={handleChange}
                        name="accept_credit_card"
                      />
                    }
                    label="Credit/Debit Card"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.accept_paypal}
                        onChange={handleChange}
                        name="accept_paypal"
                      />
                    }
                    label="PayPal"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.accept_bank_transfer}
                        onChange={handleChange}
                        name="accept_bank_transfer"
                      />
                    }
                    label="Bank Transfer"
                  />
                </Grid>
              </Grid>

              {config.accept_bank_transfer && (
                <TextField
                  fullWidth
                  label="Bank Transfer Instructions"
                  name="payment_instructions"
                  value={config.payment_instructions}
                  onChange={handleChange}
                  error={!!errors.payment_instructions}
                  helperText={
                    errors.payment_instructions ||
                    "Provide instructions for bank transfers (account details, reference requirements, etc.)"
                  }
                  multiline
                  rows={4}
                  sx={{ mt: 2 }}
                />
              )}
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

export default PaymentConfigForm;
