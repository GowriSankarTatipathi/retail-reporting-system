import { httpClient } from './client';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@/types';

/** POST /api/v1/auth/register - always creates a VIEWER account. */
export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/register', request);
  return data;
}

/** POST /api/v1/auth/login */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/login', request);
  return data;
}

/** POST /api/v1/auth/refresh - normally called internally by the axios interceptor. */
export async function refresh(request: RefreshRequest): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/refresh', request);
  return data;
}

/** GET /api/v1/auth/me */
export async function getCurrentUser(): Promise<User> {
  const { data } = await httpClient.get<User>('/auth/me');
  return data;
}

/** PATCH /api/v1/auth/me - only the display name is editable here. */
export async function updateProfile(request: UpdateProfileRequest): Promise<User> {
  const { data } = await httpClient.patch<User>('/auth/me', request);
  return data;
}

/** POST /api/v1/auth/change-password - 204 No Content on success. */
export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await httpClient.post('/auth/change-password', request);
}
