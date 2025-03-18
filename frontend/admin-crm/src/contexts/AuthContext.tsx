// frontend/admin-crm/src/contexts/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../apis/auth.api";
import { AuthContextType, AuthState, User } from "../types/auth.types";
import {
  clearAuthData,
  getAccessToken,
  getUser,
  setTokens,
  setUser,
} from "../utils/storage";

// Initial state
const initialState: AuthState = {
  isAuthenticated: !!getAccessToken(),
  isLoading: true,
  user: getUser(),
  error: null,
};

// Auth actions
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "UPDATE_USER"; payload: User };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      // Skip if no token - this is normal before login, not an error
      if (!getAccessToken()) {
        dispatch({ type: "AUTH_LOGOUT" }); // Just set as logged out without error
        return;
      }

      dispatch({ type: "AUTH_START" });

      try {
        const userData = await authApi.getCurrentUser();
        dispatch({ type: "AUTH_SUCCESS", payload: userData });
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
        dispatch({ type: "AUTH_FAILURE", payload: "Failed to authenticate" });
        clearAuthData();
      }
    };

    loadUser();
  }, []);

  // Login handler
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      dispatch({ type: "AUTH_START" });

      try {
        const response = await authApi.login({
          email,
          password,
          remember_me: rememberMe,
        });

        // Save tokens and user data
        setTokens(response.tokens.access, response.tokens.refresh);
        setUser(response.user);

        dispatch({ type: "AUTH_SUCCESS", payload: response.user });

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || "Failed to login";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      }
    },
    [navigate]
  );

  // Logout handler
  const logout = useCallback(() => {
    clearAuthData();
    dispatch({ type: "AUTH_LOGOUT" });
    navigate("/login");
  }, [navigate]);

  // Update user handler
  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    dispatch({ type: "UPDATE_USER", payload: userData });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
