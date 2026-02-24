import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, ENDPOINTS } from '@/lib/constants';
import type {
  AdminPlatformStats,
  AdminUserSummary,
  AdminUserDetail,
  AdminUpdateUser,
  AdminImpersonateResponse,
  AdminResendVerificationResponse,
  AdminApiKey,
  AdminQueuedResponse,
  AdminBatchSummary,
  AdminBatchDetail,
  AdminPaginatedResponse,
  AdminCostSummary,
  AdminDailyCostEntry,
  AdminUserCostRow,
  AdminHealthServicesResponse,
  AdminCleanupResult,
  AdminTenantFilesWipeResponse,
  AppHealthResponse,
} from '@/types';

const ADMIN_KEY_STORAGE = 'admin_secret_key';

export const adminKeyStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_KEY_STORAGE);
  },
  set: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  },
  has: (): boolean => !!adminKeyStorage.get(),
};

// Separate axios instance — no JWT refresh interceptors
const adminClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

adminClient.interceptors.request.use(config => {
  const key = adminKeyStorage.get();
  if (key && config.headers) {
    config.headers['X-Admin-Key'] = key;
  }
  return config;
});

export interface AdminUsersParams {
  tier?: string;
  is_active?: boolean;
  is_verified?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AdminBatchesParams {
  tenant_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminPlatformStats> => {
    const res = await adminClient.get<AdminPlatformStats>(
      ENDPOINTS.ADMIN_STATS
    );
    return res.data;
  },

  listUsers: async (
    params: AdminUsersParams = {}
  ): Promise<AdminPaginatedResponse<AdminUserSummary>> => {
    const res = await adminClient.get<
      AdminPaginatedResponse<AdminUserSummary> | AdminUserSummary[]
    >(ENDPOINTS.ADMIN_USERS, { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { items: data, total: data.length, limit: data.length, offset: 0 };
    }
    return data;
  },

  getUser: async (userId: string): Promise<AdminUserDetail> => {
    const res = await adminClient.get<AdminUserDetail>(
      ENDPOINTS.ADMIN_USER(userId)
    );
    return res.data;
  },

  updateUser: async (
    userId: string,
    data: AdminUpdateUser
  ): Promise<AdminUserDetail> => {
    const res = await adminClient.patch<AdminUserDetail>(
      ENDPOINTS.ADMIN_USER(userId),
      data
    );
    return res.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await adminClient.delete(ENDPOINTS.ADMIN_USER(userId));
  },

  impersonateUser: async (
    userId: string
  ): Promise<AdminImpersonateResponse> => {
    const res = await adminClient.post<AdminImpersonateResponse>(
      ENDPOINTS.ADMIN_USER_IMPERSONATE(userId)
    );
    return res.data;
  },

  resendVerification: async (
    userId: string
  ): Promise<AdminResendVerificationResponse> => {
    const res = await adminClient.post<AdminResendVerificationResponse>(
      ENDPOINTS.ADMIN_USER_RESEND_VERIFICATION(userId)
    );
    return res.data;
  },

  getUserApiKeys: async (userId: string): Promise<AdminApiKey[]> => {
    const res = await adminClient.get<AdminApiKey[]>(
      ENDPOINTS.ADMIN_USER_API_KEYS(userId)
    );
    return res.data;
  },

  revokeUserApiKey: async (userId: string, keyId: string): Promise<void> => {
    await adminClient.delete(ENDPOINTS.ADMIN_USER_API_KEY(userId, keyId));
  },

  listBatches: async (
    params: AdminBatchesParams = {}
  ): Promise<AdminPaginatedResponse<AdminBatchSummary>> => {
    const res = await adminClient.get<
      AdminPaginatedResponse<AdminBatchSummary> | AdminBatchSummary[]
    >(ENDPOINTS.ADMIN_BATCHES, { params });
    const data = res.data;
    if (Array.isArray(data)) {
      return { items: data, total: data.length, limit: data.length, offset: 0 };
    }
    return data;
  },

  getBatch: async (batchId: string): Promise<AdminBatchDetail> => {
    const res = await adminClient.get<AdminBatchDetail>(
      ENDPOINTS.ADMIN_BATCH(batchId)
    );
    return res.data;
  },

  deleteBatch: async (batchId: string): Promise<void> => {
    await adminClient.delete(ENDPOINTS.ADMIN_BATCH(batchId));
  },

  cancelBatch: async (batchId: string): Promise<AdminBatchSummary> => {
    const res = await adminClient.post<AdminBatchSummary>(
      ENDPOINTS.ADMIN_BATCH_CANCEL(batchId)
    );
    return res.data;
  },

  retryBatch: async (batchId: string): Promise<AdminQueuedResponse> => {
    const res = await adminClient.post<AdminQueuedResponse>(
      ENDPOINTS.ADMIN_BATCH_RETRY(batchId)
    );
    return res.data;
  },

  resumeStuckBatches: async (): Promise<AdminQueuedResponse> => {
    const res = await adminClient.post<AdminQueuedResponse>(
      ENDPOINTS.ADMIN_BATCHES_RESUME_STUCK
    );
    return res.data;
  },

  retryImage: async (imageId: string): Promise<AdminQueuedResponse> => {
    const res = await adminClient.post<AdminQueuedResponse>(
      ENDPOINTS.ADMIN_IMAGE_RETRY(imageId)
    );
    return res.data;
  },

  getCostSummary: async (
    period: 'today' | 'week' | 'month' | 'alltime' = 'month'
  ): Promise<AdminCostSummary> => {
    const res = await adminClient.get<AdminCostSummary>(
      ENDPOINTS.ADMIN_COSTS_SUMMARY,
      { params: { period } }
    );
    return res.data;
  },

  getCostDaily: async (days: number = 30): Promise<AdminDailyCostEntry[]> => {
    const res = await adminClient.get<AdminDailyCostEntry[]>(
      ENDPOINTS.ADMIN_COSTS_DAILY,
      { params: { days } }
    );
    return res.data;
  },

  getCostByUser: async (
    period: 'today' | 'week' | 'month' | 'alltime' = 'month'
  ): Promise<AdminUserCostRow[]> => {
    const res = await adminClient.get<AdminUserCostRow[]>(
      ENDPOINTS.ADMIN_COSTS_BY_USER,
      { params: { period } }
    );
    return res.data;
  },

  getHealth: async (): Promise<AppHealthResponse> => {
    const res = await adminClient.get<AppHealthResponse>(
      ENDPOINTS.ADMIN_HEALTH
    );
    return res.data;
  },

  getHealthServices: async (): Promise<AdminHealthServicesResponse> => {
    const res = await adminClient.get<AdminHealthServicesResponse>(
      ENDPOINTS.ADMIN_HEALTH_SERVICES
    );
    return res.data;
  },

  runCleanup: async (): Promise<AdminCleanupResult> => {
    const res = await adminClient.post<AdminCleanupResult>(
      ENDPOINTS.ADMIN_CLEANUP_RUN
    );
    return res.data;
  },

  getLastCleanupRun: async (): Promise<AdminCleanupResult | null> => {
    const res = await adminClient.get<AdminCleanupResult | null>(
      ENDPOINTS.ADMIN_CLEANUP_LAST_RUN
    );
    return res.data;
  },

  wipeTenantFiles: async (
    tenantId: string
  ): Promise<AdminTenantFilesWipeResponse> => {
    const res = await adminClient.delete<AdminTenantFilesWipeResponse>(
      ENDPOINTS.ADMIN_TENANT_FILES(tenantId)
    );
    return res.data;
  },
};
