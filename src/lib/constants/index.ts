export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
  // Auth
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',

  // API Keys
  API_KEYS: '/api/v1/auth/api-keys',

  // Email flows
  VERIFY_EMAIL: '/api/v1/auth/verify-email',
  RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',

  // Usage & account
  USAGE_STATS: '/api/v1/usage/me/usage',
  CHANGE_PASSWORD: '/api/v1/auth/change-password',
  DELETE_ACCOUNT: '/api/v1/auth/me',

  // Translation
  TRANSLATE_IMAGE: '/api/v1/translate-image',
  BATCH_TRANSLATE: '/api/v1/batch/translate',
  BATCH_LIST: '/api/v1/batch',
  BATCH_STATUS: (batchId: string) => `/api/v1/batch/${batchId}`,
  BATCH_CANCEL: (batchId: string) => `/api/v1/batch/${batchId}/cancel`,
  BATCH_RETRY_IMAGE: (batchId: string, imageId: string) =>
    `/api/v1/batch/${batchId}/retry-image/${imageId}`,
  BATCH_STREAM: (batchId: string) => `/api/v1/batch/${batchId}/stream`,
  API_KEY_STATS: (keyId: string) => `/api/v1/auth/api-keys/${keyId}/stats`,
  TRANSLATE_HISTORY: '/api/v1/history',

  // Admin
  ADMIN_STATS: '/api/v1/admin/stats',
  ADMIN_USERS: '/api/v1/admin/users',
  ADMIN_USER: (userId: string) => `/api/v1/admin/users/${userId}`,
  ADMIN_USER_IMPERSONATE: (userId: string) =>
    `/api/v1/admin/users/${userId}/impersonate`,
  ADMIN_BATCHES: '/api/v1/admin/batches',
  ADMIN_BATCH: (batchId: string) => `/api/v1/admin/batches/${batchId}`,

  // Admin — Costs
  ADMIN_COSTS_SUMMARY: '/api/v1/admin/costs/summary',
  ADMIN_COSTS_DAILY: '/api/v1/admin/costs/daily',
  ADMIN_COSTS_BY_USER: '/api/v1/admin/costs/by-user',
} as const;

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_BATCH_SIZE = 20; // Match backend limit
export const MAX_TARGET_LANGUAGES = 10; // Match backend limit (11 languages available total)
export const MAX_CONCURRENT_BATCHES = 3; // Max active batches per user

// Polling intervals (ms)
export const BATCH_STATUS_POLL_INTERVAL = 2000;
export const BATCH_LIST_POLL_INTERVAL = 5000;

// OCR confidence threshold — regions below this are flagged as low-confidence
export const CONFIDENCE_THRESHOLD = 0.7;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
