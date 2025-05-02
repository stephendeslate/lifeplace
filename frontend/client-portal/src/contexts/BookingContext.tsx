// frontend/client-portal/src/contexts/BookingContext.tsx
import React, { createContext, ReactNode, useReducer } from "react";
import { BookingFormData, BookingStep } from "../types/booking.types";

// Initial form data
const initialBookingFormData: BookingFormData = {
  eventType: null,
  eventName: "",
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  questionnaireResponses: [],
  selectedPackages: [],
  selectedAddons: [],
  paymentMethod: null,
  depositOnly: false,
  totalPrice: 0,
  depositAmount: 0,
};

// Context state interface
interface BookingState {
  currentStep: BookingStep;
  formData: BookingFormData;
  flowId: number | null;
  eventId: number | null;
  isLoading: boolean;
  error: string | null;
}

// Initial context state
const initialState: BookingState = {
  currentStep: "EVENT_TYPE",
  formData: initialBookingFormData,
  flowId: null,
  eventId: null,
  isLoading: false,
  error: null,
};

// Action types
type BookingAction =
  | { type: "SET_STEP"; payload: BookingStep }
  | { type: "SET_FLOW_ID"; payload: number }
  | { type: "SET_EVENT_ID"; payload: number }
  | { type: "SET_EVENT_TYPE"; payload: number }
  | { type: "SET_EVENT_NAME"; payload: string }
  | { type: "SET_DATE"; payload: { startDate: Date; endDate?: Date } }
  | { type: "SET_TIME"; payload: { startTime: string; endTime?: string } }
  | {
      type: "ADD_QUESTIONNAIRE_RESPONSE";
      payload: { fieldId: number; value: string };
    }
  | {
      type: "SET_SELECTED_PACKAGES";
      payload: { packageId: number; quantity: number }[];
    }
  | { type: "ADD_PACKAGE"; payload: { packageId: number; quantity: number } }
  | { type: "REMOVE_PACKAGE"; payload: number }
  | {
      type: "SET_SELECTED_ADDONS";
      payload: { addonId: number; quantity: number }[];
    }
  | { type: "ADD_ADDON"; payload: { addonId: number; quantity: number } }
  | { type: "REMOVE_ADDON"; payload: number }
  | {
      type: "SET_PAYMENT_METHOD";
      payload: "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER";
    }
  | { type: "SET_DEPOSIT_ONLY"; payload: boolean }
  | { type: "SET_TOTAL_PRICE"; payload: number }
  | { type: "SET_DEPOSIT_AMOUNT"; payload: number }
  | { type: "RESET_FORM" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Context type
interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}

// Create context
export const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

// Reducer function
function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_FLOW_ID":
      return { ...state, flowId: action.payload };
    case "SET_EVENT_ID":
      return { ...state, eventId: action.payload };
    case "SET_EVENT_TYPE":
      return {
        ...state,
        formData: {
          ...state.formData,
          eventType: action.payload,
        },
      };
    case "SET_EVENT_NAME":
      return {
        ...state,
        formData: {
          ...state.formData,
          eventName: action.payload,
        },
      };
    case "SET_DATE":
      return {
        ...state,
        formData: {
          ...state.formData,
          startDate: action.payload.startDate,
          endDate: action.payload.endDate || null,
        },
      };
    case "SET_TIME":
      return {
        ...state,
        formData: {
          ...state.formData,
          startTime: action.payload.startTime,
          endTime: action.payload.endTime || null,
        },
      };
    case "ADD_QUESTIONNAIRE_RESPONSE": {
      const responses = [...state.formData.questionnaireResponses];
      const existingIndex = responses.findIndex(
        (r) => r.fieldId === action.payload.fieldId
      );

      if (existingIndex >= 0) {
        responses[existingIndex] = action.payload;
      } else {
        responses.push(action.payload);
      }

      return {
        ...state,
        formData: {
          ...state.formData,
          questionnaireResponses: responses,
        },
      };
    }
    case "SET_SELECTED_PACKAGES":
      return {
        ...state,
        formData: {
          ...state.formData,
          selectedPackages: action.payload,
        },
      };
    case "ADD_PACKAGE": {
      const packages = [...state.formData.selectedPackages];
      const existingIndex = packages.findIndex(
        (p) => p.packageId === action.payload.packageId
      );

      if (existingIndex >= 0) {
        packages[existingIndex] = action.payload;
      } else {
        packages.push(action.payload);
      }

      return {
        ...state,
        formData: {
          ...state.formData,
          selectedPackages: packages,
        },
      };
    }
    case "REMOVE_PACKAGE": {
      return {
        ...state,
        formData: {
          ...state.formData,
          selectedPackages: state.formData.selectedPackages.filter(
            (p) => p.packageId !== action.payload
          ),
        },
      };
    }
    case "SET_SELECTED_ADDONS":
      return {
        ...state,
        formData: {
          ...state.formData,
          selectedAddons: action.payload,
        },
      };
    case "ADD_ADDON": {
      const addons = [...state.formData.selectedAddons];
      const existingIndex = addons.findIndex(
        (a) => a.addonId === action.payload.addonId
      );

      if (existingIndex >= 0) {
        addons[existingIndex] = action.payload;
      } else {
        addons.push(action.payload);
      }

      return {
        ...state,
        formData: {
          ...state.formData,
          selectedAddons: addons,
        },
      };
    }
    case "REMOVE_ADDON": {
      return {
        ...state,
        formData: {
          ...state.formData,
          selectedAddons: state.formData.selectedAddons.filter(
            (a) => a.addonId !== action.payload
          ),
        },
      };
    }
    case "SET_PAYMENT_METHOD":
      return {
        ...state,
        formData: {
          ...state.formData,
          paymentMethod: action.payload,
        },
      };
    case "SET_DEPOSIT_ONLY":
      return {
        ...state,
        formData: {
          ...state.formData,
          depositOnly: action.payload,
        },
      };
    case "SET_TOTAL_PRICE":
      return {
        ...state,
        formData: {
          ...state.formData,
          totalPrice: action.payload,
        },
      };
    case "SET_DEPOSIT_AMOUNT":
      return {
        ...state,
        formData: {
          ...state.formData,
          depositAmount: action.payload,
        },
      };
    case "RESET_FORM":
      return {
        ...initialState,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Provider component
export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};
