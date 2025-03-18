// This allows for environment variable substitution at runtime
export const config = {
  // In development, use the environment variable
  // In production, this placeholder will be replaced with the actual value
  API_URL:
    process.env.NODE_ENV === "production"
      ? "REACT_APP_API_URL_PLACEHOLDER"
      : process.env.REACT_APP_API_URL || "http://localhost:8000/",
};
