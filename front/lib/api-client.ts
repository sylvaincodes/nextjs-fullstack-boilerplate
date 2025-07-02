/**
 * Enhanced API Client with CSRF Protection
 *
 * Provides a configured axios instance with automatic CSRF token handling.
 * All requests will include CSRF tokens when available.
 */

import axios, { type AxiosInstance } from "axios";

/**
 * Create an axios instance with CSRF protection
 */
export function createAPIClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // Include cookies for CSRF tokens
    timeout: 20000, // 10 second timeout
  });

  // Request interceptor to add CSRF token
  client.interceptors.request.use(
    async (config) => {
      // Skip CSRF for GET, HEAD, OPTIONS requests
      if (
        ["get", "head", "options"].includes(config.method?.toLowerCase() || "")
      ) {
        return config;
      }

      // Skip CSRF for webhook endpoints
      if (config.url?.includes("/webhooks/")) {
        return config;
      }

      try {
        // Try to get CSRF token from a global store or fetch it
        const csrfResponse = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/api/csrf",
          {
            withCredentials: true,
          }
        );

        if (csrfResponse.data.success && csrfResponse.data.token) {
          config.headers["x-csrf-token"] = csrfResponse.data.token;
        }
      } catch (error) {
        console.warn("Failed to get CSRF token for request:", error);
        // Continue with request even if CSRF token fetch fails
        // The server will handle the missing token appropriately
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle CSRF errors specifically
      if (
        error.response?.status === 403 &&
        error.response?.data?.error?.includes("CSRF")
      ) {
        console.error("CSRF validation failed. Page refresh may be required.");
        // You could trigger a page refresh or show a specific error message here
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Export a default configured client
export const apiClient = createAPIClient();
