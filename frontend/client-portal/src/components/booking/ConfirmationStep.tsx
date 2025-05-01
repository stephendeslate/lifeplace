// frontend/client-portal/src/components/booking/ConfirmationStep.tsx
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Alert, Box, Button, Divider, Paper, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { BookingStep } from "../../types/bookingflow.types";

interface ConfirmationStepProps {
  step: BookingStep;
  eventId?: number;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  step,
  eventId,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />

        <Typography variant="h5" gutterBottom>
          {step.name || "Booking Confirmed!"}
        </Typography>

        {step.description && (
          <Typography variant="body1" paragraph>
            {step.description}
          </Typography>
        )}

        <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
          Your booking has been confirmed.{" "}
          {eventId && `Booking reference: #${eventId}`}
        </Alert>

        {step.instructions && (
          <Box
            sx={{
              p: 2,
              bgcolor: "background.default",
              borderRadius: 1,
              textAlign: "left",
              mb: 3,
            }}
          >
            <Typography variant="body2">{step.instructions}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/profile"
          >
            Go to My Events
          </Button>

          <Button variant="outlined" component={RouterLink} to="/">
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfirmationStep;
