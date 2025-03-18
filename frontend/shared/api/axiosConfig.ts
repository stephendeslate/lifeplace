import axios from "axios";

// Create a base axios instance that can be imported by both apps
const baseAPI = axios.create({
  baseURL:
    (typeof window !== "undefined" && (window as any).env?.REACT_APP_API_URL) ||
    "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
