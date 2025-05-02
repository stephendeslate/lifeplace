// frontend/client-portal/src/components/booking/BookingNavigation.tsx
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { Box, Button, CircularProgress, styled } from "@mui/material";
import React from "react";
import { BookingStep } from "../../types/booking.types";

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginTop: theme.spacing(4),
}));

interface BookingNavigationProps {
  currentStep: BookingStep;
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  onSubmitPayment?: () => void;
}

const BookingNavigation: React.FC<BookingNavigationProps> = ({
  currentStep,
  onNext,
  onBack,
  isNextDisabled = false,
  isSubmitting = false,
  isLastStep = false,
  onSubmitPayment,
}) => {
  // Don't show back button on first step or confirmation step
  const showBackButton = !["EVENT_TYPE", "CONFIRMATION"].includes(currentStep);

  // Determine button labels and icons based on current step
  const getNextButtonProps = () => {
    switch (currentStep) {
      case "PAYMENT":
        return {
          label: "Complete Payment",
          icon: <PaymentIcon sx={{ ml: 1 }} />,
          onClick: onSubmitPayment || onNext,
        };
      case "SUMMARY":
        return {
          label: "Proceed to Payment",
          icon: <ArrowForwardIcon sx={{ ml: 1 }} />,
          onClick: onNext,
        };
      case "CONFIRMATION":
        return {
          label: "View Dashboard",
          icon: <CheckIcon sx={{ ml: 1 }} />,
          onClick: () => (window.location.href = "/dashboard"),
        };
      default:
        return {
          label: "Continue",
          icon: <ArrowForwardIcon sx={{ ml: 1 }} />,
          onClick: onNext,
        };
    }
  };

  const nextButtonProps = getNextButtonProps();

  return (
    <NavigationContainer>
      {showBackButton && (
        <Button
          variant="outlined"
          color="primary"
          onClick={onBack}
          disabled={isSubmitting}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
      )}

      <Box sx={{ flex: 1 }} />

      {!isLastStep ? (
        <Button
          variant="contained"
          color="primary"
          onClick={nextButtonProps.onClick}
          disabled={isNextDisabled || isSubmitting}
          endIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              nextButtonProps.icon
            )
          }
        >
          {isSubmitting ? "Processing..." : nextButtonProps.label}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="success"
          href="/dashboard"
          endIcon={nextButtonProps.icon}
        >
          {nextButtonProps.label}
        </Button>
      )}
    </NavigationContainer>
  );
};

export default BookingNavigation;
