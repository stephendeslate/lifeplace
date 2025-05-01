// frontend/client-portal/src/components/booking/BookingWizard.tsx
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useBookingFlow } from "../../hooks/useBookingFlow";
import ConfirmationStep from "./ConfirmationStep";
import CustomStep from "./CustomStep";
import DateStep from "./DateStep";
import EventTypeStep from "./EventTypeStep";
import IntroStep from "./IntroStep";
import PaymentStep from "./PaymentStep";
import ProductStep from "./ProductStep";
import QuestionnaireStep from "./QuestionnaireStep";
import SummaryStep from "./SummaryStep";

interface BookingWizardProps {
  initialEventTypeId?: number;
}

const BookingWizard: React.FC<BookingWizardProps> = ({
  initialEventTypeId,
}) => {
  const {
    state,
    loading,
    error,
    selectEventType,
    nextStep,
    prevStep,
    goToStep,
    setSelectedDate,
    setSelectedTime,
    setQuestionnaireResponse,
    addProduct,
    removeProduct,
    updateProductQuantity,
    addAddon,
    removeAddon,
    setPaymentMethod,
    generateSummary,
    completeBooking,
    resetBookingFlow,
  } = useBookingFlow();

  // Load initial event type if provided
  useEffect(() => {
    if (initialEventTypeId) {
      selectEventType(initialEventTypeId);
    }
  }, [initialEventTypeId, selectEventType]);

  // Generate summary when reaching the summary step
  useEffect(() => {
    const currentStep = state.steps[state.currentStepIndex];
    if (currentStep && currentStep.step_type === "SUMMARY") {
      generateSummary();
    }
  }, [state.currentStepIndex, state.steps, generateSummary]);

  const handleNext = async () => {
    const currentStep = state.steps[state.currentStepIndex];

    // Handle special step transitions
    if (currentStep.step_type === "SUMMARY") {
      await generateSummary();
    } else if (currentStep.step_type === "PAYMENT") {
      const result = await completeBooking();
      if (result.success) {
        nextStep();
        return;
      }
      // If booking failed, don't proceed
      return;
    }

    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  const handleFinish = () => {
    resetBookingFlow();
  };

  const isStepValid = () => {
    const currentStep = state.steps[state.currentStepIndex];
    if (!currentStep) return false;

    // Skip validation for optional steps
    if (!currentStep.is_required) return true;

    switch (currentStep.step_type) {
      case "EVENT_TYPE":
        return !!state.eventType;

      case "DATE":
        return !!state.selectedDate;

      case "QUESTIONNAIRE":
        if (!currentStep.questionnaire_config) return true;

        const questionnaire = currentStep.questionnaire_config;
        // Check if all required fields have responses
        // In a real app, you'd check actual field requirements
        return true; // Simplified for this example

      case "PRODUCT":
        if (!currentStep.product_config) return true;

        const productConfig = currentStep.product_config;
        return state.selectedProducts.length >= productConfig.min_selection;

      case "ADDON":
        return true; // Add-ons are typically optional

      case "PAYMENT":
        return !!state.paymentMethod;

      default:
        return true;
    }
  };

  const renderStep = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!state.bookingFlow && !state.eventType) {
      return (
        <EventTypeStep
          onSelect={selectEventType}
          selectedEventType={state.eventType}
        />
      );
    }

    if (state.steps.length === 0) {
      return (
        <Alert severity="warning" sx={{ my: 2 }}>
          No booking steps found for this event type.
        </Alert>
      );
    }

    const currentStep = state.steps[state.currentStepIndex];
    if (!currentStep) {
      return (
        <Alert severity="warning" sx={{ my: 2 }}>
          Invalid step.
        </Alert>
      );
    }

    switch (currentStep.step_type) {
      case "INTRO":
        return <IntroStep step={currentStep} />;

      case "EVENT_TYPE":
        return (
          <EventTypeStep
            onSelect={selectEventType}
            selectedEventType={state.eventType}
          />
        );

      case "DATE":
        return (
          <DateStep
            step={currentStep}
            selectedStartDate={state.selectedStartDate}
            selectedEndDate={state.selectedEndDate}
            selectedStartTime={state.selectedStartTime}
            selectedEndTime={state.selectedEndTime}
            selectedTime={state.selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
          />
        );

      case "QUESTIONNAIRE":
        return (
          <QuestionnaireStep
            step={currentStep}
            responses={state.questionnaireResponses}
            onResponseChange={setQuestionnaireResponse}
          />
        );

      case "PRODUCT":
        return (
          <ProductStep
            step={currentStep}
            selectedProducts={state.selectedProducts}
            onAddProduct={addProduct}
            onRemoveProduct={removeProduct}
            onUpdateQuantity={updateProductQuantity}
          />
        );

      case "ADDON":
        return (
          <ProductStep
            step={currentStep}
            selectedProducts={state.selectedAddons}
            onAddProduct={addAddon}
            onRemoveProduct={removeAddon}
            onUpdateQuantity={updateProductQuantity}
          />
        );

      case "SUMMARY":
        return <SummaryStep step={currentStep} summary={state.summary} />;

      case "PAYMENT":
        return (
          <PaymentStep
            step={currentStep}
            summary={state.summary}
            paymentMethod={state.paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        );

      case "CONFIRMATION":
        return <ConfirmationStep step={currentStep} eventId={state.eventId} />;

      case "CUSTOM":
        return <CustomStep step={currentStep} />;

      default:
        return (
          <Alert severity="warning" sx={{ my: 2 }}>
            Unsupported step type: {currentStep.step_type}
          </Alert>
        );
    }
  };

  // Determine which steps to show in the stepper
  const getDisplaySteps = () => {
    // Filter out steps that aren't visible to the user
    return state.steps
      .filter((step) => step.is_visible)
      .map((step) => ({
        id: step.id,
        label: step.name,
        type: step.step_type,
      }));
  };

  const displaySteps = getDisplaySteps();
  const isLastStep = state.currentStepIndex === state.steps.length - 1;
  const isConfirmationStep =
    state.steps[state.currentStepIndex]?.step_type === "CONFIRMATION";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {state.bookingFlow?.name || "Book Your Event"}
        </Typography>

        {state.bookingFlow?.description && (
          <Typography variant="body1" align="center" color="text.secondary">
            {state.bookingFlow.description}
          </Typography>
        )}
      </Paper>

      {state.steps.length > 0 && (
        <Stepper activeStep={state.currentStepIndex} sx={{ mb: 4 }}>
          {displaySteps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {renderStep()}

      {state.steps.length > 0 && !isConfirmationStep && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={state.currentStepIndex === 0}
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </Box>
      )}

      {isConfirmationStep && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button variant="contained" onClick={handleFinish}>
            Book Another Event
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default BookingWizard;
