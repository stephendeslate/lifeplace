// frontend/client-portal/src/hooks/useBookingFlow.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingFlowApi } from "../apis/bookingflow.api";
import { EventType } from "../shared/types/events.types";
import {
  BookingState,
  BookingSummary,
  EventCreateRequest,
} from "../types/bookingflow.types";
import useAuth from "./useAuth";

const initialState: BookingState = {
  eventType: null,
  bookingFlow: null,
  currentStepIndex: 0,
  steps: [],
  // New multi-day fields
  selectedStartDate: null,
  selectedEndDate: null,
  selectedStartTime: null,
  selectedEndTime: null,
  // For backward compatibility
  selectedDate: null,
  selectedTime: null,
  questionnaireResponses: {},
  selectedProducts: [],
  selectedAddons: [],
  paymentMethod: null,
  summary: null,
  eventId: undefined,
};

export const useBookingFlow = () => {
  const [state, setState] = useState<BookingState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const resetBookingFlow = () => {
    setState(initialState);
  };

  const selectEventType = async (eventTypeId: number) => {
    setLoading(true);
    setError(null);
    try {
      // Get booking flow for this event type
      const bookingFlow = await bookingFlowApi.getBookingFlow(eventTypeId);

      // Get steps for this booking flow
      const steps = await bookingFlowApi.getBookingSteps(bookingFlow.id);

      // Sort steps by order
      const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

      setState({
        ...initialState,
        eventType: eventTypeId,
        bookingFlow,
        steps: sortedSteps,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load booking flow"
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (state.currentStepIndex < state.steps.length - 1) {
      setState({
        ...state,
        currentStepIndex: state.currentStepIndex + 1,
      });
    }
  };

  const prevStep = () => {
    if (state.currentStepIndex > 0) {
      setState({
        ...state,
        currentStepIndex: state.currentStepIndex - 1,
      });
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < state.steps.length) {
      setState({
        ...state,
        currentStepIndex: index,
      });
    }
  };

  // Updated to support multi-day selection
  const setSelectedDate = (
    startDate: string,
    endDate: string | null = null
  ) => {
    setState({
      ...state,
      selectedStartDate: startDate,
      selectedEndDate: endDate,
      // For backward compatibility
      selectedDate: startDate,
    });
  };

  // Updated to support multi-day selection
  const setSelectedTime = (
    startTime: string,
    endTime: string | null = null
  ) => {
    setState({
      ...state,
      selectedStartTime: startTime,
      selectedEndTime: endTime,
      // For backward compatibility
      selectedTime: startTime,
    });
  };

  const setQuestionnaireResponse = (fieldId: number, value: string) => {
    setState({
      ...state,
      questionnaireResponses: {
        ...state.questionnaireResponses,
        [fieldId]: value,
      },
    });
  };

  const addProduct = (productId: number, quantity: number = 1) => {
    const existingProduct = state.selectedProducts.find(
      (p) => p.productId === productId
    );

    if (existingProduct) {
      // Update quantity if product already exists
      setState({
        ...state,
        selectedProducts: state.selectedProducts.map((p) =>
          p.productId === productId
            ? { ...p, quantity: p.quantity + quantity }
            : p
        ),
      });
    } else {
      // Add new product
      setState({
        ...state,
        selectedProducts: [...state.selectedProducts, { productId, quantity }],
      });
    }
  };

  const removeProduct = (productId: number) => {
    setState({
      ...state,
      selectedProducts: state.selectedProducts.filter(
        (p) => p.productId !== productId
      ),
    });
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }

    setState({
      ...state,
      selectedProducts: state.selectedProducts.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      ),
    });
  };

  const addAddon = (productId: number, quantity: number = 1) => {
    const existingAddon = state.selectedAddons.find(
      (p) => p.productId === productId
    );

    if (existingAddon) {
      // Update quantity if addon already exists
      setState({
        ...state,
        selectedAddons: state.selectedAddons.map((p) =>
          p.productId === productId
            ? { ...p, quantity: p.quantity + quantity }
            : p
        ),
      });
    } else {
      // Add new addon
      setState({
        ...state,
        selectedAddons: [...state.selectedAddons, { productId, quantity }],
      });
    }
  };

  const removeAddon = (productId: number) => {
    setState({
      ...state,
      selectedAddons: state.selectedAddons.filter(
        (p) => p.productId !== productId
      ),
    });
  };

  const setPaymentMethod = (method: string) => {
    setState({
      ...state,
      paymentMethod: method,
    });
  };

  const generateSummary = async () => {
    try {
      // This would typically fetch product details to calculate prices
      // For simplicity, we'll use mock data here
      const summary: BookingSummary = {
        eventType: state.bookingFlow?.event_type_details as EventType,
        // For multi-day support
        startDate: state.selectedStartDate || state.selectedDate || "",
        endDate: state.selectedEndDate || undefined,
        startTime: state.selectedStartTime || state.selectedTime || undefined,
        endTime: state.selectedEndTime || undefined,
        // For backward compatibility
        date: state.selectedDate || state.selectedStartDate || "",
        time: state.selectedTime || state.selectedStartTime || undefined,
        products: state.selectedProducts.map((p) => ({
          name: `Product ${p.productId}`, // Would be fetched from API
          quantity: p.quantity,
          price: 100 * p.quantity, // Mock price calculation
        })),
        addons: state.selectedAddons.map((p) => ({
          name: `Addon ${p.productId}`, // Would be fetched from API
          quantity: p.quantity,
          price: 50 * p.quantity, // Mock price calculation
        })),
        totalPrice:
          state.selectedProducts.reduce((sum, p) => sum + 100 * p.quantity, 0) +
          state.selectedAddons.reduce((sum, p) => sum + 50 * p.quantity, 0),
      };

      setState({
        ...state,
        summary,
      });

      return summary;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate summary"
      );
      return null;
    }
  };

  const completeBooking = async (): Promise<{
    success: boolean;
    eventId?: number;
  }> => {
    // Use selectedStartDate as primary, falling back to selectedDate for compatibility
    const startDate = state.selectedStartDate || state.selectedDate;
    const startTime = state.selectedStartTime || state.selectedTime;

    if (!user || !state.eventType || !startDate) {
      setError("Missing required booking information");
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      // Create event
      const eventData: EventCreateRequest = {
        client: user.id,
        event_type: state.eventType,
        name: `${user.first_name}'s Event`, // Could be customized
        status: "LEAD",
        start_date: startDate + (startTime ? ` ${startTime}` : ""),
        // Add end_date if multi-day event
        ...(state.selectedEndDate && {
          end_date:
            state.selectedEndDate +
            (state.selectedEndTime ? ` ${state.selectedEndTime}` : ""),
        }),
        event_products: [
          ...state.selectedProducts.map((p) => ({
            product_option: p.productId,
            quantity: p.quantity,
            final_price: 100 * p.quantity, // Mock price calculation
          })),
          ...state.selectedAddons.map((p) => ({
            product_option: p.productId,
            quantity: p.quantity,
            final_price: 50 * p.quantity, // Mock price calculation
          })),
        ],
      };

      const event = await bookingFlowApi.createEvent(eventData);

      // Save questionnaire responses if any
      if (Object.keys(state.questionnaireResponses).length > 0) {
        const responses = Object.entries(state.questionnaireResponses).map(
          ([fieldId, value]) => ({ field: parseInt(fieldId), value })
        );

        await bookingFlowApi.saveQuestionnaireResponses(event.id, responses);
      }

      // Process payment if payment method selected
      if (state.paymentMethod && state.summary) {
        await bookingFlowApi.processPayment(event.id, {
          method: state.paymentMethod,
          amount: state.summary.totalPrice,
        });
      }

      // Set event ID in state
      setState({
        ...state,
        eventId: event.id,
      });

      return { success: true, eventId: event.id };
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete booking"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
