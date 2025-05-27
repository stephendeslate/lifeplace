// frontend/admin-crm/src/App.tsx
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ToastProvider from "./components/common/ToastProvider";
import { AuthProvider } from "./contexts/AuthContext";
import useAuth from "./hooks/useAuth";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import Login from "./pages/auth/Login";
import { ClientDetails, ClientsList } from "./pages/clients";
import { ContractDetails } from "./pages/contracts";
import Dashboard from "./pages/dashboard/Dashboard";
import {
  EventDetails,
  EventQuoteDetails,
  EventQuotesList,
  EventsCalendar,
  EventsList,
} from "./pages/events";
import { PaymentDetails, PaymentsList } from "./pages/payments";
import Profile from "./pages/profile/Profile";
import MyProfile from "./pages/settings/accounts/MyProfile";
import Users from "./pages/settings/accounts/Users";
import { BookingFlows, EventTypes } from "./pages/settings/bookingflow";
import {
  ContractTemplateDetails,
  ContractTemplates,
} from "./pages/settings/contracts";
import NotificationManagement from "./pages/settings/notifications/NotificationManagement";
import NotificationPreferences from "./pages/settings/notifications/NotificationPreferences";
import NotificationTemplates from "./pages/settings/notifications/NotificationTemplates";
import Billing from "./pages/settings/payments/Billing";
import PaymentGateways from "./pages/settings/payments/PaymentGateways";
import PaymentMethods from "./pages/settings/payments/PaymentMethods";
import TaxRates from "./pages/settings/payments/TaxRates";
import Products from "./pages/settings/products/Products";
import {
  QuestionnaireDetails,
  Questionnaires,
} from "./pages/settings/questionnaires";
import { QuoteTemplateDetails, QuoteTemplates } from "./pages/settings/sales";
import Settings from "./pages/settings/Settings";
import EmailTemplates from "./pages/settings/templates/EmailTemplates";
import Workflows from "./pages/settings/workflows/Workflows";
import theme from "./theme";
import queryClient from "./utils/queryClient";

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // You could add a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// App component with auth provider
const AppWithAuth: React.FC = () => {
  return (
    <Routes>
      {/* Public routes - these don't require authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/accept-invitation/:id" element={<AcceptInvitation />} />

      {/* Protected routes - these require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Event routes */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/edit"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/calendar"
        element={
          <ProtectedRoute>
            <EventsCalendar />
          </ProtectedRoute>
        }
      />

      {/* Event-nested quote routes */}
      <Route
        path="/events/:id/quotes"
        element={
          <ProtectedRoute>
            <EventQuotesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/quotes/:quoteId"
        element={
          <ProtectedRoute>
            <EventQuoteDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/quotes/:quoteId/edit"
        element={
          <ProtectedRoute>
            <EventQuoteDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/quotes/new"
        element={
          <ProtectedRoute>
            <EventQuoteDetails />
          </ProtectedRoute>
        }
      />

      {/* Client routes */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ClientDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id/edit"
        element={
          <ProtectedRoute>
            <ClientDetails />
          </ProtectedRoute>
        }
      />

      {/* Payment routes */}
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/:id"
        element={
          <ProtectedRoute>
            <PaymentDetails />
          </ProtectedRoute>
        }
      />

      {/* Contract routes */}
      <Route
        path="/contracts/:id"
        element={
          <ProtectedRoute>
            <ContractDetails />
          </ProtectedRoute>
        }
      />

      {/* Profile route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Settings routes */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/accounts/my-profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/accounts/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/templates/email-templates"
        element={
          <ProtectedRoute>
            <EmailTemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/workflows"
        element={
          <ProtectedRoute>
            <Workflows />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/questionnaires"
        element={
          <ProtectedRoute>
            <Questionnaires />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/questionnaires/:id"
        element={
          <ProtectedRoute>
            <QuestionnaireDetails />
          </ProtectedRoute>
        }
      />

      {/* Settings routes for contracts */}
      <Route
        path="/settings/contracts/templates"
        element={
          <ProtectedRoute>
            <ContractTemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/contracts/templates/:id"
        element={
          <ProtectedRoute>
            <ContractTemplateDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/contracts/templates/:id/edit"
        element={
          <ProtectedRoute>
            <ContractTemplateDetails />
          </ProtectedRoute>
        }
      />

      {/* Settings routes for sales/quote templates (not event-specific) */}
      <Route
        path="/settings/sales/quote-templates"
        element={
          <ProtectedRoute>
            <QuoteTemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/sales/quote-templates/:id"
        element={
          <ProtectedRoute>
            <QuoteTemplateDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/sales/quote-templates/:id/edit"
        element={
          <ProtectedRoute>
            <QuoteTemplateDetails />
          </ProtectedRoute>
        }
      />

      {/* Payment settings routes */}
      <Route
        path="/settings/payments/payment-methods"
        element={
          <ProtectedRoute>
            <PaymentMethods />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/payments/payment-gateways"
        element={
          <ProtectedRoute>
            <PaymentGateways />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/payments/tax-rates"
        element={
          <ProtectedRoute>
            <TaxRates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/payments/billing"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />

      {/* Notification settings routes */}
      <Route
        path="/settings/notifications/notification-settings"
        element={
          <ProtectedRoute>
            <NotificationPreferences />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications/management"
        element={
          <ProtectedRoute>
            <NotificationManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications/templates"
        element={
          <ProtectedRoute>
            <NotificationTemplates />
          </ProtectedRoute>
        }
      />

      {/* Booking flow settings routes */}
      <Route
        path="/settings/bookingflow/flows"
        element={
          <ProtectedRoute>
            <BookingFlows />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/bookingflow/event-types"
        element={
          <ProtectedRoute>
            <EventTypes />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Router>
              <AuthProvider>
                <AppWithAuth />
              </AuthProvider>
            </Router>
          </ToastProvider>
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
