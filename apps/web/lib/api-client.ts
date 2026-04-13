// apps/web/lib/api-client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://10.2.103.35:3001',
  withCredentials: true, // 👈 CRITICAL: This sends the session cookie to NestJS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle logout logic or redirect to login
      console.error('Unauthorized, redirecting...');
    }
    return Promise.reject(error);
  }
);