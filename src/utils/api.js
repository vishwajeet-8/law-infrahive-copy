// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_NODE_SERVER, // or process.env.REACT_APP_API_BASE_URL for CRA
//   // withCredentials: true, // if you're using cookies/sessions
//   // timeout: 10000, // optional timeout
// });

// export default api;

import axios from "axios";
// Removed: import { getToken, setToken, clearToken } from './storage';
// Using localStorage directly as requested.

const API_TOKEN_KEY = "token"; // Key used in localStorage for the JWT

const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_SERVER,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // only if you are using cookies/sessions
});

// --- 1. REQUEST INTERCEPTOR: Attach the Token ---
// Before sending a request, check if a token exists and attach it.
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage
    const token = localStorage.getItem(API_TOKEN_KEY);

    // Attach the current token to the Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. RESPONSE INTERCEPTOR: Handle Refresh and 401 Expiration ---
// After receiving a response, check for a new token or a 401 error.
api.interceptors.response.use(
  (response) => {
    // A. Token Refresh: Check for the custom header sent by the server
    const newToken = response.headers["x-new-token"];
    if (newToken) {
      // Set token directly in localStorage
      localStorage.setItem(API_TOKEN_KEY, newToken);
      console.log("Axios: Token successfully refreshed and saved.");
    }

    return response;
  },
  (error) => {
    // B. Handle 401 Unauthorized (Session Expired due to Inactivity or Absolute Timeout)
    if (error.response && error.response.status === 401) {
      console.error(
        "Axios: Session expired (401 Unauthorized). Clearing token."
      );

      // Clear the invalid token and user data from storage
      localStorage.removeItem(API_TOKEN_KEY);
      localStorage.removeItem("user"); // Clear associated user data too, for consistency with handleLogout

      // Redirect the user to the login page immediately
      window.location.replace("/login?expired=true");

      // Prevent other parts of the app from trying to process the failed request
      return Promise.reject(new Error("Session expired. Redirected to login."));
    }

    return Promise.reject(error);
  }
);

export default api;
