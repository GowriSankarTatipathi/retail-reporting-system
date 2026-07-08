import { httpClient } from './client';
import type { Category, CategoryRequest } from '@/types';

/** GET /api/v1/categories */
export async function listCategories(): Promise<Category[]> {
  const { data } = await httpClient.get<Category[]>('/categories');
  return data;
}

/** GET /api/v1/categories/{id} */
export async function getCategory(id: number): Promise<Category> {
  const { data } = await httpClient.get<Category>(`/categories/${id}`);
  return data;
}

/** POST /api/v1/categories - ADMIN, MANAGER */
export async function createCategory(request: CategoryRequest): Promise<Category> {
  const { data } = await httpClient.post<Category>('/categories', request);
  return data;
}

/** PUT /api/v1/categories/{id} - ADMIN, MANAGER */
export async function updateCategory(id: number, request: CategoryRequest): Promise<Category> {
  const { data } = await httpClient.put<Category>(`/categories/${id}`, request);
  return data;
}

/** DELETE /api/v1/categories/{id} - ADMIN only; fails (409) if products reference it. */
export async function deleteCategory(id: number): Promise<void> {
  await httpClient.delete(`/categories/${id}`);
}
