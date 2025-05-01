// frontend/admin-crm/src/types/auth.types.ts

export interface UserProfile {
  phone?: string;
  company?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role: "ADMIN" | "CLIENT";
  profile?: UserProfile;
  date_joined: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}
