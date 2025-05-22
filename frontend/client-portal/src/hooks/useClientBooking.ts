// frontend/client-portal/src/hooks/useClientBooking.ts
import { useCallback, useContext } from "react";
import bookingClientApi from "../apis/booking.api";
import { useToast } from "../components/common/ToastProvider";
import { BookingContext } from "../contexts/BookingContext";
import {
  BookingStep,
  EventCreateData,
  PaymentCreateData,
} from "../types/booking.types";
import useAuth from "./useAuth";

export const useClientBooking = () => {
  const bookingContext = useContext(BookingContext);
  const { showToast } = useToast();
  const { user } = useAuth();

  if (!bookingContext) {
    throw new Error("useClientBooking must be used within a BookingProvider");
  }

  const { state, dispatch } = bookingContext;

  // Navigate to a specific step
  const goToStep = useCallback(
    (step: BookingStep) => {
      dispatch({ type: "SET_STEP", payload: step });
    },
    [dispatch]
  );

  // Load event types
  const loadEventTypes = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const eventTypes = await bookingClientApi.getActiveEventTypes();
      dispatch({ type: "SET_LOADING", payload: false });
      return eventTypes;
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_ERROR", payload: "Failed to load event types" });
      showToast("Failed to load event types", "error");
      return [];
    }
  }, [dispatch, showToast]);

  // Load booking flow for selected event type
  const loadBookingFlow = useCallback(
    async (eventTypeId: number) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // First, get all active flows for this event type
        const flowsResponse = await bookingClientApi.getBookingFlows(
          1,
          eventTypeId,
          true
        );

        if (!flowsResponse.results || flowsResponse.results.length === 0) {
          dispatch({
            type: "SET_ERROR",
            payload: "No active booking flow found for this event type",
          });
          dispatch({ type: "SET_LOADING", payload: false });
          showToast("No booking flow found for this event type", "error");
          return null;
        }

        // Get the first active flow
        const flowId = flowsResponse.results[0].id;
        dispatch({ type: "SET_FLOW_ID", payload: flowId });

        // Now get the complete booking flow details with all configurations
        const bookingFlow = await bookingClientApi.getBookingFlowById(flowId);

        if (!bookingFlow) {
          dispatch({
            type: "SET_ERROR",
            payload: "Failed to load booking flow details",
          });
          dispatch({ type: "SET_LOADING", payload: false });
          showToast("Failed to load booking flow details", "error");
          return null;
        }

        // Check if questionnaire configuration exists but has no items
        // and try to set them up automatically
        if (
          bookingFlow.questionnaire_config &&
          bookingFlow.questionnaire_config.is_visible &&
          (!bookingFlow.questionnaire_config.questionnaire_items ||
            bookingFlow.questionnaire_config.questionnaire_items.length === 0)
        ) {
          try {
            console.log("Setting up questionnaires for booking flow...");
            await bookingClientApi.setupBookingFlowQuestionnaires(
              flowId,
              eventTypeId
            );

            // Reload the booking flow to get the updated questionnaire items
            const updatedBookingFlow =
              await bookingClientApi.getBookingFlowById(flowId);
            if (updatedBookingFlow) {
              dispatch({ type: "SET_LOADING", payload: false });
              return updatedBookingFlow;
            }
          } catch (setupError) {
            console.warn("Could not auto-setup questionnaires:", setupError);
            // Continue with the original flow even if setup fails
          }
        }

        dispatch({ type: "SET_LOADING", payload: false });
        return bookingFlow;
      } catch (error) {
        console.error("Error loading booking flow:", error);
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_ERROR", payload: "Failed to load booking flow" });
        showToast("Failed to load booking flow", "error");
        return null;
      }
    },
    [dispatch, showToast]
  );

  // Select event type and load its booking flow
  const selectEventType = useCallback(
    async (eventTypeId: number) => {
      dispatch({ type: "SET_EVENT_TYPE", payload: eventTypeId });
      const bookingFlow = await loadBookingFlow(eventTypeId);
      if (bookingFlow) {
        // Determine first visible step
        let nextStep: BookingStep = "INTRO";
        if (!bookingFlow.intro_config?.is_visible) {
          if (bookingFlow.date_config?.is_visible) nextStep = "DATE";
          else if (bookingFlow.questionnaire_config?.is_visible)
            nextStep = "QUESTIONNAIRE";
          else if (bookingFlow.package_config?.is_visible) nextStep = "PACKAGE";
          else if (bookingFlow.addon_config?.is_visible) nextStep = "ADDON";
          else if (bookingFlow.summary_config?.is_visible) nextStep = "SUMMARY";
          else if (bookingFlow.payment_config?.is_visible) nextStep = "PAYMENT";
        }
        goToStep(nextStep);
        return true;
      }
      return false;
    },
    [dispatch, loadBookingFlow, goToStep]
  );

  // Setup questionnaires for a booking flow
  const setupQuestionnaireItems = useCallback(
    async (flowId: number, eventTypeId: number) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const result = await bookingClientApi.setupBookingFlowQuestionnaires(
          flowId,
          eventTypeId
        );

        if (result) {
          showToast("Questionnaires configured successfully", "success");
          // Reload the booking flow to refresh the data
          const updatedFlow = await bookingClientApi.getBookingFlowById(flowId);
          dispatch({ type: "SET_LOADING", payload: false });
          return updatedFlow;
        }

        dispatch({ type: "SET_LOADING", payload: false });
        return null;
      } catch (error) {
        console.error("Error setting up questionnaires:", error);
        dispatch({ type: "SET_LOADING", payload: false });
        showToast("Failed to setup questionnaires", "error");
        return null;
      }
    },
    [dispatch, showToast]
  );

  // Get questionnaires for current event type
  const loadQuestionnaires = useCallback(
    async (eventTypeId: number) => {
      try {
        const questionnaires =
          await bookingClientApi.getQuestionnairesForEventType(eventTypeId);
        return questionnaires;
      } catch (error) {
        console.error("Error loading questionnaires:", error);
        showToast("Failed to load questionnaires", "error");
        return [];
      }
    },
    [showToast]
  );

  // Create event object from booking form data
  const createEvent = useCallback(async () => {
    if (!user || !state.formData.eventType) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Format date and time for the API
      const startDate = state.formData.startDate;
      const startTime = state.formData.startTime;
      let formattedStartDate = "";

      if (startDate) {
        if (startTime) {
          // Combine date and time
          const [hours, minutes] = startTime.split(":");
          const dateWithTime = new Date(startDate);
          dateWithTime.setHours(parseInt(hours), parseInt(minutes));
          formattedStartDate = dateWithTime.toISOString();
        } else {
          // Just the date
          formattedStartDate = startDate.toISOString();
        }
      }

      // Format end date if exists
      let formattedEndDate;
      if (state.formData.endDate) {
        if (state.formData.endTime) {
          const [hours, minutes] = state.formData.endTime.split(":");
          const dateWithTime = new Date(state.formData.endDate);
          dateWithTime.setHours(parseInt(hours), parseInt(minutes));
          formattedEndDate = dateWithTime.toISOString();
        } else {
          formattedEndDate = state.formData.endDate.toISOString();
        }
      }

      // Create event data object - without event_products initially
      const eventData: EventCreateData = {
        client: user.id,
        event_type: state.formData.eventType,
        name: state.formData.eventName || "Booking",
        status: "LEAD",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        total_price: state.formData.totalPrice,
        questionnaire_responses: state.formData.questionnaireResponses.map(
          (response) => ({
            field: response.fieldId,
            value: response.value,
          })
        ),
      };

      // First, create the event
      const result = await bookingClientApi.createEvent(eventData);
      const eventId = result.id;

      // Now that we have the event ID, create the event products
      if (eventId) {
        dispatch({ type: "SET_EVENT_ID", payload: eventId });

        // Create event products if there are any
        const eventProducts = [
          ...state.formData.selectedPackages.map((pkg) => ({
            event: eventId,
            product_option: pkg.packageId,
            quantity: pkg.quantity,
            final_price: 0, // This will be calculated on the server
          })),
          ...state.formData.selectedAddons.map((addon) => ({
            event: eventId,
            product_option: addon.addonId,
            quantity: addon.quantity,
            final_price: 0, // This will be calculated on the server
          })),
        ];

        // If there are products, create them
        if (eventProducts.length > 0) {
          await Promise.all(
            eventProducts.map((product) =>
              bookingClientApi.createEventProduct(product)
            )
          );
        }

        dispatch({ type: "SET_LOADING", payload: false });
        return eventId;
      }

      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    } catch (error) {
      console.error("Error creating event:", error);
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_ERROR", payload: "Failed to create booking" });
      showToast("Failed to create booking", "error");
      return false;
    }
  }, [state.formData, user, dispatch, showToast]);

  // Process payment
  const processPayment = useCallback(async () => {
    if (!state.eventId || !state.formData.paymentMethod) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const paymentData: PaymentCreateData = {
        event: state.eventId,
        amount: state.formData.depositOnly
          ? state.formData.depositAmount
          : state.formData.totalPrice,
        payment_method: state.formData.paymentMethod,
        is_deposit: state.formData.depositOnly,
      };

      const result = await bookingClientApi.processPayment(paymentData);

      if (result.success) {
        // Confirm the event if payment was successful
        await bookingClientApi.confirmEvent(state.eventId);
        goToStep("CONFIRMATION");
      }

      dispatch({ type: "SET_LOADING", payload: false });
      return result.success;
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_ERROR", payload: "Payment processing failed" });
      showToast("Payment processing failed", "error");
      return false;
    }
  }, [state.eventId, state.formData, dispatch, showToast, goToStep]);

  // Calculate total price based on selections
  const calculateTotalPrice = useCallback(
    (
      packages: { packageId: number; quantity: number }[],
      addons: { addonId: number; quantity: number }[],
      packageItems: any[],
      addonItems: any[]
    ) => {
      let total = 0;

      // Calculate package prices
      packages.forEach((pkg) => {
        const packageItem = packageItems.find(
          (item) =>
            (typeof item.product === "number"
              ? item.product
              : item.product.id) === pkg.packageId
        );

        if (packageItem) {
          const price =
            packageItem.custom_price ||
            (typeof packageItem.product === "object"
              ? packageItem.product.base_price
              : 0);
          total += price * pkg.quantity;
        }
      });

      // Calculate addon prices
      addons.forEach((addon) => {
        const addonItem = addonItems.find(
          (item) =>
            (typeof item.product === "number"
              ? item.product
              : item.product.id) === addon.addonId
        );

        if (addonItem) {
          const price =
            addonItem.custom_price ||
            (typeof addonItem.product === "object"
              ? addonItem.product.base_price
              : 0);
          total += price * addon.quantity;
        }
      });

      dispatch({ type: "SET_TOTAL_PRICE", payload: total });
      return total;
    },
    [dispatch]
  );

  // Reset booking form
  const resetBooking = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, [dispatch]);

  return {
    state: state,
    goToStep,
    loadEventTypes,
    loadBookingFlow,
    selectEventType,
    setupQuestionnaireItems,
    loadQuestionnaires,
    createEvent,
    processPayment,
    calculateTotalPrice,
    resetBooking,
    // Form update helpers
    setEventName: (name: string) =>
      dispatch({ type: "SET_EVENT_NAME", payload: name }),
    setDate: (startDate: Date, endDate?: Date) =>
      dispatch({ type: "SET_DATE", payload: { startDate, endDate } }),
    setTime: (startTime: string, endTime?: string) =>
      dispatch({ type: "SET_TIME", payload: { startTime, endTime } }),
    addQuestionnaireResponse: (fieldId: number, value: string) =>
      dispatch({
        type: "ADD_QUESTIONNAIRE_RESPONSE",
        payload: { fieldId, value },
      }),
    setSelectedPackages: (
      packages: { packageId: number; quantity: number }[]
    ) => dispatch({ type: "SET_SELECTED_PACKAGES", payload: packages }),
    addPackage: (packageId: number, quantity: number) =>
      dispatch({ type: "ADD_PACKAGE", payload: { packageId, quantity } }),
    removePackage: (packageId: number) =>
      dispatch({ type: "REMOVE_PACKAGE", payload: packageId }),
    setSelectedAddons: (addons: { addonId: number; quantity: number }[]) =>
      dispatch({ type: "SET_SELECTED_ADDONS", payload: addons }),
    addAddon: (addonId: number, quantity: number) =>
      dispatch({ type: "ADD_ADDON", payload: { addonId, quantity } }),
    removeAddon: (addonId: number) =>
      dispatch({ type: "REMOVE_ADDON", payload: addonId }),
    setPaymentMethod: (method: "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER") =>
      dispatch({ type: "SET_PAYMENT_METHOD", payload: method }),
    setDepositOnly: (depositOnly: boolean) =>
      dispatch({ type: "SET_DEPOSIT_ONLY", payload: depositOnly }),
    setDepositAmount: (amount: number) =>
      dispatch({ type: "SET_DEPOSIT_AMOUNT", payload: amount }),
  };
};

export default useClientBooking;
