// Environment variables for the frontend
// All variables must be prefixed with VITE_ to be accessible

export const API_URL = import.meta.env.VITE_API_URL || '';
export const ENVIRONMENT = import.meta.env.MODE;
export const IS_PRODUCTION = ENVIRONMENT === 'production';
export const API_BASE_URL = IS_PRODUCTION 
  ? (import.meta.env.VITE_API_URL || '') // Use configured API URL in production
  : ''; // Empty string means same-origin in development
