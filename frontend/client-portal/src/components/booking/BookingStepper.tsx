// frontend/client-portal/src/components/booking/BookingStepper.tsx
import {
  Box,
  Step,
  StepLabel,
  Stepper,
  Typography,
  styled,
} from "@mui/material";
import React from "react";
import { BookingStep } from "../../types/booking.types";

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

interface BookingStepperProps {
  activeStep: number;
  steps: {
    id: BookingStep;
    label: string;
    isVisible: boolean;
  }[];
}

const BookingStepper: React.FC<BookingStepperProps> = ({
  activeStep,
  steps,
}) => {
  const visibleSteps = steps.filter((step) => step.isVisible);

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <StyledStepper activeStep={activeStep} alternativeLabel>
        {visibleSteps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </StyledStepper>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Step {activeStep + 1} of {visibleSteps.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingStepper;
