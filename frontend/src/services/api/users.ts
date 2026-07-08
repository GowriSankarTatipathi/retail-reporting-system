import { httpClient } from './client';
import { toPageableParams } from '@/utils/pagination';
import type { PageQuery, PageResponse, Role, User } from '@/types';

/** GET /api/v1/users - ADMIN only. */
export async function listUsers(params: PageQuery): Promise<PageResponse<User>> {
  const { data } = await httpClient.get<PageResponse<User>>('/users', {
    params: toPageableParams(params),
  });
  return data;
}

/** PATCH /api/v1/users/{id}/role - ADMIN only. */
export async function updateUserRole(id: number, role: Role): Promise<User> {
  const { data } = await httpClient.patch<User>(`/users/${id}/role`, { role });
  return data;
}

/** PATCH /api/v1/users/{id}/enabled?enabled=true|false - ADMIN only. */
export async function setUserEnabled(id: number, enabled: boolean): Promise<User> {
  const { data } = await httpClient.patch<User>(`/users/${id}/enabled`, null, {
    params: { enabled },
  });
  return data;
}
