// =============================================================================
// User & Authentication Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
  api_key: string;
  tokens: AuthTokens;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// =============================================================================
// API Key Types
// =============================================================================

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ApiKeyCreateRequest {
  name?: string;
  expires_in_days?: number;
}

export interface ApiKeyCreateResponse {
  success: boolean;
  api_key: ApiKey;
  key: string;
}

export interface ApiKeyListResponse {
  success: boolean;
  api_keys: ApiKey[];
}

export interface ApiKeyRenameRequest {
  name: string;
}

export interface ApiKeyRenameResponse {
  success: boolean;
  id: string;
  name: string;
}

export interface ApiKeyStatsResponse {
  key_id: string;
  total_images: number;
  total_translations: number;
  total_requests: number;
  last_used_at: string | null;
}

// =============================================================================
// Translation Types
// =============================================================================

export interface TranslateResponse {
  success: boolean;
  original_image_url: string;
  translated_image_url: string;
  clean_image_url: string | null;
  mask_url: string | null;
  regions: TextRegion[];
  target_lang: string;
  detected_source_lang: string | null;
  processing_time_ms: number;
}

export interface TextRegion {
  id: string;
  original_text: string;
  translated_text: string;
  bounding_box: BoundingBox;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TranslateErrorResponse {
  success: false;
  error: string;
  step: string;
  message: string;
}

// =============================================================================
// Batch Translation Types
// =============================================================================

export type BatchStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'partially_completed'
  | 'failed'
  | 'cancelled';

export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TranslationOutput {
  target_lang: string;
  translated_image_url: string | null;
  status: ImageStatus;
  error: string | null;
}

export interface ImageResult {
  image_id: string;
  original_filename: string;
  status: ImageStatus;
  original_image_url: string | null;
  translations: TranslationOutput[];
  error: string | null;
}

export interface BatchCreateRequest {
  files: File[];
  source_language?: string;
  target_languages: string;
  exclude_text?: string;
  webhook_url?: string;
}

export interface BatchCreateResponse {
  success: boolean;
  batch_id: string;
  status: BatchStatus;
  total_images: number;
  target_languages: string[];
  message: string;
}

export interface BatchStatusResponse {
  success: boolean;
  batch_id: string;
  status: BatchStatus;
  total_images: number;
  target_languages: string[];
  completed_count: number;
  failed_count: number;
  pending_count: number;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
  images: ImageResult[];
}

export interface BatchCancelResponse {
  success: boolean;
  batch_id: string;
  status: BatchStatus;
  message: string;
}

export interface SingleTranslationRecord {
  id: string;
  original_image_url: string;
  translated_image_url: string;
  source_lang: string | null;
  target_lang: string;
  processing_time_ms: number;
  is_expired: boolean;
  created_at: string;
}

export interface TranslationHistoryResponse {
  success: boolean;
  items: SingleTranslationRecord[];
  total: number;
  limit: number;
  offset: number;
}

// =============================================================================
// Usage Stats Types
// =============================================================================

export interface UsagePeriod {
  images_processed: number;
  translations_count: number;
  batches_run: number;
}

export interface UsageQuota {
  tier: string;
  images_limit: number | null;
  translations_limit: number | null;
  batches_limit: number | null;
  images_used: number;
  translations_used: number;
  batches_used: number;
}

export interface UsageStatsResponse {
  current_month: UsagePeriod;
  last_month: UsagePeriod;
  all_time: UsagePeriod;
  quota: UsageQuota;
  most_used_languages: string[];
  last_activity: string | null;
}

// =============================================================================
// Admin Types
// =============================================================================

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string | null;
  tier: 'free' | 'pro' | 'enterprise';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  updated_at: string;
  api_key_count: number;
  total_batches: number;
  total_images_processed: number;
  total_translations: number;
  last_activity: string | null;
}

export interface AdminUpdateUser {
  tier?: 'free' | 'pro' | 'enterprise';
  is_active?: boolean;
  is_verified?: boolean;
  name?: string;
}

export interface AdminImpersonateResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  expires_in_seconds: number;
}

export interface AdminResendVerificationResponse {
  queued: boolean;
  detail: string;
}

export interface AdminApiKey {
  id: string;
  name: string;
  prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AdminQueuedResponse {
  queued: boolean;
  detail: string;
}

export interface AdminBatchImage {
  id: string;
  original_filename: string;
  status: string;
  error: string | null;
  translation_count: number;
  created_at: string;
}

export interface AdminBatchSummary {
  id: string;
  tenant_id: string;
  status: string;
  source_language: string;
  target_languages: string[];
  total_images: number;
  completed_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminBatchDetail extends AdminBatchSummary {
  webhook_url: string | null;
  images: AdminBatchImage[];
}

export interface TierBreakdown {
  free: number;
  pro: number;
  enterprise: number;
}

export interface AdminPlatformStats {
  total_users: number;
  active_users: number;
  verified_users: number;
  new_users_today: number;
  new_users_this_month: number;
  users_by_tier: TierBreakdown;
  total_batches: number;
  batches_today: number;
  pending_batches: number;
  processing_batches: number;
  failed_batches_today: number;
  total_images_processed: number;
  total_translations: number;
  images_processed_today: number;
  translations_today: number;
  ocr_calls_today: number;
  translate_calls_today: number;
  inpaint_calls_today: number;
}

export interface AdminPaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  items: T[];
}

export interface AdminVisionCostDetail {
  calls: number;
  cost_usd: number;
}

export interface AdminOpenAICostDetail {
  cost_usd: number | null;
  error?: string;
}

export interface AdminReplicateCostDetail {
  cost_usd: number | null;
  predictions: number;
  total_seconds?: number;
  error?: string;
}

export interface AdminCostSummary {
  period_start: string;
  period_end: string;
  total_cost_usd: number;
  vision: AdminVisionCostDetail;
  openai: AdminOpenAICostDetail;
  replicate: AdminReplicateCostDetail;
}

export interface AdminDailyCostEntry {
  date: string;
  vision_cost_usd: number;
  openai_cost_usd: number | null;
  replicate_cost_usd: number | null;
  total_cost_usd: number;
}

export interface AdminUserCostRow {
  user_id: string;
  images_processed: number;
  ocr_calls: number;
  translate_calls: number;
  inpaint_calls: number;
  vision_cost_usd: number;
}

export interface ServiceHealthResult {
  name: string;
  reachable: boolean;
  latency_ms: number | null;
  error?: string;
}

export interface AdminHealthServicesResponse {
  checked_at: string;
  services: ServiceHealthResult[];
}

export interface AdminCleanupResult {
  ran_at: string;
  batches_expired: number;
  singles_expired: number;
  triggered_by: string;
}

export interface AdminTenantFilesWipeResponse {
  tenant_id: string;
  files_deleted: number;
  errors: number;
}

export interface AppHealthResponse {
  status: string;
  broker: {
    status: string;
    reachable: boolean;
    error?: string;
  };
}

// =============================================================================
// Common Types
// =============================================================================

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  detail?: string;
}

// =============================================================================
// Language Types
// =============================================================================

export interface Language {
  code: string;
  name: string;
}

// Languages supported by backend - MUST match backend's app/core/languages.py
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
];
