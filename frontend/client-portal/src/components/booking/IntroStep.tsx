// frontend/client-portal/src/components/booking/IntroStep.tsx
import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import { BookingStep } from "../../types/bookingflow.types";

interface IntroStepProps {
  step: BookingStep;
}

const IntroStep: React.FC<IntroStepProps> = ({ step }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {step.name}
        </Typography>
        <Typography variant="body1" paragraph>
          {step.description}
        </Typography>
        {step.instructions && (
          <Box
            sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}
          >
            <Typography variant="body2">{step.instructions}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default IntroStep;
