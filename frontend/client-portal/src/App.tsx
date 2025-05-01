// frontend/client-portal/src/App.tsx
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
import Register from "./pages/auth/Register";
import BookingPage from "./pages/booking/BookingPage";
import HomePage from "./pages/home/HomePage";
import Profile from "./pages/profile/Profile";
import theme from "./theme";

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
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/accept-invitation/:id" element={<AcceptInvitation />} />

      {/* Protected routes - these require authentication */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:eventTypeId"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ToastProvider>
          <Router>
            <AuthProvider>
              <AppWithAuth />
            </AuthProvider>
          </Router>
        </ToastProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
