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
import Dashboard from "./pages/dashboard/Dashboard";
import { EventDetails, EventsList } from "./pages/events";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";
import MyProfile from "./pages/settings/accounts/MyProfile";
import Users from "./pages/settings/accounts/Users";
import Products from "./pages/settings/products/Products";
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
