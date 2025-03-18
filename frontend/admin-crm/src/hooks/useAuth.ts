// frontend/admin-crm/src/hooks/useAuth.ts
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import { AuthContextType } from "../types/auth.types";

/**
 * Custom hook to use auth context
 */
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
