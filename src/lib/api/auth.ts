import apiClient, { tokenStorage, resetAuthState } from './client';
import { ENDPOINTS } from '@/lib/constants';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  AuthTokens,
  ApiKey,
  ApiKeyCreateRequest,
  ApiKeyCreateResponse,
  ApiKeyListResponse,
  ApiKeyRenameRequest,
  ApiKeyRenameResponse,
  ApiKeyStatsResponse,
  MessageResponse,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UsageStatsResponse,
} from '@/types';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      ENDPOINTS.REGISTER,
      data
    );
    // Store tokens (async — refresh token set as httpOnly server-side)
    await tokenStorage.setTokens(response.data.tokens);
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, data);
    // Store tokens (async — refresh token set as httpOnly server-side)
    await tokenStorage.setTokens(response.data.tokens);
    return response.data;
  },

  /**
   * Logout - revoke token server-side then clear locally
   */
  logout: async (): Promise<void> => {
    resetAuthState();
    try {
      await apiClient.post(ENDPOINTS.LOGOUT);
    } catch {
      // Best-effort revocation — always clear tokens locally
    } finally {
      await tokenStorage.clearTokens();
    }
  },

  /**
   * Refresh access token (used by settings page; the 401 interceptor uses
   * the /api/auth/refresh proxy route directly)
   */
  refreshToken: async (): Promise<AuthTokens> => {
    const res = await fetch('/api/auth/refresh', { method: 'POST' });
    if (!res.ok) throw new Error('Token refresh failed');
    return res.json() as Promise<AuthTokens>;
  },

  /**
   * Get current user info
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Update current user's profile (name, email)
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.patch<User>(ENDPOINTS.ME, data);
    return response.data;
  },

  /**
   * Create a new API key
   */
  createApiKey: async (
    data: ApiKeyCreateRequest = {}
  ): Promise<ApiKeyCreateResponse> => {
    const response = await apiClient.post<ApiKeyCreateResponse>(
      ENDPOINTS.API_KEYS,
      data
    );
    return response.data;
  },

  /**
   * List all API keys
   */
  listApiKeys: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get<ApiKeyListResponse>(
      ENDPOINTS.API_KEYS
    );
    return response.data.api_keys;
  },

  /**
   * Revoke an API key
   */
  revokeApiKey: async (keyId: string): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(
      `${ENDPOINTS.API_KEYS}/${keyId}`
    );
    return response.data;
  },

  /**
   * Rename an API key
   */
  renameApiKey: async (
    keyId: string,
    data: ApiKeyRenameRequest
  ): Promise<ApiKeyRenameResponse> => {
    const response = await apiClient.patch<ApiKeyRenameResponse>(
      `${ENDPOINTS.API_KEYS}/${keyId}`,
      data
    );
    return response.data;
  },

  /**
   * Get usage stats for a specific API key
   */
  getApiKeyStats: async (keyId: string): Promise<ApiKeyStatsResponse> => {
    const response = await apiClient.get<ApiKeyStatsResponse>(
      ENDPOINTS.API_KEY_STATS(keyId)
    );
    return response.data;
  },

  /**
   * Resend email verification link to the current user
   */
  resendVerification: async (): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      ENDPOINTS.RESEND_VERIFICATION
    );
    return response.data;
  },

  /**
   * Verify email using token from verification email
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      ENDPOINTS.VERIFY_EMAIL,
      data
    );
    return response.data;
  },

  /**
   * Request a password reset email
   */
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      ENDPOINTS.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Reset password using token from reset email
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      ENDPOINTS.RESET_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Get usage stats for the current user
   */
  getUsageStats: async (): Promise<UsageStatsResponse> => {
    const response = await apiClient.get<UsageStatsResponse>(
      ENDPOINTS.USAGE_STATS
    );
    return response.data;
  },

  /**
   * Change the current user's password. Server revokes JWT on success.
   */
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      ENDPOINTS.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  /**
   * Delete the current user's account permanently
   */
  deleteAccount: async (): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(
      ENDPOINTS.DELETE_ACCOUNT
    );
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return tokenStorage.hasTokens();
  },
};
