// Common types shared between admin and client apps

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "client";
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
