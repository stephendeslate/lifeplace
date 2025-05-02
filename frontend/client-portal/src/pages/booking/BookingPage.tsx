// frontend/client-portal/src/pages/booking/BookingPage.tsx
import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Paper,
  styled,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import bookingClientApi from "../../apis/booking.api";
import BookingNavigation from "../../components/booking/BookingNavigation";
import BookingStepper from "../../components/booking/BookingStepper";
import AddonStep from "../../components/booking/steps/AddonStep";
import ConfirmationStep from "../../components/booking/steps/ConfirmationStep";
import DateStep from "../../components/booking/steps/DateStep";
import EventTypeStep from "../../components/booking/steps/EventTypeStep";
import IntroStep from "../../components/booking/steps/IntroStep";
import PackageStep from "../../components/booking/steps/PackageStep";
import PaymentStep from "../../components/booking/steps/PaymentStep";
import QuestionnaireStep from "../../components/booking/steps/QuestionnaireStep";
import SummaryStep from "../../components/booking/steps/SummaryStep";
import useClientBooking from "../../hooks/useClientBooking";
import { BookingFlow, BookingStep } from "../../types/booking.types";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const BookingPage: React.FC = () => {
  const { eventTypeId } = useParams<{ eventTypeId?: string }>();
  const navigate = useNavigate();
  const { state, goToStep, selectEventType, createEvent } = useClientBooking();
  const [bookingFlow, setBookingFlow] = useState<BookingFlow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define the booking steps with visibility based on configuration
  const bookingSteps = [
    { id: "EVENT_TYPE" as BookingStep, label: "Event Type", isVisible: true },
    {
      id: "INTRO" as BookingStep,
      label: "Introduction",
      isVisible: bookingFlow?.intro_config?.is_visible ?? false,
    },
    {
      id: "DATE" as BookingStep,
      label: "Date & Time",
      isVisible: bookingFlow?.date_config?.is_visible ?? false,
    },
    {
      id: "QUESTIONNAIRE" as BookingStep,
      label: "Questionnaire",
      isVisible: bookingFlow?.questionnaire_config?.is_visible ?? false,
    },
    {
      id: "PACKAGE" as BookingStep,
      label: "Package",
      isVisible: bookingFlow?.package_config?.is_visible ?? false,
    },
    {
      id: "ADDON" as BookingStep,
      label: "Add-ons",
      isVisible: bookingFlow?.addon_config?.is_visible ?? false,
    },
    {
      id: "SUMMARY" as BookingStep,
      label: "Summary",
      isVisible: bookingFlow?.summary_config?.is_visible ?? false,
    },
    {
      id: "PAYMENT" as BookingStep,
      label: "Payment",
      isVisible: bookingFlow?.payment_config?.is_visible ?? false,
    },
    {
      id: "CONFIRMATION" as BookingStep,
      label: "Confirmation",
      isVisible: bookingFlow?.confirmation_config?.is_visible ?? false,
    },
  ];

  // Filter visible steps and get current step index
  const visibleSteps = bookingSteps.filter((step) => step.isVisible);
  const currentStepIndex = visibleSteps.findIndex(
    (step) => step.id === state.currentStep
  );

  // Handle event type selection if ID provided in URL
  useEffect(() => {
    if (eventTypeId && state.currentStep === "EVENT_TYPE") {
      const selectType = async () => {
        setIsLoading(true);
        await selectEventType(parseInt(eventTypeId));
        setIsLoading(false);
      };
      selectType();
    }
  }, [eventTypeId, selectEventType, state.currentStep]);

  // Load booking flow when flow ID changes
  useEffect(() => {
    if (state.flowId !== null) {
      const fetchBookingFlow = async () => {
        setIsLoading(true);
        try {
          const flow = await bookingClientApi.getBookingFlowById(
            state.flowId as number
          );
          console.log("Fetched booking flow:", flow); // Debug log
          setBookingFlow(flow);
        } catch (error) {
          console.error("Error fetching booking flow:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchBookingFlow();
    }
  }, [state.flowId]);

  // Handle navigation
  const handleNext = async () => {
    if (currentStepIndex < visibleSteps.length - 1) {
      const nextStep = visibleSteps[currentStepIndex + 1].id;

      // If moving to payment step, create the event first
      if (nextStep === "PAYMENT" && state.currentStep === "SUMMARY") {
        setIsLoading(true);
        try {
          // Create the event with LEAD status
          const eventId = await createEvent();
          if (!eventId) {
            // If event creation failed, don't proceed
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error creating event:", error);
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
      }

      // Proceed to next step
      goToStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      goToStep(visibleSteps[currentStepIndex - 1].id);
    }
  };

  // Render the current step
  const renderStep = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (state.currentStep) {
      case "EVENT_TYPE":
        return <EventTypeStep />;
      case "INTRO":
        return bookingFlow && bookingFlow.intro_config ? (
          <IntroStep
            config={bookingFlow.intro_config}
            eventTypeDetails={bookingFlow.event_type_details}
          />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>Loading introduction step...</Typography>
          </Box>
        );
      case "DATE":
        return bookingFlow && bookingFlow.date_config ? (
          <DateStep config={bookingFlow.date_config} />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>
              Loading date selection step...
            </Typography>
          </Box>
        );
      case "QUESTIONNAIRE":
        return bookingFlow && bookingFlow.questionnaire_config ? (
          <QuestionnaireStep config={bookingFlow.questionnaire_config} />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>
              Loading questionnaire step...
            </Typography>
          </Box>
        );
      case "PACKAGE":
        return bookingFlow && bookingFlow.package_config ? (
          <PackageStep config={bookingFlow.package_config} />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>
              Loading package selection step...
            </Typography>
          </Box>
        );
      case "ADDON":
        return bookingFlow && bookingFlow.addon_config ? (
          <AddonStep config={bookingFlow.addon_config} />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>Loading add-ons step...</Typography>
          </Box>
        );
      case "SUMMARY":
        return bookingFlow ? (
          <SummaryStep bookingFlow={bookingFlow} />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>Loading summary step...</Typography>
          </Box>
        );
      case "PAYMENT":
        return bookingFlow && bookingFlow.payment_config ? (
          <PaymentStep config={bookingFlow.payment_config} />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>Loading payment step...</Typography>
          </Box>
        );
      case "CONFIRMATION":
        return bookingFlow && bookingFlow.confirmation_config ? (
          <ConfirmationStep config={bookingFlow.confirmation_config} />
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 2 }}>Loading confirmation step...</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <Typography>Step not available</Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Book Your Event
        </Typography>

        {/* Only show stepper after event type step */}
        {state.flowId && state.currentStep !== "EVENT_TYPE" && (
          <BookingStepper activeStep={currentStepIndex} steps={bookingSteps} />
        )}

        <StyledPaper elevation={3}>
          {renderStep()}

          {!isLoading && state.flowId && state.currentStep !== "EVENT_TYPE" && (
            <>
              <Divider sx={{ my: 4 }} />
              <BookingNavigation
                currentStep={state.currentStep}
                onNext={handleNext}
                onBack={handleBack}
                isNextDisabled={state.isLoading}
                isSubmitting={state.isLoading}
                isLastStep={state.currentStep === "CONFIRMATION"}
              />
            </>
          )}
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default BookingPage;
