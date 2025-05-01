// frontend/client-portal/src/components/booking/PaymentStep.tsx
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { BookingStep, BookingSummary } from "../../types/bookingflow.types";

interface PaymentStepProps {
  step: BookingStep;
  summary: BookingSummary | null;
  paymentMethod: string | null;
  onPaymentMethodChange: (method: string) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  step,
  summary,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  if (!summary) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">Booking summary not available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {step.name}
        </Typography>

        {step.description && (
          <Typography variant="body1" paragraph>
            {step.description}
          </Typography>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          This is a placeholder payment form. In a real application, you would
          integrate with a secure payment processor.
        </Alert>

        <Typography variant="subtitle1" gutterBottom>
          Total Amount: ${summary.totalPrice.toFixed(2)}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Payment Method
          </Typography>

          <RadioGroup
            value={paymentMethod || ""}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
          >
            <FormControlLabel
              value="credit_card"
              control={<Radio />}
              label="Credit Card"
            />
            <FormControlLabel
              value="paypal"
              control={<Radio />}
              label="PayPal"
            />
            <FormControlLabel
              value="bank_transfer"
              control={<Radio />}
              label="Bank Transfer"
            />
            <FormControlLabel
              value="pay_later"
              control={<Radio />}
              label="Pay Later"
            />
          </RadioGroup>
        </Box>

        {paymentMethod === "credit_card" && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Credit Card Details
            </Typography>

            <Grid container spacing={2}>
              <Grid {...({ item: true, xs: 12 } as any)}>
                <TextField
                  label="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid {...({ item: true, xs: 12 } as any)}>
                <TextField
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="**** **** **** ****"
                  fullWidth
                />
              </Grid>

              <Grid {...({ item: true, xs: 6 } as any)}>
                <TextField
                  label="Expiry Date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  fullWidth
                />
              </Grid>

              <Grid {...({ item: true, xs: 6 } as any)}>
                <TextField
                  label="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  type="password"
                  inputProps={{ maxLength: 4 }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {paymentMethod === "paypal" && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ bgcolor: "#0070ba" }}
            >
              Proceed to PayPal
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              You will be redirected to PayPal to complete your payment
            </Typography>
          </Box>
        )}

        {paymentMethod === "bank_transfer" && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              Please use the following bank details to complete your transfer:
              <br />
              <br />
              Bank: Example Bank
              <br />
              Account Name: LifePlace LLC
              <br />
              Account Number: 1234567890
              <br />
              Routing Number: 987654321
              <br />
              Reference: Please include your name and event date
            </Alert>
          </Box>
        )}

        {paymentMethod === "pay_later" && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              By selecting Pay Later, you agree to pay the full amount before
              the event date. An invoice will be sent to your email address.
            </Alert>
          </Box>
        )}

        {step.instructions && (
          <Box
            sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}
          >
            <Typography variant="body2">{step.instructions}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentStep;
