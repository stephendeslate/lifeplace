// frontend/client-portal/src/components/booking/steps/PaymentStep.tsx
import {
  AccountBalance as BankIcon,
  CreditCard as CreditCardIcon,
  Payment as PayPalIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../components/common/ToastProvider";
import useClientBooking from "../../../hooks/useClientBooking";
import { PaymentConfig } from "../../../types/booking.types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const PaymentMethod = styled(FormControlLabel)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    border: `1px solid ${
      selected ? theme.palette.primary.main : theme.palette.divider
    }`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginLeft: 0,
    marginRight: 0,
    width: "100%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    transition: "all 0.2s ease",
    backgroundColor: selected
      ? `${theme.palette.primary.light}20`
      : "transparent",
    "&:hover": {
      backgroundColor: selected
        ? `${theme.palette.primary.light}30`
        : `${theme.palette.action.hover}`,
    },
  })
);

const PaymentIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(1),
}));

interface PaymentStepProps {
  config: PaymentConfig;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ config }) => {
  const {
    state,
    setPaymentMethod,
    setDepositOnly,
    setDepositAmount,
    processPayment,
  } = useClientBooking();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    paymentMethod?: string;
    cardNumber?: string;
    cardHolder?: string;
    expiry?: string;
    cvv?: string;
  }>({});

  // Calculate deposit amount when total price changes
  useEffect(() => {
    if (config.require_deposit) {
      const depositAmount =
        (state.formData.totalPrice * config.deposit_percentage) / 100;
      setDepositAmount(depositAmount);
    }
  }, [
    state.formData.totalPrice,
    config.deposit_percentage,
    config.require_deposit,
    setDepositAmount,
  ]);

  // Process payment
  const handleProcessPayment = async () => {
    const valid = validateForm();
    if (!valid) return;

    setIsProcessing(true);

    try {
      // The event has already been created, just process the payment
      if (state.eventId) {
        // Process payment
        const success = await processPayment();
        if (!success) {
          throw new Error("Payment processing failed");
        }
      } else {
        throw new Error(
          "No event ID found. Event should be created before payment."
        );
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      showToast("Payment processing failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Validate payment form
  const validateForm = () => {
    const errors: {
      paymentMethod?: string;
      cardNumber?: string;
      cardHolder?: string;
      expiry?: string;
      cvv?: string;
    } = {};

    // Check if payment method is selected
    if (!state.formData.paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
    }

    // If credit card is selected, validate card details
    if (state.formData.paymentMethod === "CREDIT_CARD") {
      // This would be replaced with proper card validation
      // Simple validation for demo purposes
      const cardNumber = document.getElementById(
        "card-number"
      ) as HTMLInputElement;
      const cardHolder = document.getElementById(
        "card-holder"
      ) as HTMLInputElement;
      const expiry = document.getElementById("expiry") as HTMLInputElement;
      const cvv = document.getElementById("cvv") as HTMLInputElement;

      if (!cardNumber || !cardNumber.value) {
        errors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ""))) {
        errors.cardNumber = "Invalid card number";
      }

      if (!cardHolder || !cardHolder.value) {
        errors.cardHolder = "Cardholder name is required";
      }

      if (!expiry || !expiry.value) {
        errors.expiry = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(expiry.value)) {
        errors.expiry = "Invalid expiry date (MM/YY)";
      }

      if (!cvv || !cvv.value) {
        errors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(cvv.value)) {
        errors.cvv = "Invalid CVV";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        {config.title}
      </Typography>

      <Typography variant="body1" paragraph align="center">
        {config.description}
      </Typography>

      <StyledPaper>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">
            Total: ${state.formData.totalPrice.toFixed(2)}
          </Typography>

          {config.require_deposit && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.formData.depositOnly}
                    onChange={(e) => setDepositOnly(e.target.checked)}
                  />
                }
                label={`Pay deposit only (${
                  config.deposit_percentage
                }%): $${state.formData.depositAmount.toFixed(2)}`}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <FormControl
          component="fieldset"
          fullWidth
          error={!!validationErrors.paymentMethod}
        >
          <FormLabel component="legend">Payment Method</FormLabel>
          <RadioGroup
            name="payment-method"
            value={state.formData.paymentMethod || ""}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER"
              )
            }
          >
            {config.accept_credit_card && (
              <PaymentMethod
                value="CREDIT_CARD"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PaymentIcon>
                      <CreditCardIcon />
                    </PaymentIcon>
                    <Typography>Credit/Debit Card</Typography>
                  </Box>
                }
                selected={state.formData.paymentMethod === "CREDIT_CARD"}
              />
            )}

            {config.accept_paypal && (
              <PaymentMethod
                value="PAYPAL"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PaymentIcon>
                      <PayPalIcon />
                    </PaymentIcon>
                    <Typography>PayPal</Typography>
                  </Box>
                }
                selected={state.formData.paymentMethod === "PAYPAL"}
              />
            )}

            {config.accept_bank_transfer && (
              <PaymentMethod
                value="BANK_TRANSFER"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PaymentIcon>
                      <BankIcon />
                    </PaymentIcon>
                    <Typography>Bank Transfer</Typography>
                  </Box>
                }
                selected={state.formData.paymentMethod === "BANK_TRANSFER"}
              />
            )}
          </RadioGroup>

          {validationErrors.paymentMethod && (
            <Typography color="error" variant="caption">
              {validationErrors.paymentMethod}
            </Typography>
          )}
        </FormControl>

        {/* Payment Details Forms */}
        <Box sx={{ mt: 3 }}>
          {state.formData.paymentMethod === "CREDIT_CARD" && (
            <Grid container spacing={2}>
              <Grid {...({ item: true, xs: 12 } as any)}>
                <TextField
                  id="card-number"
                  label="Card Number"
                  fullWidth
                  placeholder="1234 5678 9012 3456"
                  error={!!validationErrors.cardNumber}
                  helperText={validationErrors.cardNumber}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12 } as any)}>
                <TextField
                  id="card-holder"
                  label="Cardholder Name"
                  fullWidth
                  placeholder="John Doe"
                  error={!!validationErrors.cardHolder}
                  helperText={validationErrors.cardHolder}
                />
              </Grid>
              <Grid {...({ item: true, xs: 6 } as any)}>
                <TextField
                  id="expiry"
                  label="Expiry Date"
                  fullWidth
                  placeholder="MM/YY"
                  error={!!validationErrors.expiry}
                  helperText={validationErrors.expiry}
                />
              </Grid>
              <Grid {...({ item: true, xs: 6 } as any)}>
                <TextField
                  id="cvv"
                  label="CVV"
                  fullWidth
                  placeholder="123"
                  error={!!validationErrors.cvv}
                  helperText={validationErrors.cvv}
                />
              </Grid>
            </Grid>
          )}

          {state.formData.paymentMethod === "PAYPAL" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You will be redirected to PayPal to complete your payment.
            </Alert>
          )}

          {state.formData.paymentMethod === "BANK_TRANSFER" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bank Transfer Instructions
              </Typography>
              <Typography variant="body2" paragraph>
                {config.payment_instructions ||
                  "Please contact us for bank transfer details."}
              </Typography>
              <Alert severity="info">
                Your booking will be confirmed once payment is received.
              </Alert>
            </Box>
          )}
        </Box>
      </StyledPaper>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleProcessPayment}
          disabled={isProcessing || !state.formData.paymentMethod}
          startIcon={
            isProcessing && <CircularProgress size={20} color="inherit" />
          }
        >
          {isProcessing
            ? "Processing..."
            : `Pay ${state.formData.depositOnly ? "Deposit" : "Now"} $${(state
                .formData.depositOnly
                ? state.formData.depositAmount
                : state.formData.totalPrice
              ).toFixed(2)}`}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentStep;
