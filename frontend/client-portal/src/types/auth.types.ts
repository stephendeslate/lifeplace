// frontend/client-portal/src/types/auth.types.ts

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
  register: (
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    confirmPassword: string,
    profileData?: UserProfile
  ) => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterCredentials {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  profile?: UserProfile;
}

export interface LoginResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
}

export interface RegisterResponse {
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

export interface AcceptInvitationData {
  password: string;
  confirm_password: string;
}

export interface AcceptInvitationResponse {
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
}
