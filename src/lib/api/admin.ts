import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, ENDPOINTS } from '@/lib/constants';
import type {
  AdminPlatformStats,
  AdminUserSummary,
  AdminUserDetail,
  AdminUpdateUser,
  AdminImpersonateResponse,
  AdminBatchSummary,
  AdminBatchDetail,
  AdminPaginatedResponse,
  AdminCostSummary,
  AdminDailyCostEntry,
  AdminUserCostRow,
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
};
