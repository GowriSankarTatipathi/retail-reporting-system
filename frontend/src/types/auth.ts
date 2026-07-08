/** Mirrors domain/entity/Role.java - least to most privileged. */
export type Role = 'VIEWER' | 'ANALYST' | 'MANAGER' | 'ADMIN';

export const ROLES: Role[] = ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'];

/** Mirrors dto/response/UserResponse.java. Never includes a password field. */
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

/** Mirrors dto/response/AuthResponse.java. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: User;
}

/** Mirrors dto/request/LoginRequest.java. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors dto/request/RegisterRequest.java. Always creates a VIEWER account server-side. */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

/** Mirrors dto/request/RefreshRequest.java. */
export interface RefreshRequest {
  refreshToken: string;
}

/** Mirrors dto/request/UpdateProfileRequest.java. */
export interface UpdateProfileRequest {
  fullName: string;
}

/** Mirrors dto/request/ChangePasswordRequest.java. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Mirrors dto/request/UpdateRoleRequest.java (ADMIN only, via /users/{id}/role). */
export interface UpdateRoleRequest {
  role: Role;
}
