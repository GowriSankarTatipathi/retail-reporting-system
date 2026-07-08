import type { Role } from '@/types';

/**
 * Mirrors the @PreAuthorize annotations on the backend's service layer
 * exactly (CategoryServiceImpl, ProductServiceImpl, CustomerServiceImpl,
 * OrderServiceImpl) - used only to decide which buttons to show. The API
 * re-validates every request regardless, so a mismatch here is a UX bug,
 * not a security hole.
 */
export const WRITE_ROLES: Role[] = ['ADMIN', 'MANAGER'];
export const DELETE_ROLES: Role[] = ['ADMIN'];

export function canWrite(role: Role | undefined): boolean {
  return !!role && WRITE_ROLES.includes(role);
}

export function canDelete(role: Role | undefined): boolean {
  return !!role && DELETE_ROLES.includes(role);
}
